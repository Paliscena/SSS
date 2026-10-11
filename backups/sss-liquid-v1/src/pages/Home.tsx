import { projects } from '../data/projects'
import { ProjectCard } from '../components/ProjectCard'
import { Contact } from '../components/Contact'
import { Hero } from '../components/Hero'

export function Home() {
  return <main id="main-content" className="home">
    <Hero />
    <section id="work" className="work" aria-labelledby="work-title">
      <div className="section-meta"><h2 id="work-title">01 / Selected work</h2><span>20XX</span></div>
      <div className="project-grid">{projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div>
      <p className="work-end">Lorem ipsum dolor sit amet.</p>
    </section>
    <section id="about" className="about" aria-labelledby="about-title" data-reveal>
      <div className="section-meta"><span>02 / Studio</span></div>
      <div className="about-content"><h2 id="about-title">Lorem ipsum.<br />Dolor sit amet.</h2><div><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div></div>
    </section>
    <Contact />
  </main>
}
