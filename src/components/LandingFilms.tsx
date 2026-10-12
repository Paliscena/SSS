import { useEffect, useRef } from 'react'

export function LandingFilms() {
  const player = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video=player.current
    const media=matchMedia('(prefers-reduced-motion: reduce)')
    const sync=() => {
      if(!video) return
      if(media.matches || document.hidden) video.pause()
      else void video.play().catch(() => {})
    }
    sync(); media.addEventListener('change',sync); document.addEventListener('visibilitychange',sync)
    return () => { video?.pause(); media.removeEventListener('change',sync); document.removeEventListener('visibilitychange',sync) }
  },[])
  return <div className="landing-films" aria-hidden="true"><video ref={player} className="is-front" src="https://media.superstupidstudios.com/landing-road-game.mp4" crossOrigin="anonymous" muted loop playsInline preload="auto" poster="/media/road-game-background-poster.jpg" /></div>
}
