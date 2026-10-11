import { useState } from 'react'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText('hello@example.com'); setCopied(true); setFailed(false) }
    catch { setFailed(true) }
  }
  return <footer id="contact" className="contact" data-reveal>
    <div className="section-meta"><span>03 / Contact</span></div>
    <h2>Lorem ipsum<br />dolor sit amet.</h2>
    <div className="contact-bottom">
      <div><button className="email-button" onClick={copy}>hello@example.com <span>↗</span></button><p className="micro" aria-live="polite">{failed ? 'Copy unavailable — hello@example.com' : copied ? 'Copied. Placeholder address — replace before launch.' : 'Placeholder email — replace before launch.'}</p></div>
      
    </div>
    <div className="footer-line"><span>© 20XX / Placeholder</span><a href="#top">Back to top ↑</a></div>
  </footer>
}
