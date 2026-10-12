import { useEffect, useRef, useState } from 'react'

const films = ['landing-all-in-my-mind', 'landing-the-fix', 'landing-fallen-angel', 'landing-unite-the-bay']
const source = (index: number) => `https://media.superstupidstudios.com/${films[index % films.length]}.mp4`

export function LandingFilms() {
  const players = useRef<(HTMLVideoElement | null)[]>([])
  const current = useRef(0)
  const active = useRef(0)
  const [front, setFront] = useState(0)
  useEffect(() => {
    const nodes = [...players.current]
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    players.current.forEach((video,index) => { if(video) { video.src=source(index); video.load() } })
    const sync = () => {
      if (media.matches || document.hidden) { players.current.forEach(video => video?.pause()) }
      else { void players.current[active.current]?.play().catch(() => {}) }
    }
    sync(); media.addEventListener('change',sync); document.addEventListener('visibilitychange',sync)
    return () => { media.removeEventListener('change',sync); document.removeEventListener('visibilitychange',sync); nodes.forEach(video => video?.pause()) }
  }, [])
  const next = () => {
    const old=active.current, nextPlayer=1-old
    current.current++; active.current=nextPlayer; setFront(nextPlayer)
    const video=players.current[nextPlayer]
    if(video) { video.currentTime=0; void video.play().catch(() => {}) }
    const standby=players.current[old]
    if(standby) { standby.src=source(current.current+1); standby.load() }
  }
  return <><div className="landing-films" aria-hidden="true">{[0,1].map(index => <video key={index} ref={node => { players.current[index]=node }} className={front===index ? 'is-front' : ''} crossOrigin="anonymous" muted playsInline preload="auto" poster="/media/landing-film-poster.jpg" onEnded={next} />)}</div></>
}
