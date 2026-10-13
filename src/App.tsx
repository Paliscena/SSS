import { useEffect, useRef, useState } from 'react'
import { projects } from './data/projects'
import { studio } from './data/studio'
import { CyclingWordmark } from './components/CyclingWordmark'
import { videoEmbed } from './lib/videoEmbed'
import './App.css'
import './Experiment.css'

function Film({ src, poster, title, embed, muted, paused }: { src?:string; poster:string; title:string; embed?:string|null; muted:boolean; paused:boolean }) {
  const video=useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const node=video.current
    if(!node) return
    const reduced=matchMedia('(prefers-reduced-motion:reduce)')
    const observer=new IntersectionObserver(([entry]) => {
      if(entry.isIntersecting && !reduced.matches && !paused) void node.play().catch(() => {})
      else node.pause()
    },{threshold:.6})
    observer.observe(node)
    return () => { observer.disconnect(); node.pause() }
  },[src,paused])
  return src ? <video ref={video} src={src} poster={poster} muted={muted} loop playsInline preload="metadata" aria-label={title} /> : embed ? <iframe tabIndex={-1} src={`${embed}${embed.includes('?') ? '&' : '?'}background=1&autoplay=1&muted=1&loop=1&controls=0`} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : <img src={poster} alt={title} />
}

