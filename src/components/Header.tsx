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
        <Link to="/studio#information">Information</Link><Link to="/studio#work">Work</Link><Link to="/studio#contact">Contact </Link>
      </nav>
      <button ref={trigger} className="menu-trigger" onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open} aria-controls="site-menu"><span /><span /></button>
    </header>
    <dialog aria-label="Navigation menu" id="site-menu" className="menu" ref={dialog} onCancel={close}>
      <div className="menu-top"><span className="brand">SSS<sup>®</sup></span><button className="text-button" onClick={close}>Close ×</button></div>
      <nav aria-label="Expanded navigation">{[{title:'Information',id:'information'},{title:'Work',id:'work'},{title:'Contact',id:'contact'}].map(item => <Link key={item.id} to={`/studio#${item.id}`} onClick={close}>{item.title}</Link>)}</nav>
      <p>still having fun?</p>
    </dialog>
  </>
}
