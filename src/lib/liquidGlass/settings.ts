export interface LiquidGlassSettings {
  thickness: number
  distortion: number
  viscosity: number
  elasticity: number
  refraction: number
  chromaticAberration: number
  sensitivity: number
  radius: number
  ambientFlow: number
  reflection: number
  resolution: number
}
export const defaultGlassSettings: LiquidGlassSettings = {
  thickness: .72, distortion: .65, viscosity: .88, elasticity: 14,
  refraction: 1.46, chromaticAberration: .003, sensitivity: 1.2,
  radius: 110, ambientFlow: .4, reflection: .72, resolution: 320,
}
export const glassLimits = { maxDpr: 1.75, maxTextureSize: 3072, maxSegments: 8 }

export function resolveGlassSettings(input: Partial<LiquidGlassSettings> = {}): LiquidGlassSettings {
  const limits: Record<keyof LiquidGlassSettings, [number,number]> = {
    thickness:[0,2], distortion:[0,2], viscosity:[0,1], elasticity:[4,60],
    refraction:[1.01,2], chromaticAberration:[0,.012], sensitivity:[0,3],
    radius:[25,220], ambientFlow:[0,1], reflection:[0,1], resolution:[128,512],
  }
  const output = {...defaultGlassSettings}
  for (const key of Object.keys(limits) as (keyof LiquidGlassSettings)[]) {
    const value=input[key]
    if (typeof value==='number' && Number.isFinite(value)) output[key]=Math.max(limits[key][0],Math.min(limits[key][1],value))
  }
  return output
}
