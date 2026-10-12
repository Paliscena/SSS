import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { ProjectImage } from './ProjectImage'

import { videoEmbed } from '../lib/videoEmbed'

function VideoDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const embed = videoEmbed(project.videoUrl)
  const filmSrc = project.filmSrc
  useEffect(() => {
    const node = dialog.current
    const previousOverflow = document.body.style.overflow
    node?.showModal(); document.body.style.overflow = 'hidden'
    return () => { node?.close(); document.body.style.overflow = previousOverflow }
  }, [])
  return <dialog className="film-dialog" ref={dialog} onCancel={onClose} aria-labelledby="film-title">
    <div className="film-dialog-header"><h2 id="film-title">{project.title}</h2><button onClick={onClose} aria-label="Close project video">Close ×</button></div>
    {project.films?.length ? <div className="film-sequence" aria-label="Project films">{project.films.map((film,index) => <section className="film-sequence-item" key={film.src}>
      <h3>0{index+1} / {film.title}</h3>
      <div className={`film-stage${film.portrait ? ' film-stage-portrait' : ''}`}><video src={film.src} poster={film.poster} controls playsInline preload="metadata" aria-label={film.title} onPlay={event => { const active=event.currentTarget; dialog.current?.querySelectorAll('video').forEach(video => { if(video !== active) video.pause() }) }} /></div>
    </section>)}</div> : <div className="film-stage">{filmSrc ? <video src={filmSrc} poster={project.image} controls playsInline preload="metadata" aria-label={`${project.title} full film`} /> : embed ? <iframe src={embed} title={`${project.title} video`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <ProjectImage alt={`Empty grey video placeholder for ${project.title}`} width={1600} height={900} />}</div>}
    <div className="film-dialog-footer"><span>{project.client} / {project.category}</span><span>{embed || filmSrc || project.films?.length ? 'Press play to watch.' : 'Video placeholder — link to come.'}</span></div>
  </dialog>
}

function VideoTile({ project, index, onOpen, previewsActive }: { project: Project; index: number; onOpen: () => void; previewsActive: boolean }) {
  const tile = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync(); media.addEventListener('change',sync)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold:.15 })
    if (tile.current) observer.observe(tile.current)
    return () => { observer.disconnect(); media.removeEventListener('change',sync) }
  }, [])
  const embed = videoEmbed(project.videoUrl)
  const loop = project.previewLoop && Boolean(embed || project.previewSrc)
  const preview = embed ? new URL(embed) : null
  if (preview) {
    const parameters = preview.hostname === 'player.vimeo.com'
      ? {background:'1',autoplay:'1',muted:'1',loop:'1',playsinline:'1',autopause:'0',dnt:'1'}
      : {autoplay:'1',mute:'1',loop:'1',playlist:preview.pathname.split('/').pop()!,controls:'0',playsinline:'1',disablekb:'1',cc_load_policy:'0',iv_load_policy:'3',fs:'0'}
    for (const [key,value] of Object.entries(parameters)) if (value !== undefined) preview.searchParams.set(key,value)
  }
  return <article ref={tile} className="film-tile" data-reveal>
    <button className="film-button" onClick={onOpen} aria-label={`Open ${project.title} video${project.videoUrl || project.filmSrc || project.films?.length ? '' : ' placeholder'}`}>
      <div className={`film-image${project.previewFit === 'contain' ? ' portrait-preview' : ''}`}><ProjectImage src={project.image} alt={project.imageAlt} width={1600} height={900} />
        {loop && visible && previewsActive && !reduced && (project.previewSrc
          ? <video className="film-loop" src={project.previewSrc} poster={project.image} autoPlay loop muted playsInline preload="metadata" controls={false} disablePictureInPicture tabIndex={-1} aria-hidden="true" />
          : <iframe className="film-loop" src={preview!.toString()} title={`${project.title} muted preview`} allow="autoplay" tabIndex={-1} aria-hidden="true" referrerPolicy="strict-origin-when-cross-origin" />)}
        {!project.videoUrl && !project.filmSrc && !project.films?.length && <span className="film-hover" aria-hidden="true">View project</span>}
      </div>
      <div className="film-caption"><span className="film-number">{String(index+1).padStart(2, '0')}</span><h3>{project.title}</h3><span>{project.category}</span></div>
      <span className="film-client">{project.client}</span>
    </button>
  </article>
}

export function VideoWork() {
  const [selected, setSelected] = useState<Project | null>(null)
  return <>
    <div className="film-grid">{projects.map((project,index) => <VideoTile key={project.slug} project={project} index={index} previewsActive={!selected} onOpen={() => setSelected(project)} />)}</div>
    {selected && <VideoDialog project={selected} onClose={() => setSelected(null)} />}
  </>
}
