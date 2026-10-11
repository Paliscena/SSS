import { useEffect } from 'react'

export function usePeelableStickers() {
  useEffect(() => {
    const cleanups = [...document.querySelectorAll<HTMLElement>('.section-sticker')].map(sticker => {
      let x = 0, y = 0, lastTap = 0
      let grip: { id: number; x: number; y: number; originX: number; originY: number; moved: boolean; left: number; top: number; width: number; height: number } | null = null
      sticker.tabIndex = 0
      if (sticker.tagName !== 'H2') sticker.setAttribute('role', 'button')
      sticker.setAttribute('aria-description', 'Drag to move this sticker. Arrow keys move it; Escape or double tap resets it.')
      const paint = () => { sticker.style.translate = `${x}px ${y}px` }
      const reset = () => { x = 0; y = 0; paint(); sticker.classList.remove('is-peeling') }
      const down = (event: PointerEvent) => {
        if (event.button !== 0 || grip) return
        const rect = sticker.getBoundingClientRect()
        grip = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: x, originY: y, moved: false, left: rect.left-x, top: rect.top-y, width: rect.width, height: rect.height }
        sticker.setPointerCapture(event.pointerId)
        sticker.classList.add('is-peeling')
      }
      const move = (event: PointerEvent) => {
        if (!grip || grip.id !== event.pointerId) return
        const dx = event.clientX-grip.x, dy = event.clientY-grip.y
        if (Math.hypot(dx, dy) > 5) grip.moved = true
        x = Math.max(8-grip.left, Math.min(innerWidth-8-grip.width-grip.left, grip.originX+dx))
        y = Math.max(8-grip.top, Math.min(innerHeight-8-grip.height-grip.top, grip.originY+dy))
        paint()
      }
      const finish = (event: PointerEvent) => {
        if (!grip || grip.id !== event.pointerId) return
        if (event.type === 'pointercancel') { x = grip.originX; y = grip.originY; paint() }
        else if (!grip.moved) {
          const now = performance.now()
          if (now-lastTap < 350) { reset(); lastTap = 0 }
          else lastTap = now
        } else lastTap = 0
        grip = null; sticker.classList.remove('is-peeling')
        if (sticker.hasPointerCapture(event.pointerId)) sticker.releasePointerCapture(event.pointerId)
      }
      const key = (event: KeyboardEvent) => {
        const offsets: Record<string, [number,number]> = { ArrowLeft:[-12,0], ArrowRight:[12,0], ArrowUp:[0,-12], ArrowDown:[0,12] }
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); reset() }
        else if (offsets[event.key]) {
          event.preventDefault()
          const [dx,dy] = offsets[event.key], rect = sticker.getBoundingClientRect()
          x += Math.max(8-rect.left, Math.min(innerWidth-8-rect.right, dx))
          y += Math.max(8-rect.top, Math.min(innerHeight-8-rect.bottom, dy))
          paint()
        }
      }
      const resize = () => reset()
      sticker.addEventListener('pointerdown', down)
      sticker.addEventListener('pointermove', move)
      sticker.addEventListener('pointerup', finish)
      sticker.addEventListener('pointercancel', finish)
      sticker.addEventListener('keydown', key)
      window.addEventListener('resize', resize)
      return () => {
        sticker.removeEventListener('pointerdown', down); sticker.removeEventListener('pointermove', move)
        sticker.removeEventListener('pointerup', finish); sticker.removeEventListener('pointercancel', finish)
        sticker.removeEventListener('keydown', key); window.removeEventListener('resize', resize)
        reset(); sticker.removeAttribute('tabindex'); sticker.removeAttribute('aria-description')
        if (sticker.tagName !== 'H2') sticker.removeAttribute('role')
      }
    })
    return () => cleanups.forEach(cleanup => cleanup())
  }, [])
}
