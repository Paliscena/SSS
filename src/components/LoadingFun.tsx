import { useEffect, useState } from 'react'
import { StudioSmiley } from './StudioSmiley'

export function LoadingFun({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(0)
  const [mood, setMood] = useState(0)
  useEffect(() => {
    const started = performance.now()
    let finished = false
    let finishTimer: ReturnType<typeof setTimeout> | undefined
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setInterval(() => {
      const elapsed = performance.now()-started
      setMood(reduced ? 0 : Math.floor(elapsed/300)%3)
      const video=document.querySelector<HTMLVideoElement>('.landing-films video.is-front')
      const glass=document.querySelector<HTMLElement>('.liquid-glass-surface')
      const ready=document.fonts.status==='loaded' && (!video || reduced || video.readyState>=2) && (!glass || reduced || glass.dataset.liquidReady==='true' || elapsed>2500)
      // This is a readiness indicator, not a byte-download percentage.
      if(!finished && ((ready && elapsed>1200) || elapsed>6000)) {
        finished=true; setProgress(100); clearInterval(timer)
        finishTimer=setTimeout(onReady,reduced ? 0 : 220)
      } else if(!finished) setProgress(Math.min(90,elapsed/1200*75))
    },100)
    return () => { clearInterval(timer); clearTimeout(finishTimer) }
  },[onReady])
  return <div className={`fun-loader${progress===100 ? ' is-ready' : ''}`} role="status" aria-live="polite" aria-label="Loading the fun">
    <StudioSmiley mood={mood} /><p>loading the fun</p>
    <div className="fun-loading-track" aria-hidden="true"><span style={{transform:`scaleX(${progress/100})`}} /></div>
  </div>
}
