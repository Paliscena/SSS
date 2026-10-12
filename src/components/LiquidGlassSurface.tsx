import './LiquidGlassSurface.css'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createLiquidGlassEngine } from '../lib/liquidGlass/engine'
import { resolveGlassSettings } from '../lib/liquidGlass/settings'
import type { LiquidGlassSettings } from '../lib/liquidGlass/settings'

export function LiquidGlassSurface({ children, settings, fullBleed = false }: { children: ReactNode; settings?: Partial<LiquidGlassSettings>; fullBleed?: boolean }) {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<ReturnType<typeof createLiquidGlassEngine>>(null)
  const current = useRef(resolveGlassSettings(settings))
  useEffect(() => {
    current.current = resolveGlassSettings(settings)
    engine.current?.setSettings(current.current)
  }, [settings])
  useEffect(() => {
    let cancelled = false, revision = 0
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const start = async () => {
      const token = ++revision
      engine.current?.dispose(); engine.current = null
      if (reduced.matches) return
      await document.fonts.ready
      if (cancelled || token !== revision || !stage.current || !canvas.current) return
      try { engine.current = createLiquidGlassEngine(canvas.current, stage.current, stage.current, current.current, fullBleed ? stage.current.closest<HTMLElement>('.studio-hero') || undefined : undefined) }
      catch (error) { if (import.meta.env.DEV) console.warn('Liquid glass unavailable; retaining original content.',error) }
    }
    const change = () => { void start() }
    void start(); reduced.addEventListener('change',change)
    return () => { cancelled = true; revision++; engine.current?.dispose(); engine.current = null; reduced.removeEventListener('change',change) }
  }, [fullBleed])
  return <div ref={stage} className={`hero-flow-stage liquid-glass-surface${fullBleed ? ' is-full-bleed' : ''}`} tabIndex={0} role="group" aria-label="Interactive liquid glass. Move the mouse or tap for a ripple. Swipe to scroll. Escape resets the surface."><div className="liquid-glass-content">{children}</div><canvas ref={canvas} className="hero-flow-canvas" aria-hidden="true" /></div>
}
