import { LandingFilms } from './LandingFilms'
import { Link } from 'react-router-dom'
import { StudioSmiley } from './StudioSmiley'
import { LiquidGlassSurface } from './LiquidGlassSurface'

export function StudioHero() {
  return <section className="studio-hero" aria-labelledby="hero-title">
    <LandingFilms />
    <LiquidGlassSurface fullBleed>
    <h1 id="hero-title" className="studio-wordmark" aria-label="SUPER STUPID STUDIOS">{['SUPER', 'STUPID', 'STUDIOS'].map(word => <span key={word} className="goo-word" aria-hidden="true">{[...word].map((letter, index) => <span className="goo-letter" key={index}>{letter}</span>)}{word === 'STUDIOS' && <sup>®</sup>}</span>)}</h1>
    </LiquidGlassSurface>
    <div className="landing-question"><span className="section-sticker">are we having fun yet?</span><StudioSmiley mood={0} /></div>
    <p className="studio-hero-intro"><em>A Creative Studio For Smart People &amp; Stupid Ideas</em></p>
    <div className="studio-hero-bottom"><Link className="come-play" to="/studio"><span aria-hidden="true">↓</span><span>COME PLAY</span><span aria-hidden="true">↓</span></Link></div>
  </section>
}
