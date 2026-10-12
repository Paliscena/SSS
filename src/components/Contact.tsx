import { useState } from 'react'
import { studio } from '../data/studio'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText('hello@example.com'); setCopied(true); setFailed(false) }
    catch { setFailed(true) }
  }
  return <footer id="contact" className="contact" data-reveal>
    <div className="section-meta"><span className="section-sticker">05 / Contact</span></div>
    <div className="contact-composition">
      <h2 aria-label={studio.contactTitle}>WANNA DO<br />SOMETHING<br /><span>STUPID?</span></h2>
      <div className="contact-invitation">
        <div className="contact-prompt">{studio.contact.slice(0,3).map(text => <p key={text}>{text}</p>)}</div>
        <p className="contact-talk">{studio.contact[3]}</p>
        <div className="contact-action"><button id="studio-email" className="email-button" onClick={copy}>LET’S GET STUPID</button><p className="micro" aria-live="polite">{failed ? 'Copy unavailable — hello@example.com' : copied ? 'Copied — placeholder email.' : 'hello@example.com — placeholder'}</p></div>
        <div className="contact-details"><p>Los Angeles / Everywhere</p><p>Instagram — link to come.</p></div>
      </div>
    </div>
    <div className="footer-line"><div className="studio-footer-copy"><span>© 2026 SUPER STUPID STUDIOS.</span><span>ARE WE HAVING FUN YET?</span><span>FOR STUPIDITY EVERYWHERE.</span><span>STAY SUPER STUPID.</span></div><a className="back-to-top" href="#top" aria-label="Back to top">↑</a></div>
  </footer>
}
