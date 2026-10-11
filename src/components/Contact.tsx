import { useState } from 'react'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText('hello@example.com'); setCopied(true); setFailed(false) }
    catch { setFailed(true) }
  }
  return <footer id="contact" className="contact" data-reveal>
    <div className="section-meta"><span>05 / Contact</span></div>
    <h2>Let’s make<br />something move.</h2>
    <div className="contact-bottom">
      <div><button className="email-button" onClick={copy}>hello@example.com</button><p className="micro" aria-live="polite">{failed ? 'Copy unavailable — hello@example.com' : copied ? 'Copied. Placeholder address — replace before launch.' : 'Placeholder email — replace before launch.'}</p></div>
      
    </div>
    <div className="footer-line"><span>SUPER STUPID STUDIOS / Are we having fun yet?</span><a href="#top">Back to top </a></div>
  </footer>
}
