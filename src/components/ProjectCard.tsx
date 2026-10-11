import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import { ProjectImage } from './ProjectImage'

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return <article className="project" data-reveal>
    <Link className="project-link" to={`/work/${project.slug}`} aria-label={`View ${project.title}, placeholder project`}>
      <div className="project-image"><ProjectImage src={project.image} alt={project.imageAlt} /></div>
      <div className="project-caption"><span className="project-number">0{index + 1}</span><div><h3>{project.title}</h3><p>{project.category}</p></div><span>{project.year}</span><span aria-hidden="true"></span></div>
    </Link>
  </article>
}
