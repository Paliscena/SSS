export interface LiquidSettings {
  strength: number
  smear: number
  viscosity: number
  radius: number
  sensitivity: number
  turbulence: number
  stiffness: number
  damping: number
  resolution: number
}

export const defaultSettings: LiquidSettings = {
  strength: 1.35,
  smear: 1.1,
  viscosity: 0.72,
  radius: 90,
  sensitivity: 1.25,
  turbulence: 0.35,
  stiffness: 58,
  damping: 12,
  resolution: 384,
}

// Source rasterization and simulation are independent: crisp type, small field.
export const renderingLimits = { maxDpr: 2, maxTextureSize: 4096, recoverySeconds: 3.5, maxSegments: 8 }
