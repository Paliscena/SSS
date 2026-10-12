import { Contact } from '../components/Contact'
import { StudioHero } from '../components/StudioHero'
import { VideoWork } from '../components/VideoWork'
import { studio } from '../data/studio'
import './StudioHome.css'
import { usePeelableStickers } from '../hooks/usePeelableStickers'
import { useScrollGel } from '../hooks/useScrollGel'

export function Home() {
  useScrollGel()
  usePeelableStickers()
  return <main id="main-content" className="studio-home">
    <StudioHero />
    <section id="about" className="studio-about copy-section" aria-labelledby="about-title" data-reveal>
      <div className="section-meta"><span className="section-sticker">01 / About us</span></div>
      <div className="about-composition"><h2 id="about-title" aria-label={studio.aboutTitle}>IT’S MORE<br />FUN TO<br />BE DUMB.</h2>
      <div className="studio-copy about-reading"><div className="copy-group">{studio.about.slice(0,2).map(text => <p key={text}>{text}</p>)}</div><div className="about-interruption">{studio.about.slice(2,4).map(text => <p key={text}>{text}</p>)}</div><div className="copy-group">{studio.about.slice(4).map(text => <p key={text}>{text}</p>)}</div><p className="copy-signoff">{studio.aboutClosing}</p></div></div>
    </section>
    <section id="ethos" className="studio-ethos copy-section" aria-labelledby="ethos-title" data-reveal>
      <div className="section-meta"><span className="section-sticker">02 / Our ethos</span></div>
      <h2 id="ethos-title">{studio.ethosTitle}</h2>
      <div className="studio-copy ethos-reading"><div className="ethos-lead">{studio.ethos.slice(0,2).map(text => <p key={text}>{text}</p>)}</div><p>{studio.ethos[2]}</p><div className="ethos-questions">{studio.ethos.slice(3,6).map(text => <p key={text}>{text}</p>)}</div><p>{studio.ethos[6]}</p><div className="ethos-principle">{studio.ethos.slice(7).map(text => <p key={text}>{text}</p>)}</div><p className="copy-signoff ethos-dance" aria-label={studio.ethosClosing}>{[0,1,2].map(index => <span key={index} aria-hidden="true" style={{animationDelay:`${index * .18}s`}}>GO STUPID.</span>)}</p>
      <details className="studio-manifesto"><summary>THE SUPER STUPID MANIFESTO</summary><h3>{studio.manifestoTitle}</h3>{studio.manifesto.map((text,index) => <p key={index}>{text}</p>)}</details></div>
    </section>
    <section id="work" className="studio-work" aria-labelledby="work-title">
      <div className="section-meta"><span className="section-sticker">03 / Selected work</span><span>Campaign / Film / Experience</span></div>
      <div className="work-heading"><h2 id="work-title">{studio.workTitle}</h2><div className="work-aside">{studio.work.map(text => <p key={text}>{text}</p>)}</div></div>
      <details id="project-list" className="work-dropdown"><summary>LOOK AT THIS STUFF</summary><VideoWork /></details>
    </section>
    <section id="offerings" className="studio-offerings" aria-labelledby="offerings-title" data-reveal>
      <div className="section-meta"><h2 id="offerings-title" className="section-sticker">04 / What we do</h2><span>WE MAKE STUPID THINGS HAPPEN.</span></div>
      <div className="offerings-intro studio-copy">{studio.offeringsIntro.map(text => <p key={text}>{text}</p>)}</div>
      <div className="offerings-list">{studio.offerings.map((offering,index) => <article key={offering.title}><span className="offering-number">0{index+1}</span><h3>{offering.title}</h3><div className="offering-copy"><h4>{offering.tagline}</h4>{offering.description.map(text => <p key={text}>{text}</p>)}<p className="offering-capabilities">{offering.capabilities}</p></div></article>)}</div>
    </section>
    <Contact />
  </main>
}
