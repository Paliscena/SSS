import { glassLimits as renderingLimits } from './settings'
import type { LiquidGlassSettings } from './settings'
import { renderShader, simulationShader, heightShader, vertexShader } from './shaders'

type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer }
type Stroke = { ax: number; ay: number; bx: number; by: number; speed: number }

export function createLiquidGlassEngine(canvas: HTMLCanvasElement, stage: HTMLElement, heading: HTMLElement, initial: LiquidGlassSettings, region?: HTMLElement) {
  const interaction = region || stage
  const bounds = () => {
    const rect = (region || stage).getBoundingClientRect()
    if (!region) return rect
    const header = document.querySelector<HTMLElement>('.header')
    const top = rect.top - (header?.offsetHeight || 0)
    const divider = document.querySelector<HTMLElement>('#about > .section-meta')
    const bottom = divider?.getBoundingClientRect().top || rect.bottom
    return { left:rect.left, top, width:rect.width, height:Math.max(1,bottom-top) }
  }
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null
  const programs: WebGLProgram[] = []
  let targets: Target[] = []
  let heights: Target[] = []
  let source: WebGLTexture | null = null
  let destroyed = false
  let settings = { ...initial }
  let width = 1, height = 1, simWidth = 1, simHeight = 1, read = 0
  let raf = 0, lastFrame = 0
  let frameCost = 16, samples = 0, renderScale = 1
  let visible = true
  let previous: { x: number; y: number; time: number } | null = null
  let strokes: Stroke[] = []
  let touchStart: { x:number; y:number; time:number; scroll:number } | null = null
  const segmentData = new Float32Array(renderingLimits.maxSegments * 4)
  const speedData = new Float32Array(renderingLimits.maxSegments)
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  function program(fragment: string) {
    const compiled: WebGLShader[] = []
    const result = gl!.createProgram()!
    try {
      for (const [type, code] of [[gl!.VERTEX_SHADER, vertexShader], [gl!.FRAGMENT_SHADER, fragment]] as const) {
        const shader = gl!.createShader(type)!
        compiled.push(shader)
        gl!.shaderSource(shader, code)
        gl!.compileShader(shader)
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) ?? 'Shader compilation failed')
        gl!.attachShader(result, shader)
      }
      gl!.linkProgram(result)
      if (!gl!.getProgramParameter(result, gl!.LINK_STATUS)) throw new Error(gl!.getProgramInfoLog(result) ?? 'Shader link failed')
      programs.push(result)
      return result
    } catch (error) {
      gl!.deleteProgram(result)
      throw error
    } finally {
      compiled.forEach(shader => gl!.deleteShader(shader))
    }
  }
  let simulation: WebGLProgram, rendering: WebGLProgram, elevation: WebGLProgram
  try { simulation = program(simulationShader); rendering = program(renderShader); elevation = program(heightShader) }
  catch (error) { programs.forEach(p => gl.deleteProgram(p)); gl.deleteVertexArray(vao); throw error }
  const uniforms = (p: WebGLProgram, names: string[]) => Object.fromEntries(names.map(name => [name, gl.getUniformLocation(p, name)]))
  const sim = uniforms(simulation, ['field', 'size', 'viewport', 'dt', 'strength', 'smear', 'viscosity', 'radius', 'sensitivity', 'turbulence', 'stiffness', 'damping', 'count', 'segments[0]', 'speeds[0]'])
  const draw = uniforms(rendering, ['source', 'field', 'heightField', 'size', 'time', 'aspect', 'thickness', 'distortion', 'refraction', 'chromaticAberration', 'ambientFlow', 'reflection', 'fullBleed'])
  const heightUniforms = uniforms(elevation, ['heightField', 'flow', 'size', 'dt', 'elasticity', 'viscosity'])
  function texture(filter: number) {
    const result = gl!.createTexture()!
    gl!.bindTexture(gl!.TEXTURE_2D, result)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    return result
  }
  function releaseTargets() { [...targets,...heights].forEach(t => { gl!.deleteTexture(t.texture); gl!.deleteFramebuffer(t.framebuffer) }); targets = []; heights = [] }
  function allocate() {
    releaseTargets()
    const mobileLimit = window.matchMedia('(pointer: coarse)').matches ? 256 : settings.resolution
    const resolution = Math.min(settings.resolution, mobileLimit)
    simWidth = Math.round(resolution)
    simHeight = Math.max(64, Math.round(resolution * height / width))
    for (let i = 0; i < 4; i++) {
      const tex = texture(gl!.NEAREST)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA16F, simWidth, simHeight, 0, gl!.RGBA, gl!.HALF_FLOAT, null)
      const framebuffer = gl!.createFramebuffer()!
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, framebuffer)
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      (i < 2 ? targets : heights).push({ texture: tex, framebuffer })
      if (gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) !== gl!.FRAMEBUFFER_COMPLETE) throw new Error('Floating-point target unavailable')
    }
    reset()
  }
  function bind(tex: WebGLTexture, unit: number) { gl!.activeTexture(gl!.TEXTURE0 + unit); gl!.bindTexture(gl!.TEXTURE_2D, tex) }
  function render() {
    if (!source || targets.length !== 2 || destroyed) return
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
    gl!.viewport(0, 0, canvas.width, canvas.height)
    gl!.useProgram(rendering)
    bind(source, 0); bind(targets[read].texture, 1); bind(heights[read].texture, 2)
    gl!.uniform1i(draw.source, 0); gl!.uniform1i(draw.field, 1); gl!.uniform1i(draw.heightField, 2)
    gl!.uniform2f(draw.size, simWidth, simHeight)
    gl!.uniform1f(draw.time, performance.now() / 1000)
    gl!.uniform1f(draw.aspect, width / height)
    gl!.uniform1f(draw.fullBleed,region ? 1 : 0)
    for (const name of ['thickness','distortion','refraction','chromaticAberration','ambientFlow','reflection'] as const) {
      const mobileScale=width<600 && (name==='distortion' || name==='ambientFlow') ? .65 : 1
      gl!.uniform1f(draw[name],settings[name]*mobileScale)
    }
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }
  function reset() {
    if (destroyed) return
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0; previous = null; strokes = []; read = 0;
    [...targets,...heights].forEach(t => { gl!.bindFramebuffer(gl!.FRAMEBUFFER, t.framebuffer); gl!.clearColor(0,0,0,0); gl!.clear(gl!.COLOR_BUFFER_BIT) })
    render()
    stage.dataset.liquidState = 'rest'
  }
  function rebuild() {
    if (destroyed) return
    const rect = bounds()
    if (rect.width < 1 || rect.height < 1) return
    width = rect.width; height = rect.height
    if (region) {
      const local = stage.getBoundingClientRect()
      canvas.style.left=`${rect.left-local.left}px`; canvas.style.top=`${rect.top-local.top}px`
      canvas.style.width=`${width}px`; canvas.style.height=`${height}px`
    }
    const hardwareMax = gl!.getParameter(gl!.MAX_TEXTURE_SIZE) as number
    const mobile = matchMedia('(pointer:coarse)').matches
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.25 : renderingLimits.maxDpr, Math.min(hardwareMax, renderingLimits.maxTextureSize) / Math.max(width, height))
    renderScale=1; samples=0; frameCost=16
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
    const raster = document.createElement('canvas'); raster.width = canvas.width; raster.height = canvas.height
    const ctx = raster.getContext('2d')!
    ctx.scale(dpr,dpr); ctx.fillStyle=getComputedStyle(stage).getPropertyValue('--paper').trim() || '#90979e'; ctx.fillRect(0,0,width,height); ctx.textBaseline='alphabetic'
    heading.querySelectorAll<HTMLElement>('[data-glass-text], .goo-letter, .goo-word sup').forEach(node => {
      const box = node.getBoundingClientRect(), style = getComputedStyle(node)
      ctx.fillStyle = style.color
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const metrics = ctx.measureText(node.textContent ?? '')
      const ascent = metrics.fontBoundingBoxAscent || parseFloat(style.fontSize) * .8
      const descent = metrics.fontBoundingBoxDescent || parseFloat(style.fontSize) * .2
      const baseline = box.top - rect.top + (box.height - ascent - descent) / 2 + ascent
      ctx.fillText(node.textContent ?? '', box.left - rect.left, baseline)
    })
    if (source) gl!.deleteTexture(source)
    source = texture(gl!.LINEAR)
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, raster)
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false)
    allocate(); render(); wake()
    stage.dataset.liquidReady = 'true'
  }
  function step(now: number) {
    raf = 0
    if (destroyed || !visible || document.hidden) { reset(); return }
    if (lastFrame) {
      frameCost += ((now-lastFrame)-frameCost)*.05
      samples++
      if (samples > 90 && frameCost > 24 && renderScale > .55) {
        renderScale *= .85
        canvas.width = Math.max(1,Math.round(canvas.width*.85))
        canvas.height = Math.max(1,Math.round(canvas.height*.85))
        samples = 0
      }
    }
    const dt = Math.min(lastFrame ? (now - lastFrame) / 1000 : 1 / 60, 1 / 30)
    lastFrame = now
    const impulses = strokes.splice(0, renderingLimits.maxSegments)
    impulses.forEach((s, index) => { segmentData.set([s.ax,s.ay,s.bx,s.by], index*4); speedData[index] = s.speed })
    gl!.useProgram(simulation)
    gl!.uniform1i(sim.field, 0); gl!.uniform2f(sim.size, simWidth, simHeight); gl!.uniform2f(sim.viewport, width, height)
    gl!.uniform1f(sim.dt, dt)
    gl!.uniform1f(sim.strength,settings.distortion*1.8)
    gl!.uniform1f(sim.smear,1.25)
    gl!.uniform1f(sim.viscosity,settings.viscosity)
    gl!.uniform1f(sim.radius,settings.radius)
    gl!.uniform1f(sim.sensitivity,settings.sensitivity)
    gl!.uniform1f(sim.turbulence,.18)
    gl!.uniform1f(sim.stiffness,settings.elasticity)
    gl!.uniform1f(sim.damping,5+settings.viscosity*9)
    // Two substeps stabilize the spring on slower devices, inject strokes only once.
    for (let substep = 0; substep < 2; substep++) {
      gl!.uniform1f(sim.dt, dt / 2)
      gl!.uniform1i(sim.count, substep === 0 ? impulses.length : 0)
      gl!.uniform4fv(sim['segments[0]'], segmentData); gl!.uniform1fv(sim['speeds[0]'], speedData)
      bind(targets[read].texture, 0)
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, targets[1-read].framebuffer)
      gl!.viewport(0,0,simWidth,simHeight); gl!.drawArrays(gl!.TRIANGLES,0,3)
      gl!.useProgram(elevation)
      bind(heights[read].texture,0); bind(targets[1-read].texture,1)
      gl!.uniform1i(heightUniforms.heightField,0); gl!.uniform1i(heightUniforms.flow,1)
      gl!.uniform2f(heightUniforms.size,simWidth,simHeight)
      gl!.uniform1f(heightUniforms.dt,dt/2)
      gl!.uniform1f(heightUniforms.elasticity,settings.elasticity)
      gl!.uniform1f(heightUniforms.viscosity,settings.viscosity)
      gl!.bindFramebuffer(gl!.FRAMEBUFFER,heights[1-read].framebuffer)
      gl!.drawArrays(gl!.TRIANGLES,0,3); read=1-read
      gl!.useProgram(simulation)
    }
    render()
    raf = requestAnimationFrame(step)
  }
  function wake() { if (!raf && visible && !document.hidden) { lastFrame = 0; raf = requestAnimationFrame(step) } }
  function pointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    const rect = bounds()
    const now = performance.now()
    const x = (event.clientX - rect.left) / rect.width, y = 1 - (event.clientY - rect.top) / rect.height
    if (previous) {
      const dx = (x - previous.x) * width, dy = (y - previous.y) * height
      const distance = Math.hypot(dx,dy)
      if (distance > .2) {
        const speed = Math.min(distance / Math.max((now-previous.time)/1000, .008), 4000)
        strokes.push({ ax: previous.x, ay: previous.y, bx:x, by:y, speed })
        if (strokes.length > renderingLimits.maxSegments) strokes.shift()
        stage.dataset.liquidState = 'active'; wake()
      }
    }
    previous = { x,y,time:now }
  }
  function leave() { previous = null }
  function down(event: PointerEvent) {
    if (event.pointerType === 'mouse') { previous = null; pointer(event); return }
    if (event.target instanceof Element && event.target.closest('a,button,summary,.section-sticker')) return
    touchStart = {x:event.clientX,y:event.clientY,time:performance.now(),scroll:window.scrollY}
  }
  function up(event: PointerEvent) {
    if (event.pointerType === 'mouse' || !touchStart) return
    const start = touchStart; touchStart = null
    if (performance.now()-start.time>350 || Math.hypot(event.clientX-start.x,event.clientY-start.y)>8 || Math.abs(window.scrollY-start.scroll)>6) return
    const rect=bounds(), x=(event.clientX-rect.left)/rect.width, y=1-(event.clientY-rect.top)/rect.height
    // A short radial impulse only after a confirmed tap; never grab a swipe.
    for (let i=0;i<8;i++) {
      const angle=i*Math.PI/4
      strokes.push({ax:x,ay:y,bx:x+Math.cos(angle)*7/width,by:y+Math.sin(angle)*7/height,speed:280})
    }
    stage.dataset.liquidState='active'; wake()
  }
  function cancelTouch() { touchStart=null; previous=null }
  function key(event: KeyboardEvent) { if (event.key === 'Escape') { reset(); wake() } }
  function hidden() { if (document.hidden) reset(); else wake() }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) reset(); else wake() }, { threshold: .01 })
  const resizeObserver = new ResizeObserver(() => { try { rebuild() } catch (error) { fail(error) } })
  const contentObserver = new MutationObserver(() => { try { rebuild() } catch (error) { fail(error) } })
  const content = stage.querySelector('.liquid-glass-content') || heading
  contentObserver.observe(content,{subtree:true,childList:true,characterData:true})
  const onContextLost = (event: Event) => { event.preventDefault(); fail(new Error('WebGL context lost')) }
  function fail(error: unknown) { if (import.meta.env.DEV) console.warn('Liquid typography: static fallback.', error); dispose() }
  function dispose() {
    if (destroyed) return
    destroyed = true; cancelAnimationFrame(raf)
    observer.disconnect(); resizeObserver.disconnect(); contentObserver.disconnect()
    interaction.removeEventListener('pointermove', pointer); interaction.removeEventListener('pointerleave', leave)
    interaction.removeEventListener('pointerdown', down); interaction.removeEventListener('pointerup', up); interaction.removeEventListener('pointercancel', cancelTouch)
    stage.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', hidden)
    canvas.removeEventListener('webglcontextlost', onContextLost)
    releaseTargets(); if (source) gl!.deleteTexture(source)
    programs.forEach(p => gl!.deleteProgram(p)); gl!.deleteVertexArray(vao)
    delete stage.dataset.liquidReady; delete stage.dataset.liquidState
  }
  try { rebuild() } catch (error) { dispose(); throw error }
  interaction.addEventListener('pointermove', pointer, { passive: true }); interaction.addEventListener('pointerleave', leave)
  interaction.addEventListener('pointerdown', down, { passive: true }); interaction.addEventListener('pointerup', up); interaction.addEventListener('pointercancel', cancelTouch)
  stage.addEventListener('keydown', key); document.addEventListener('visibilitychange', hidden)
  canvas.addEventListener('webglcontextlost', onContextLost)
  observer.observe(interaction); resizeObserver.observe(interaction); if(region) resizeObserver.observe(stage); wake()
  return { dispose, reset, setSettings(next: LiquidGlassSettings) { if (destroyed) return; const changed = settings.resolution !== next.resolution; settings = {...next}; if (changed) { try { allocate() } catch (error) { fail(error) } } } }
}
