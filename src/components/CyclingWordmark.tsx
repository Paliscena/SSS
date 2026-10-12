import './CyclingWordmark.css'
import { useEffect, useState } from 'react'

const faces = [
  [
    "SSS Anton",
    "SSS Archivo Black",
    "SSS Alfa Slab One"
  ],
  [
    "SSS Bebas Neue",
    "SSS Bungee",
    "SSS Black Ops One"
  ],
  [
    "SSS Creepster",
    "SSS DM Serif Display",
    "SSS Dela Gothic One"
  ],
  [
    "SSS Diplomata",
    "SSS Ewert",
    "SSS Fascinate"
  ],
  [
    "SSS Fruktur",
    "SSS Graduate",
    "SSS Great Vibes"
  ],
  [
    "SSS Grenze Gotisch",
    "SSS Jacquard 12",
    "SSS Jost"
  ],
  [
    "SSS Lobster",
    "SSS Monoton",
    "SSS Orbitron"
  ],
  [
    "SSS Pacifico",
    "SSS Permanent Marker",
    "SSS Playfair Display"
  ],
  [
    "SSS Press Start 2P",
    "SSS Righteous",
    "SSS Rubik Mono One"
  ],
  [
    "SSS Russo One",
    "SSS Silkscreen",
    "SSS Space Mono"
  ]
]

export function CyclingWordmark() {
  const [frame,setFrame] = useState(0)
  useEffect(() => {
    let ready=false
    void Promise.all(faces.flat().map(face => document.fonts.load(`24px "${face}"`))).then(() => { ready=true })
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const interval = setInterval(() => {
      if(ready && !media.matches && !document.hidden) setFrame(value => (value+1)%faces.length)
    },500)
    return () => clearInterval(interval)
  },[])
  return <span className="cycling-wordmark" aria-hidden="true">{faces[frame].map((face,index) => <span key={index} style={{fontFamily:`"${face}"`,fontWeight:400}}>S</span>)}<sup>®</sup></span>
}
