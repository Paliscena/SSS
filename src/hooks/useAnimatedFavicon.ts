import { useEffect } from 'react'

// PNG frames work as ordinary favicons; the static icons remain as fallbacks.
export function useAnimatedFavicon() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const context = canvas.getContext('2d')
    if (!context) return
    const icon = document.createElement('link')
    icon.rel = 'icon'; icon.type = 'image/png'; icon.sizes = '64x64'
    icon.dataset.animatedSmiley = 'true'
    const outline = new Path2D('M49 6C74 3 94 25 94 50S75 94 49 94 5 76 6 49 23 8 49 6Z')
    const frames = Array.from({ length: 60 }, (_, index) => {
      const mood = Math.floor(index / 10) % 3
      context.clearRect(0, 0, 64, 64)
      context.save()
      context.translate(32, 32)
      context.rotate(index / 60 * Math.PI * 2)
      context.scale(.57, .57)
      context.translate(-50, -50)
      context.fillStyle = '#efe852'; context.strokeStyle = '#151515'
      context.lineWidth = 5; context.lineCap = 'round'; context.lineJoin = 'round'
      context.fill(outline); context.stroke(outline)
      context.beginPath(); context.moveTo(33, 34); context.lineTo(33, 46)
      if (mood === 1) { context.moveTo(61, 40); context.quadraticCurveTo(68, 32, 75, 40) }
      else { context.moveTo(67, 34); context.lineTo(67, 46) }
      context.moveTo(27, 60); context.quadraticCurveTo(48, 88, 74, 59); context.stroke()
      if (mood === 2) {
        const tongue = new Path2D('M48 72L49 81Q52 90 59 85Q64 82 63 73Z')
        context.fillStyle = '#e3432e'; context.lineWidth = 3.5
        context.fill(tongue); context.stroke(tongue)
      }
      context.restore()
      return canvas.toDataURL('image/png')
    })
    let timer: number | undefined, frame = 0
    const sync = () => {
      window.clearInterval(timer); timer = undefined
      if (reduced.matches) { icon.remove(); return }
      if (!icon.isConnected) document.head.append(icon)
      icon.href = frames[frame]
      if (document.visibilityState !== 'visible') return
      timer = window.setInterval(() => {
        frame = (frame + 1) % frames.length
        icon.href = frames[frame]
      }, 100)
    }
    reduced.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      window.clearInterval(timer); icon.remove()
      reduced.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])
}
