import { useEffect, useRef } from 'react'

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const media = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)')
    let frame = 0
    let x = 0, y = 0
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== 'mouse') return
      x = event.clientX; y = event.clientY
      if (!frame) frame = window.requestAnimationFrame(() => {
        const node = ref.current
        if (node) {
          node.style.transform = `translate3d(${x}px, ${y}px, 0)`
          node.dataset.active = 'true'
          const target = document.elementFromPoint(x, y)
          node.dataset.link = String(Boolean(target?.closest('a, button')))
          node.dataset.project = String(Boolean(target?.closest('.project-link')))
        }
        frame = 0
      })
    }
    const leave = () => { if (ref.current) ref.current.dataset.active = 'false' }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => { window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave); window.cancelAnimationFrame(frame) }
  }, [])
  return <div className="cursor" ref={ref} aria-hidden="true"><span>VIEW ↗</span></div>
}
