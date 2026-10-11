import { Contact } from '../components/Contact'
import { StudioHero } from '../components/StudioHero'
import { VideoWork } from '../components/VideoWork'
import { studio } from '../data/studio'
import './StudioHome.css'
import { useScrollGel } from '../hooks/useScrollGel'

export function Home() {
  useScrollGel()
  return <main id="main-content" className="studio-home">
    <StudioHero />
    <section id="about" className="studio-about" aria-labelledby="about-title" data-reveal>
      <div className="section-meta"><span className="section-sticker">02 / About</span><span>Independent by nature.</span></div>
      <div className="studio-about-body"><h2 id="about-title">{studio.positioning.map((word,index) => <span key={word}>{word}{index < 2 && <span className="positioning-cross" aria-hidden="true">×</span>}</span>)}</h2>
      <div className="studio-about-copy"><p>{studio.about}</p><p>{studio.aboutNote}</p></div></div>
    </section>
    <section id="work" className="studio-work" aria-labelledby="work-title">
      <div className="section-meta"><span className="section-sticker">03 / Selected work</span><span>Campaign / Film / Experience</span></div>
      <div className="work-heading"><h2 id="work-title">Made to<br />move you.</h2><div className="work-aside"><p>Project placeholders.<br />Films to come.</p></div></div>
      <VideoWork />
    </section>
    <section id="offerings" className="studio-offerings" aria-labelledby="offerings-title" data-reveal>
      <div className="section-meta"><h2 id="offerings-title" className="section-sticker">04 / What we do</h2><span>From the first thought to the last frame.</span></div>
      <div className="offerings-list">{studio.offerings.map((offering,index) => <article key={offering.title}><span className="offering-number">0{index+1}</span><h3>{offering.title}</h3><p>{offering.description}</p></article>)}</div>
    </section>
    <Contact />
  </main>
}
