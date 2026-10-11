import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createLiquidEngine } from '../lib/liquid/engine'
import { defaultSettings } from '../lib/liquid/settings'
import type { LiquidSettings } from '../lib/liquid/settings'
import './LiquidTypographyHero.css'

// Vite removes this branch and its development-only chunk from the production build.
const TuningPanel = import.meta.env.DEV ? lazy(() => import('./LiquidTuningPanel')) : null

export function LiquidTypographyHero() {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const engine = useRef<ReturnType<typeof createLiquidEngine>>(null)
  const [settings, setSettings] = useState(defaultSettings)
  const currentSettings = useRef(settings)
  useEffect(() => {
    let cancelled = false
    let revision = 0
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const start = async () => {
      const token = ++revision
      engine.current?.dispose(); engine.current = null
      if (media.matches) return
      await document.fonts.ready
      if (cancelled || token !== revision || media.matches || !stage.current || !canvas.current || !heading.current) return
      try { engine.current = createLiquidEngine(canvas.current, stage.current, heading.current, currentSettings.current) }
      catch (error) { if (import.meta.env.DEV) console.warn('Liquid typography unavailable; using semantic heading.', error) }
    }
    const change = () => { void start() }
    void start(); media.addEventListener('change', change)
    return () => { cancelled = true; media.removeEventListener('change', change); engine.current?.dispose(); engine.current = null }
  }, [])
  const update = (next: LiquidSettings) => { currentSettings.current = next; setSettings(next); engine.current?.setSettings(next) }
  return <section className="hero liquid-hero" aria-labelledby="hero-title">
    <div className="hero-top"><span>Independent creative studio</span><span>Design / Art direction</span></div>
    <div ref={stage} className="hero-playground liquid-stage" tabIndex={0} role="group" aria-label="Interactive liquid typography" aria-describedby="hero-instructions">
      <h1 ref={heading} id="hero-title" className="wordmark" aria-label="SUPER STUPID STUDIOS">{['SUPER','STUPID','STUDIOS'].map(word => <span className="hero-word" key={word} aria-hidden="true">{[...word].map((letter,index) => <span className="hero-letter" key={index}>{letter}</span>)}{word === 'SUPER' && <sup>®</sup>}</span>)}</h1>
      <canvas ref={canvas} className="liquid-canvas" aria-hidden="true" />
    </div>
    <div className="hero-bottom"><p>Serious work.<br />Stupid name.</p><span id="hero-instructions"><span className="liquid-motion-hint">Move across the type. Drag to stretch.<br /><span className="keyboard-hint">Let go to restore. Escape to reset.</span></span><span className="liquid-static-hint">Static typography / Reduced motion.</span></span><a href="#work">Selected work ↓</a></div>
    {TuningPanel && <Suspense fallback={null}><TuningPanel settings={settings} onChange={update} onReset={() => engine.current?.reset()} /></Suspense>}
  </section>
}
