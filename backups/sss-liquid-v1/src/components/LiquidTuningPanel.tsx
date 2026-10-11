import type { LiquidSettings } from '../lib/liquid/settings'

const controls: { key: keyof LiquidSettings; label: string; min: number; max: number; step: number }[] = [
  { key:'strength', label:'Displacement strength', min:0, max:3, step:.05 },
  { key:'smear', label:'Smear length', min:0, max:2.5, step:.05 },
  { key:'viscosity', label:'Fluid viscosity', min:0, max:1, step:.02 },
  { key:'radius', label:'Interaction radius (px)', min:25, max:180, step:5 },
  { key:'sensitivity', label:'Velocity sensitivity', min:0, max:3, step:.05 },
  { key:'turbulence', label:'Turbulence', min:0, max:1.5, step:.05 },
  { key:'stiffness', label:'Spring stiffness', min:20, max:120, step:2 },
  { key:'damping', label:'Recovery damping', min:6, max:22, step:.5 },
  { key:'resolution', label:'Simulation width', min:128, max:640, step:64 },
]

export default function LiquidTuningPanel({ settings, onChange, onReset }: { settings: LiquidSettings; onChange: (next: LiquidSettings) => void; onReset: () => void }) {
  return <details className="liquid-tuning"><summary>Typography tuning <span>DEV</span></summary><div>
    {controls.map(({key,label,min,max,step}) => <label key={key} htmlFor={`liquid-${key}`}><span>{label}<output>{settings[key]}</output></span><input id={`liquid-${key}`} type="range" min={min} max={max} step={step} value={settings[key]} onChange={event => onChange({...settings,[key]:Number(event.target.value)})} /></label>)}
    <button onClick={onReset}>RESET TYPOGRAPHY</button><p>Local session only. Hidden in production.</p>
  </div></details>
}
