import { useEffect, useRef, useState } from 'react'
import { StudioSmiley } from './StudioSmiley'

export function MouseSmiley() {
  const face=useRef<HTMLDivElement>(null)
  const [mood,setMood]=useState(0)
  useEffect(() => {
    const node=face.current
    if(!node) return
    const allowed=matchMedia('(pointer:fine) and (prefers-reduced-motion: no-preference)')
    let frame=0, previous=0, visible=false
    const current={x:0,y:0}, target={x:0,y:0}
    const draw=(time:number) => {
      frame=0
      const dt=Math.min(64,time-(previous || time-16)); previous=time
      const blend=1-Math.exp(-dt/170)
      current.x+=(target.x-current.x)*blend; current.y+=(target.y-current.y)*blend
      node.style.transform=`translate3d(${current.x}px,${current.y}px,0)`
      if(Math.hypot(current.x-target.x,current.y-target.y)>.3) frame=requestAnimationFrame(draw)
      else previous=0
    }
    const hide=() => { visible=false; node.style.opacity='0'; document.body.classList.remove('has-smiley-trail'); cancelAnimationFrame(frame); frame=0; previous=0 }
    const move=(event:PointerEvent) => {
      if(!allowed.matches || event.pointerType!=='mouse') return
      target.x=Math.max(8,Math.min(innerWidth-64,event.clientX+24))
      target.y=Math.max(8,Math.min(innerHeight-64,event.clientY+28))
      if(!visible) { current.x=target.x; current.y=target.y; visible=true; node.style.opacity='1'; document.body.classList.add('has-smiley-trail') }
      if(!frame) frame=requestAnimationFrame(draw)
    }
    const cycle=setInterval(() => { if(visible && !document.hidden) setMood(value => (value+1)%3) },600)
    window.addEventListener('pointermove',move,{passive:true}); document.addEventListener('pointerleave',hide); allowed.addEventListener('change',hide)
    return () => { hide(); clearInterval(cycle); window.removeEventListener('pointermove',move); document.removeEventListener('pointerleave',hide); allowed.removeEventListener('change',hide) }
  },[])
  return <div ref={face} className="mouse-smiley" aria-hidden="true"><StudioSmiley mood={mood} /></div>
}
