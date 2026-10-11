import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PointerEvent, KeyboardEvent } from 'react'
import { StudioSmiley } from './StudioSmiley'

type Point = { x: number; y: number }
const clamp = (point: Point): Point => ({ x: Math.max(12, Math.min(innerWidth - 88, point.x)), y: Math.max(12, Math.min(innerHeight - 100, point.y)) })

export function SlidingSmiley() {
  const button = useRef<HTMLButtonElement>(null)
  const position = useRef<Point>({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; origin: Point; moved: boolean } | null>(null)
  const holdUntil = useRef(0)
  const velocity = useRef<Point>({ x: 0, y: 0 })
  const wakeMotion = useRef<() => void>(() => {})
  const mobileTarget = useRef<Point | null>(null)
  const lastDrag = useRef<{ point: Point; time: number } | null>(null)
  const [mood, setMood] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const node = button.current
    const dock = document.querySelector<HTMLElement>('.smiley-dock')
    const hero = document.querySelector<HTMLElement>('.studio-hero')
    if (!node || !dock || !hero) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0, previous = 0, released = false, dirty = true, pointer: Point | null = null
    let lastScroll = window.scrollY, touch: Point | null = null
    const mobile = () => matchMedia('(pointer:coarse), (max-width:600px)').matches
    const rail = (point: Point) => clamp({ x: point.x < innerWidth / 2 ? 12 : innerWidth - 80, y: Math.max(100, point.y) })
    const render = () => { node.style.transform = `translate3d(${position.current.x}px,${position.current.y}px,0)` }
    const draw = (time: number) => {
      frame = 0
      const dt = Math.min(64, time - (previous || time - 16)); previous = time
      const shouldRelease = window.scrollY > hero.offsetHeight * .28
      const rect = dock.getBoundingClientRect()
      const home = { x: rect.left - 9, y: rect.top - 9 }
      if (shouldRelease && !released) {
        position.current = home
        mobileTarget.current = rail({ x: innerWidth - 80, y: innerHeight * .68 })
        released = true; dock.classList.add('released'); node.style.visibility = 'visible'
      }
      let target = home
      if (shouldRelease) {
        target = mobile() ? rail(mobileTarget.current || position.current) : pointer && matchMedia('(pointer:fine)').matches
          ? clamp({ x: pointer.x + 36, y: pointer.y + 42 })
          : clamp(position.current)
      }
      if (reduced.matches || !shouldRelease) velocity.current = { x: 0, y: 0 }
      const tossing = mobile() && shouldRelease && Math.hypot(velocity.current.x, velocity.current.y) > .015
      if (tossing && !drag.current) {
        const next = clamp({ x: position.current.x + velocity.current.x * dt, y: position.current.y + velocity.current.y * dt })
        if (next.x === 12 || next.x === innerWidth - 88) velocity.current.x = 0
        if (next.y === 12 || next.y === innerHeight - 100) velocity.current.y = 0
        position.current = next
        const friction = Math.exp(-dt / 190)
        velocity.current = { x: velocity.current.x * friction, y: velocity.current.y * friction }
        mobileTarget.current = rail(next)
      }
      if (!tossing && !drag.current && (time > holdUntil.current || !shouldRelease)) {
        const ease = reduced.matches ? 1 : 1 - Math.exp(-dt / (shouldRelease ? 240 : 160))
        position.current = { x: position.current.x + (target.x-position.current.x)*ease, y: position.current.y + (target.y-position.current.y)*ease }
      }
      render()
      const moving = Math.hypot(position.current.x-target.x, position.current.y-target.y) > .5
      if (!shouldRelease && !moving) {
        released = false; dock.classList.remove('released'); node.style.visibility = 'hidden'
      }
      // Sleep when settled; scrolling or pointer input wakes the tracking loop.
      if (moving || tossing || time < holdUntil.current || drag.current || dirty) { dirty = false; frame = requestAnimationFrame(draw) }
      else previous = 0
    }
    const wake = () => { dirty = true; if (!frame) frame = requestAnimationFrame(draw) }
    const track = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse' || reduced.matches || event.target instanceof Element && event.target.closest('.sliding-smiley')) return
      pointer = { x: event.clientX, y: event.clientY }; wake()
    }
    const leave = () => { pointer = null; wake() }
    const scroll = () => {
      const delta = window.scrollY - lastScroll; lastScroll = window.scrollY
      if (mobile() && released && !drag.current && !reduced.matches) {
        const anchor = mobileTarget.current || position.current
        mobileTarget.current = rail({ x: anchor.x, y: anchor.y - Math.max(-45, Math.min(45, delta * .25)) })
      }
      wake()
    }
    const touchDown = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'touch' || (event.target instanceof Element && event.target.closest('.sliding-smiley'))) return
      touch = { x: event.clientX, y: event.clientY }
    }
    const touchMove = (event: globalThis.PointerEvent) => {
      if (!touch || event.pointerType !== 'touch' || drag.current || reduced.matches) return
      const dx = event.clientX - touch.x
      if (Math.abs(dx) > 8 && released) {
        mobileTarget.current = rail({ x: dx > 0 ? innerWidth : 0, y: position.current.y })
        wake()
      }
      touch = { x: event.clientX, y: event.clientY }
    }
    const touchEnd = () => { touch = null }
    wakeMotion.current = wake
    window.addEventListener('pointerdown', touchDown, { passive: true })
    window.addEventListener('pointermove', touchMove, { passive: true })
    window.addEventListener('pointerup', touchEnd)
    window.addEventListener('pointercancel', touchEnd)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', wake)
    window.addEventListener('pointermove', track, { passive: true })
    document.addEventListener('pointerleave', leave)
    reduced.addEventListener('change', wake)
    const expressions = window.setInterval(() => {
      if (released && !reduced.matches && document.visibilityState === 'visible') setMood(value => value + 1)
    }, 900)
    wake()
    return () => {
      wakeMotion.current = () => {}
      window.removeEventListener('pointerdown', touchDown); window.removeEventListener('pointermove', touchMove)
      window.removeEventListener('pointerup', touchEnd); window.removeEventListener('pointercancel', touchEnd)
      window.clearInterval(expressions)
      cancelAnimationFrame(frame); dock.classList.remove('released')
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', wake)
      window.removeEventListener('pointermove', track); document.removeEventListener('pointerleave', leave)
      reduced.removeEventListener('change', wake)
    }
  }, [])
  const down = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, origin: position.current, moved: false }
    velocity.current = { x: 0, y: 0 }
    lastDrag.current = { point: { x: event.clientX, y: event.clientY }, time: performance.now() }
    setDragging(true)
    wakeMotion.current()
  }
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    const now = performance.now(), last = lastDrag.current
    if (last) {
      const dt = Math.max(8, now - last.time)
      velocity.current = { x: Math.max(-.75, Math.min(.75, (event.clientX-last.point.x)/dt)), y: Math.max(-.75, Math.min(.75, (event.clientY-last.point.y)/dt)) }
    }
    lastDrag.current = { point: { x: event.clientX, y: event.clientY }, time: now }
    const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y
    if (Math.hypot(dx, dy) > 5) drag.current.moved = true
    position.current = clamp({ x: drag.current.origin.x + dx, y: drag.current.origin.y + dy })
    event.currentTarget.style.transform = `translate3d(${position.current.x}px,${position.current.y}px,0)`
    holdUntil.current = performance.now() + 1800
  }
  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    const moved = drag.current.moved
    drag.current = null; setDragging(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (!moved) { velocity.current = { x: 0, y: 0 }; setMood(value => value % 3 === 1 ? 2 : 1) }
    if (lastDrag.current && performance.now() - lastDrag.current.time > 100) velocity.current = { x: 0, y: 0 }
    mobileTarget.current = position.current
    holdUntil.current = performance.now() + 300
    wakeMotion.current()
  }
  const key = (event: KeyboardEvent<HTMLButtonElement>) => {
    const offsets: Record<string, Point> = { ArrowLeft: {x:-24,y:0}, ArrowRight:{x:24,y:0}, ArrowUp:{x:0,y:-24}, ArrowDown:{x:0,y:24} }
    if (offsets[event.key]) {
      event.preventDefault(); const offset = offsets[event.key]
      position.current = clamp({ x:position.current.x+offset.x, y:position.current.y+offset.y })
      holdUntil.current = performance.now()+1800
      event.currentTarget.style.transform = `translate3d(${position.current.x}px,${position.current.y}px,0)`
    }
  }
  return createPortal(<button ref={button} className={`sliding-smiley${dragging ? ' is-dragging' : ''}`} style={{visibility:'hidden'}} aria-label="Floating smiley: drag or use arrow keys. Tap to change expression." onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => {drag.current=null;velocity.current={x:0,y:0};setDragging(false);wakeMotion.current()}} onKeyDown={key} onClick={event => {if(event.detail === 0) setMood(value => value + 1)}}><span className="smiley-float"><StudioSmiley mood={mood}/></span></button>, document.body)
}
