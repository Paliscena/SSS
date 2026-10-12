# SSS liquid glass

Original WebGL2 implementation. No external shader/demo code or assets.

`LiquidGlassSurface` wraps the existing hero, preserving its semantic HTML.
It uses two ping-pong RGBA16F displacement/velocity textures and two height/velocity
textures. The height pass receives compression from the flow field, propagates
surface tension, and damps momentum. GLSL derives normals from the simulated
height plus a slowly evolving membrane. Snell refraction, Schlick Fresnel,
procedural studio reflections, narrow specular highlights, and edge-weighted RGB
separation render the surface. Smooth union blends an orbiting lobe into the main
membrane. The reference recording's cloud image is not reproduced.

## Configuration

Pass a `settings` object to `LiquidGlassSurface`, or edit `defaultGlassSettings`.
All values are bounded by `resolveGlassSettings`:

| Parameter | Range | Purpose |
| --- | --- | --- |
| thickness | 0–2 | Optical depth |
| distortion | 0–2 | Refraction and material displacement |
| viscosity | 0–1 | Resistance and velocity damping |
| elasticity | 4–60 | Recovery force |
| refraction | 1.01–2 | Index of refraction |
| chromaticAberration | 0–0.012 | Edge separation in texture coordinates |
| sensitivity | 0–3 | Pointer velocity response |
| radius | 25–220 | Stroke radius in CSS pixels |
| ambientFlow | 0–1 | Idle membrane motion |
| reflection | 0–1 | Reflected light strength |
| resolution | 128–512 | Simulation width |

The source texture is rasterized from the **actual hero typography**, measured
from its live glyph layout and computed colors. It is not a screenshot of the
entire DOM: generic HTML, video, links, and external images are not automatically
captured. Other scenes can use glyphs or elements marked `data-glass-text`.
The shader is scoped to its surface, leaving navigation and other sections intact.

Fonts load before capture. Resize and content changes rebuild the source. Touch
input is tap-only: a short radial impulse follows a confirmed tap; swipe gestures
never inject forces or get captured, keeping native mobile scrolling. Escape
clears user forces. Reduced motion or missing floating-point WebGL2 support uses
the original HTML. Offscreen/hidden surfaces suspend rendering. Mobile DPR and
simulation sizes are capped; sustained slow frames reduce output resolution.
All programs, textures, framebuffers, event listeners, and observers are disposed.

Performance targets are device-dependent; a 60 FPS target is not a guarantee.
Test physical iOS/Android devices before release. The current implementation has
been checked in the local browser and is not yet published.