function PlaybackDialog({ film, onClose }: { film: {title:string;src:string;poster:string;project:typeof projects[number]}; onClose:() => void }) {
  const dialog=useRef<HTMLDialogElement>(null)
  useEffect(() => { const node=dialog.current; node?.showModal();return () => node?.close() },[])
  const embed=videoEmbed(film.project.videoUrl)
  return <dialog className="experiment-playback" ref={dialog} onCancel={onClose} aria-labelledby="playback-title"><header><h2 id="playback-title">{film.project.title} / {film.title}</h2><button onClick={onClose} aria-label="Close film">Close ×</button></header>{film.src ? <video src={film.src} poster={film.poster} controls playsInline preload="metadata" aria-label={film.title} /> : embed ? <iframe src={embed} title={film.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : <img src={film.poster} alt={film.title} />}</dialog>
}

export default function App() {
  const [panel,setPanel]=useState<'information'|'contact'|null>(null)
  const [selected,setSelected]=useState<number|null>(null)
  const [hover,setHover]=useState<number|null>(null)
  const [muted,setMuted]=useState(true)
  const [activeFilm,setActiveFilm]=useState(0)
  const [playback,setPlayback]=useState<number|null>(null)
  const filmScroll=useRef<HTMLDivElement>(null)
  const background=useRef<HTMLVideoElement>(null)
  const sequence=projects.flatMap((item,projectIndex) => (item.films || [{title:item.title,src:item.filmSrc || '',poster:item.image}]).map(film => ({...film,projectIndex,project:item})))
  const project=selected===null ? null : sequence[activeFilm]?.project
  const hovered=hover===null ? null : projects[hover]
  const backgroundSrc=hovered?.previewSrc || 'https://media.superstupidstudios.com/landing-road-game.mp4'
  const films=sequence
  useEffect(() => {
    const node=background.current
    if(node && !matchMedia('(prefers-reduced-motion:reduce)').matches) void node.play().catch(() => {})
  },[backgroundSrc])
  useEffect(() => {
    const escape=(event:KeyboardEvent) => { if(event.key==='Escape') { setPanel(null); setSelected(null) } }
    window.addEventListener('keydown',escape);return () => window.removeEventListener('keydown',escape)
  },[])
  const openProject=(index:number) => { const start=sequence.findIndex(film => film.projectIndex===index); setSelected(index);setPanel(null);setHover(null);setActiveFilm(start);setMuted(true); requestAnimationFrame(() => { const node=filmScroll.current; if(node) node.scrollTop=start*node.clientHeight }) }
  const home=() => { setSelected(null);setPanel(null);setHover(null) }
  return <main className="hpla-experiment">
    <div className="experiment-background" aria-hidden="true"><video ref={background} key={backgroundSrc} src={backgroundSrc} poster={hovered?.image || '/media/road-game-background-poster.jpg'} muted loop playsInline preload="auto" /><div /></div>
    <nav className="experiment-navigation" aria-label="Main navigation">
      <button className="information-toggle" aria-expanded={panel==='information'} onClick={() => setPanel(panel==='information' ? null : 'information')}>(Information)</button>
      <button className="work-toggle" onClick={home}>(Work)</button>
      <button className="contact-toggle" aria-expanded={panel==='contact'} onClick={() => setPanel(panel==='contact' ? null : 'contact')}>(Contact)</button>
    </nav>
    <button className="experiment-brand" aria-label="SUPER STUPID STUDIOS home" onClick={home}><CyclingWordmark /></button>
    {selected===null ? <div className="experiment-projects" aria-label="Selected work">{projects.map((item,index) => <button key={item.slug} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(index)} onBlur={() => setHover(null)} onClick={() => openProject(index)} className={hover===index || hover===null && index===0 ? 'is-active' : ''}>{item.title}</button>)}</div> : <>
      <div className="experiment-films" ref={filmScroll} onScroll={() => { if(filmScroll.current) setActiveFilm(Math.min(sequence.length-1,Math.round(filmScroll.current.scrollTop/filmScroll.current.clientHeight))) }}>{films.map((film,index) => <section className="experiment-film" id={`film-${index}`} key={film.src || index}><Film paused={playback!==null} src={film.src || undefined} poster={film.poster} title={film.title} embed={videoEmbed(film.project.videoUrl)} muted={muted} /><button className="film-open-overlay" onClick={() => setPlayback(index)} aria-label={`Watch ${film.project.title} — ${film.title} with controls`}><span>Watch film</span></button></section>)}</div>
      <div className="experiment-project-title"><h1>{project?.title}</h1><p>{films[activeFilm]?.title}</p><p>{project?.client}</p><p className="project-category">{project?.category}</p></div>
      <div className="film-dots" aria-label="Choose film">{films.map((film,index) => <button key={index} className={activeFilm===index ? 'active' : ''} aria-label={`${film.project.title} — ${film.title}`} aria-pressed={activeFilm===index} onClick={() => filmScroll.current?.scrollTo({top:index*filmScroll.current.clientHeight,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'})} />)}</div>
      <button className="experiment-sound" onClick={() => setMuted(!muted)}>Sound {muted ? 'OFF' : 'ON'}</button>
    </>}
    {panel==='information' && <aside className="experiment-panel information-panel" aria-label="Information"><h1>SUPER STUPID STUDIOS®</h1><p>are we having fun yet?</p><p>A Creative Studio For Smart People &amp; Stupid Ideas</p><h2>{studio.informationTitle}</h2>{studio.informationGroups.map((group,index) => <div className="panel-copy-group" key={index}>{group.map(text => <p key={text}>{text}</p>)}</div>)}<p>SUPER STUPID STUDIOS<br />are we having fun yet?</p><p>{studio.workTitle}</p><details><summary>WHAT WE DO</summary><h2>{studio.offeringsTitle}</h2>{studio.offerings.map(item => <section key={item.title}><h3>{item.title}</h3><p>{item.tagline}</p>{item.description.map(text => <p key={text}>{text}</p>)}<p>{item.capabilities}</p></section>)}</details></aside>}
    {panel==='contact' && <aside className="experiment-panel contact-panel" aria-label="Contact"><h1>{studio.contactTitle}</h1><p>{studio.contactSubtitle}</p><p>General Inquiries</p><a href={`mailto:${studio.email}`}>{studio.email}</a><p>Still having fun?</p></aside>}
    {playback!==null && <PlaybackDialog film={sequence[playback]} onClose={() => setPlayback(null)} />}
    <footer className="experiment-footer">SUPER STUPID STUDIOS © 2026</footer>
  </main>
}
