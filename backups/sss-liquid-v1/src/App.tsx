import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Cursor } from './components/Cursor'
import { Home } from './pages/Home'
import { ProjectDetail } from './pages/ProjectDetail'
import { useComposure } from './hooks/useComposure'
import { projects } from './data/projects'
import './App.css'

function Portfolio() {
  const location = useLocation()
  useComposure(location.pathname)
  useEffect(() => {
    const project = projects.find((item) => location.pathname === `/work/${item.slug}` || location.pathname === `/work/${item.legacySlug}`)
    document.title = location.pathname === '/' ? 'SUPER STUPID STUDIOS — Serious work. Stupid name.' : `${project?.title ?? 'A wrong turn'} — SUPER STUPID STUDIOS`
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
      else {
        window.scrollTo({ top: 0, behavior: 'instant' })
        const main = document.getElementById('main-content')
        main?.setAttribute('tabindex', '-1')
        main?.focus({ preventScroll: true })
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location])
  return <><a className="skip-link" href="#main-content">Skip to content</a><div id="top" /><Header key={location.key} /><div className="route-stage" key={location.pathname}><Routes><Route path="/" element={<Home />} /><Route path="/work/:slug" element={<ProjectDetail />} /><Route path="*" element={<ProjectDetail />} /></Routes></div><Cursor /></>
}

export default function App() { return <BrowserRouter><Portfolio /></BrowserRouter> }
