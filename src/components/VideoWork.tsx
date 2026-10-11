import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { ProjectImage } from './ProjectImage'

import { videoEmbed } from '../lib/videoEmbed'

function VideoDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const embed = videoEmbed(project.videoUrl)
  useEffect(() => {
    const node = dialog.current
    const previousOverflow = document.body.style.overflow
    node?.showModal(); document.body.style.overflow = 'hidden'
    return () => { node?.close(); document.body.style.overflow = previousOverflow }
  }, [])
  return <dialog className="film-dialog" ref={dialog} onCancel={onClose} aria-labelledby="film-title">
    <div className="film-dialog-header"><h2 id="film-title">{project.title}</h2><button onClick={onClose} aria-label="Close project video">Close ×</button></div>
    <div className="film-stage">{embed ? <iframe src={embed} title={`${project.title} video`} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <ProjectImage alt={`Empty grey video placeholder for ${project.title}`} width={1600} height={900} />}</div>
    <div className="film-dialog-footer"><span>{project.client} / {project.category}</span><span>{embed ? 'Press play to watch.' : 'Video placeholder — link to come.'}</span></div>
  </dialog>
}

export function VideoWork() {
  const [selected, setSelected] = useState<Project | null>(null)
  return <>
    <div className="film-grid">{projects.map((project,index) => <article className="film-tile" data-reveal key={project.slug}>
      <button className="film-button" onClick={() => setSelected(project)} aria-label={`Open ${project.title} video${project.videoUrl ? '' : ' placeholder'}`}>
        <div className="film-image"><ProjectImage src={project.image} alt={project.imageAlt} width={1600} height={900} /><span className="film-hover" aria-hidden="true">{project.videoUrl ? 'Play film' : 'View project'} </span></div>
        <div className="film-caption"><span className="film-number">0{index+1}</span><h3>{project.title}</h3><span>{project.category}</span></div>
        <span className="film-client">{project.client}</span>
      </button>
    </article>)}</div>
    {selected && <VideoDialog project={selected} onClose={() => setSelected(null)} />}
  </>
}
