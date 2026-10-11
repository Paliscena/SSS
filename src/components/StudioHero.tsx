import { useEffect, useRef, useState } from 'react'
import { SlidingSmiley } from './SlidingSmiley'
import { StudioSmiley } from './StudioSmiley'
import { studio } from '../data/studio'

const replies = ['Are we having fun yet?', 'Yes. Keep going.', 'Now we’re getting somewhere.', 'Good. Let’s make something.']

export function StudioHero() {
  const [reply, setReply] = useState(0)
  const title = useRef<HTMLHeadingElement>(null)
  const distortion = useRef<SVGFEDisplacementMapElement>(null)
  useEffect(() => {
    const node = title.current
    if (!node) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const letters = [...node.querySelectorAll<HTMLElement>('.goo-letter')]
    let frame = 0, strength = 0, active = false, x = 0, y = 0
    const reset = () => {
      active = false; strength = 0; cancelAnimationFrame(frame); frame = 0
      distortion.current?.setAttribute('scale', '0')
      letters.forEach(letter => letter.style.removeProperty('transform'))
    }
    const draw = () => {
      strength += ((active ? 1 : 0) - strength) * .16
      // Read first, then write, so pointer tracking does not thrash layout.
      const bounds = letters.map(letter => letter.getBoundingClientRect())
      bounds.forEach((rect, index) => {
        const radius = Math.max(100, rect.height * 1.35)
        const dx = x - rect.left - rect.width / 2
        const dy = y - rect.top - rect.height / 2
        const influence = Math.exp(-(dx * dx + dy * dy) / (radius * radius)) * strength
        letters[index].style.transform = `translateY(${dy * .07 * influence}px) scale(${1 + influence * .018},${1 + influence * .08})`
      })
      distortion.current?.setAttribute('scale', String(strength * 5))
      if (active || strength > .002) frame = requestAnimationFrame(draw)
      else reset()
    }
    const move = (event: PointerEvent) => {
      if (reduced.matches) return
      x = event.clientX; y = event.clientY; active = true
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const leave = () => { active = false }
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerleave', leave)
    node.addEventListener('pointerup', leave)
    node.addEventListener('pointercancel', leave)
    reduced.addEventListener('change', reset)
    return () => {
      reset(); node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerleave', leave); node.removeEventListener('pointerup', leave)
      node.removeEventListener('pointercancel', leave); reduced.removeEventListener('change', reset)
    }
  }, [])
  return <section className="studio-hero" aria-labelledby="hero-title">
    <div className="studio-hero-meta"><span className="section-sticker">01 / Independent creative studio</span></div>
    <svg className="goo-filter" aria-hidden="true" width="0" height="0"><defs><filter id="hero-goo" x="-10%" y="-20%" width="120%" height="140%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".005 .012" numOctaves="2" seed="8" result="flow" /><feDisplacementMap ref={distortion} in="SourceGraphic" in2="flow" scale="0" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
    <h1 ref={title} id="hero-title" className="studio-wordmark" aria-label="SUPER STUPID STUDIOS">{['SUPER', 'STUPID', 'STUDIOS'].map(word => <span key={word} className="goo-word" aria-hidden="true">{[...word].map((letter, index) => <span className="goo-letter" key={index}>{letter}</span>)}{word === 'STUDIOS' && <sup>®</sup>}</span>)}</h1>
    <button className="fun-question" onClick={() => setReply(value => (value + 1) % replies.length)} aria-label={studio.question}><span aria-live="polite">{replies[reply]}</span><span className="smiley-dock"><StudioSmiley mood={reply} /></span></button>
    <SlidingSmiley />
    <div className="studio-hero-bottom"><span>Creative thinking.<br />Culture moving.</span><a href="#about">Meet the studio </a><span>Scroll for the good stuff.</span></div>
  </section>
}
