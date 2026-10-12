import { Link, Navigate, useLocation } from 'react-router-dom'
import { Contact } from '../components/Contact'
import { StudioHero } from '../components/StudioHero'
import { VideoWork } from '../components/VideoWork'
import { studio } from '../data/studio'
import './StudioHome.css'
import { usePeelableStickers } from '../hooks/usePeelableStickers'
import { useScrollGel } from '../hooks/useScrollGel'

export function Home() {
  const { hash } = useLocation()
  usePeelableStickers()
  if (hash && !['#top','#main-content'].includes(hash)) return <Navigate to={`/studio${hash}`} replace />
  return <main id="main-content" className="studio-home landing-page"><StudioHero /></main>
}

export function StudioPage() {
  useScrollGel()
  usePeelableStickers()
  return <main id="main-content" className="studio-home">
    <h1 className="studio-page-title"><Link to="/">SUPER STUPID STUDIOS<sup>®</sup></Link></h1>
    <section id="information" className="studio-information copy-section" aria-labelledby="information-title">
      <span id="about" /><span id="ethos" />
      <div className="section-meta"><span className="section-sticker">Information</span></div>
      <div className="information-reading">
        <div className="information-intro">{studio.informationIntro.map(text => <p key={text}>{text}</p>)}</div>
        <h2 id="information-title">{studio.informationTitle}</h2>
        <div className="information-body">{studio.informationGroups.map((group,index) => <div className="information-group" key={index}>{group.map(text => <p key={text}>{text}</p>)}</div>)}</div>
        <div className="information-signoff"><p>SUPER STUPID STUDIOS</p><p>are we having fun yet?</p></div>
      </div>
      <details id="offerings" className="information-services"><summary>WHAT WE DO</summary>
        <h3 className="services-headline">{studio.offeringsTitle}</h3>
        <div className="offerings-list">{studio.offerings.map((offering,index) => <article key={offering.title}><span className="offering-number">0{index+1}</span><h3>{offering.title}</h3><div className="offering-copy"><h4>{offering.tagline}</h4>{offering.description.map(text => <p key={text}>{text}</p>)}<p className="offering-capabilities">{offering.capabilities}</p></div></article>)}</div>
      </details>
    </section>
    <section id="work" className="studio-work" aria-labelledby="work-title">
      <div className="section-meta"><span className="section-sticker">Selected work</span></div>
      <div className="work-heading"><h2 id="work-title">{studio.workTitle}</h2></div>
      <div id="project-list"><VideoWork /></div>
    </section>
    <Contact />
  </main>
}
