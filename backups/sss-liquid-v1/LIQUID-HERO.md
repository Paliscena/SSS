# Liquid typography hero

The homepage still imports `Hero`. That module now re-exports the reusable `LiquidTypographyHero`; navigation, project records, and other sections are unchanged. Only the hero uses the requested near-black type / warm off-white palette.

## Rendering

`src/lib/liquid/engine.ts` rasterizes the existing, centered DOM heading into an immutable transparent texture after the self-hosted font loads. The GPU samples this high-resolution source through a lower-resolution displacement field. Two RGBA16F ping-pong framebuffers store signed displacement (RG) and velocity (BA). Swept directional pointer impulses, viscosity, advection, and small trailing curls extend the actual letter mask; there are no text clones or blur passes.

`src/lib/liquid/shaders.ts` separates simulation from compositing. A semi-implicit damped spring pulls the field back to zero. At rest the original unwarped source is displayed, with a final zero-field reset after the configurable recovery window, so distortion cannot leave permanent trails.

## Tuning

Run `npm run dev` and expand **Typography tuning** at the bottom right. Strength, smear length, viscosity, radius (CSS pixels), velocity sensitivity, turbulence, spring stiffness, damping, and simulation width update live. RESET clears the field immediately. Controls are excluded from `npm run build` output.

Defaults and limits are in `src/lib/liquid/settings.ts`. Recovery time is set by stiffness/damping; `recoverySeconds` is the final exact-rest cutoff. High-DPI type is capped at DPR 2 and a 4096-pixel texture edge. The simulation defaults to 384 pixels wide, capped at 256 on coarse pointers. Its height follows the hero aspect ratio. Pointer events are queued (at most eight segments); no React render occurs per animation frame.

## Fallback and lifecycle

WebGL2 plus `EXT_color_buffer_float` are required for the effect. Unsupported devices, lost contexts, and reduced-motion preferences retain the real semantic heading. The canvas is hidden from assistive technology. Escape resets. Touch manipulation captures the finger only within the type stage; scrolling and navigation outside that area keep their normal behavior.

Resize rebuilds the source and framebuffers. IntersectionObserver and page visibility pause/clear the simulation when it cannot be seen; at rest there is no animation loop. React unmount deletes textures, framebuffers, shader programs, and the vertex array, cancels animation frames, and removes listeners/observers.

Preview: `npm run dev` (controls) or `npm run build && npm run preview` (production).

WebGL reference: https://registry.khronos.org/webgl/extensions/EXT_color_buffer_float/
