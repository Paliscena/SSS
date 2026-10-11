import { useEffect } from 'react'

// Scroll velocity drives one continuous, overdamped flow field.
// Exponential smoothing cannot overshoot: no spring cascade or traveling ripple.
export function useScrollGel() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const nodes = [...document.querySelectorAll<HTMLElement>([
      '.studio-hero-meta', '.studio-wordmark > span', '.fun-question', '.studio-hero-bottom',
      '.studio-about .section-meta', '#about-title > span', '.studio-about-copy > p',
      '.studio-work > .section-meta', '.work-heading', '.film-tile',
      '.studio-offerings > .section-meta', '.offerings-list > article',
      '.studio-home .contact > *',
    ].join(','))]
    const visible = new Set<HTMLElement>()
    const centers = new Map<HTMLElement, number>()
    let flow = 0
    let frame = 0, lastY = window.scrollY, lastTime = performance.now(), previousFrame = 0, target = 0
    const measure = () => {
      for (const node of nodes) {
        const rect = node.getBoundingClientRect()
        centers.set(node, rect.top + window.scrollY + rect.height / 2)
      }
    }
    const resetNode = (node: HTMLElement) => {
      node.style.removeProperty('transform')
      node.style.removeProperty('will-change')
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const node = entry.target as HTMLElement
      if (entry.isIntersecting) visible.add(node)
      else { visible.delete(node); resetNode(node) }
    }), { rootMargin: '120px' })
    nodes.forEach(node => observer.observe(node))
    measure()
    const clear = () => {
      cancelAnimationFrame(frame); frame = 0; target = 0
      flow = 0
      nodes.forEach(resetNode)
    }
    const animate = (now: number) => {
      const elapsed = Math.min(now - previousFrame, 40)
      previousFrame = now
      // Let momentum trail gently, then settle monotonically without rebound.
      if (now - lastTime > 40) target *= Math.exp(-elapsed / 95)
      const settling = Math.abs(target) < Math.abs(flow)
      flow += (target - flow) * (1 - Math.exp(-elapsed / (settling ? 125 : 70)))
      for (const node of visible) {
        const depth = Math.max(0, Math.min(1, ((centers.get(node) ?? 0) - window.scrollY) / window.innerHeight))
        // A broad, shallow spatial envelope keeps the page moving cohesively.
        const influence = .85 + .15 * Math.sin(depth * Math.PI)
        const drift = flow * influence
        const stretch = Math.abs(drift) * .014
        node.style.willChange = 'transform'
        node.style.transform = `translate3d(0,${drift * 12}px,0) scale(${1 - stretch * .3},${1 + stretch})`
      }
      if (Math.abs(flow) + Math.abs(target) < .001) clear()
      else frame = requestAnimationFrame(animate)
    }
    const scroll = () => {
      const now = performance.now(), delta = window.scrollY - lastY
      const elapsed = Math.max(now - lastTime, 16)
      lastY = window.scrollY; lastTime = now
      if (preference.matches || document.querySelector('dialog[open]')) { clear(); return }
      // Leave instant anchor navigation undistorted.
      if (Math.abs(delta) > window.innerHeight * .65) { clear(); return }
      target = Math.tanh(delta / elapsed * .16)
      if (!frame) { previousFrame = now; frame = requestAnimationFrame(animate) }
    }
    const resize = () => { clear(); measure() }
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', resize)
    preference.addEventListener('change', clear)
    document.addEventListener('visibilitychange', clear)
    let disposed = false
    void document.fonts.ready.then(() => { if (!disposed) measure() })
    return () => {
      disposed = true
      clear(); observer.disconnect()
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', resize)
      preference.removeEventListener('change', clear)
      document.removeEventListener('visibilitychange', clear)
    }
  }, [])
}
