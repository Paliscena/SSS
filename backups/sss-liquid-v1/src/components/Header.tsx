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
        <Link to="/#work">Work <sup>06</sup></Link><Link to="/#about">About</Link><Link to="/#contact">Contact ↗</Link>
      </nav>
      <button ref={trigger} className="menu-trigger" onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open} aria-controls="site-menu"><span /><span /></button>
    </header>
    <dialog aria-label="Navigation menu" id="site-menu" className="menu" ref={dialog} onCancel={close}>
      <div className="menu-top"><span className="brand">SSS<sup>®</sup></span><button className="text-button" onClick={close}>Close ×</button></div>
      <span className="eyebrow">Navigation.</span>
      <nav aria-label="Expanded navigation">{['Work', 'About', 'Contact'].map((item, index) => <Link key={item} to={`/#${item.toLowerCase()}`} onClick={close}><sup>0{index + 1}</sup>{item}<span>↗</span></Link>)}</nav>
      <p>Lorem ipsum dolor sit amet.</p>
    </dialog>
  </>
}
