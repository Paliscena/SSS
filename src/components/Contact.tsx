import { Link } from 'react-router-dom'
import { studio } from '../data/studio'

export function Contact() {
  return <footer id="contact" className="contact">
    <div className="section-meta"><span className="section-sticker">Contact</span></div>
    <div className="contact-composition">
      <h2>{studio.contactTitle}</h2>
      <div className="contact-invitation"><p>{studio.contactSubtitle}</p>
        <div className="contact-action"><a id="studio-email" className="email-button" href={`mailto:${studio.email}`}>{studio.email}</a></div>
      </div>
    </div>
    <div className="footer-line"><div className="studio-footer-copy"><span>SUPER STUPID STUDIOS © 2026</span><Link to="/studio#work">WORK</Link><Link to="/studio#information">INFORMATION</Link><Link to="/">ARE WE HAVING FUN YET?</Link></div><a className="back-to-top" href="#top" aria-label="Back to top">↑</a></div>
  </footer>
}
