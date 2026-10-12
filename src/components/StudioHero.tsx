import { useState } from 'react'
import { SlidingSmiley } from './SlidingSmiley'
import { StudioSmiley } from './StudioSmiley'
import { studio } from '../data/studio'
import { LiquidGlassSurface } from './LiquidGlassSurface'

const replies = ['ARE WE HAVING FUN YET?', 'Yes. Keep going.', 'Now we’re getting somewhere.', 'Good. Let’s make something.']

export function StudioHero() {
  const [reply, setReply] = useState(0)
  return <section className="studio-hero" aria-labelledby="hero-title">
    <div className="studio-hero-meta"><span className="section-sticker">SUPER STUPID STUDIOS®</span></div>
    <LiquidGlassSurface fullBleed>
    <h1 id="hero-title" className="studio-wordmark" aria-label="SUPER STUPID STUDIOS">{['SUPER', 'STUPID', 'STUDIOS'].map(word => <span key={word} className="goo-word" aria-hidden="true">{[...word].map((letter, index) => <span className="goo-letter" key={index}>{letter}</span>)}{word === 'STUDIOS' && <sup>®</sup>}</span>)}</h1>
    </LiquidGlassSurface>
    <button className="fun-question" onClick={() => setReply(value => (value + 1) % replies.length)} aria-label={studio.question}><span aria-live="polite">{replies[reply]}</span><span className="smiley-dock"><StudioSmiley mood={reply} /></span></button>
    <SlidingSmiley />
    <p className="studio-hero-intro">{studio.intro}</p><div className="studio-hero-bottom"><a className="come-play" href="#about"><span aria-hidden="true">↓</span><span>COME PLAY</span><span aria-hidden="true">↓</span></a></div>
  </section>
}
