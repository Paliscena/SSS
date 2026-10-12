import { projects } from '../data/projects'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export function Header() {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open) { dialog.current?.showModal(); document.body.style.overflow = 'hidden' }
    else { dialog.current?.close(); document.body.style.overflow = '' }
    return () => { document.body.style.overflow = '' }
  }, [open])
  const close = () => { setOpen(false); trigger.current?.focus() }
  return <>
    <header className="header">
      <Link className="brand" to="/" aria-label="Super Stupid Studios home">SSS<sup>®</sup></Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link to="/#work">Work <sup>{String(projects.length).padStart(2, '0')}</sup></Link><Link to="/#about">About</Link><Link to="/#offerings">What we do</Link><Link to="/#contact">Contact </Link>
      </nav>
      <button ref={trigger} className="menu-trigger" onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open} aria-controls="site-menu"><span /><span /></button>
    </header>
    <dialog aria-label="Navigation menu" id="site-menu" className="menu" ref={dialog} onCancel={close}>
      <div className="menu-top"><span className="brand">SSS<sup>®</sup></span><button className="text-button" onClick={close}>Close ×</button></div>
      <span className="eyebrow">Navigation.</span>
      <nav aria-label="Expanded navigation">{[{title:'About',id:'about'},{title:'Our ethos',id:'ethos'},{title:'Work',id:'work'},{title:'What we do',id:'offerings'},{title:'Contact',id:'contact'}].map((item, index) => <Link key={item.id} to={`/#${item.id}`} onClick={close}><sup>0{index + 1}</sup>{item.title}</Link>)}</nav>
      <p>Are we having fun yet?</p>
    </dialog>
  </>
}
