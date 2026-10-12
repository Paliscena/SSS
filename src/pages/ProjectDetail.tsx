import { Link, useParams } from 'react-router-dom'
import { projects } from '../data/projects'
import { Contact } from '../components/Contact'
import { ProjectImage } from '../components/ProjectImage'

export function ProjectDetail() {
  const { slug } = useParams()
  const index = projects.findIndex((project) => project.slug === slug || project.legacySlug === slug)
  const project = projects[index]
  if (!project) return <main id="main-content" className="not-found"><span className="eyebrow">404 / Page not found.</span><h1>Page<br />not found.</h1><Link to="/">Back to the studio </Link></main>
  const next = projects[(index + 1) % projects.length]
  return <main id="main-content" className="project-detail">
    <section className="detail-heading"><Link className="back-link" to="/#work"> Selected work</Link><div className="section-meta"><span>Project / 0{index + 1}</span><span>{project.films?.length ? project.client : `Placeholder / ${project.year}`}</span></div><h1>{project.title}</h1><div className="detail-subtitle"><p>{project.note}</p><span>{project.category}</span></div></section>
    {project.films?.length ? <section className="project-films" aria-label="Project films"><div className={`project-film-hero${project.films[0].portrait ? ' is-portrait' : ''}`}><h2>01 / {project.films[0].title}</h2><video src={project.films[0].src} poster={project.films[0].poster} controls playsInline preload="metadata" onPlay={event => { const active=event.currentTarget; active.closest('.project-films')?.querySelectorAll('video').forEach(video => { if(video!==active) video.pause() }) }} aria-label={project.films[0].title} /></div><div className="project-film-pair">{project.films.slice(1).map((film,filmIndex) => <article key={film.src}><h2>0{filmIndex+2} / {film.title}</h2><video src={film.src} poster={film.poster} controls playsInline preload="metadata" onPlay={event => { const active=event.currentTarget; active.closest('.project-films')?.querySelectorAll('video').forEach(video => { if(video!==active) video.pause() }) }} aria-label={film.title} /></article>)}</div></section> : <figure className="detail-hero"><ProjectImage src={project.image} alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} /><figcaption>01 / Image placeholder</figcaption></figure>}
    <section className="detail-description" data-reveal><h2>{project.films?.length ? 'About the project.' : 'Lorem ipsum.'}</h2><div><p>{project.description}</p>{!project.films?.length && <span className="micro">Placeholder project / placeholder content.</span>}</div></section>
    <div className="detail-gallery">{project.gallery.map((image, imageIndex) => <figure key={imageIndex} data-reveal><ProjectImage src={image.src} alt={image.alt} /><figcaption>{image.caption}</figcaption></figure>)}</div>
    {project.credits.length > 0 && <section className="credits" data-reveal><h2>Credits.</h2><dl>{project.credits.map((credit, creditIndex) => <div key={creditIndex}><dt>{credit.role}</dt><dd>{credit.name}</dd></div>)}</dl></section>}
    <Link className="next-project" to={`/work/${next.slug}`}><span className="eyebrow">Up next / 0{(index + 1) % projects.length + 1}</span><span className="next-title">{next.title}<span></span></span><span className="micro">Lorem ipsum dolor sit amet.</span></Link>
    <Contact />
  </main>
}
