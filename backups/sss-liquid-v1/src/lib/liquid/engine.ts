import { renderingLimits } from './settings'
import type { LiquidSettings } from './settings'
import { renderShader, simulationShader, vertexShader } from './shaders'

type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer }
type Stroke = { ax: number; ay: number; bx: number; by: number; speed: number }

export function createLiquidEngine(canvas: HTMLCanvasElement, stage: HTMLElement, heading: HTMLElement, initial: LiquidSettings) {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null
  const programs: WebGLProgram[] = []
  let targets: Target[] = []
  let source: WebGLTexture | null = null
  let destroyed = false
  let settings = { ...initial }
  let width = 1, height = 1, simWidth = 1, simHeight = 1, read = 0
  let raf = 0, lastFrame = 0, lastInput = 0
  let visible = true
  let previous: { x: number; y: number; time: number } | null = null
  let strokes: Stroke[] = []
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
  let simulation: WebGLProgram, rendering: WebGLProgram
  try { simulation = program(simulationShader); rendering = program(renderShader) }
  catch (error) { programs.forEach(p => gl.deleteProgram(p)); gl.deleteVertexArray(vao); throw error }
  const uniforms = (p: WebGLProgram, names: string[]) => Object.fromEntries(names.map(name => [name, gl.getUniformLocation(p, name)]))
  const sim = uniforms(simulation, ['field', 'size', 'viewport', 'dt', 'strength', 'smear', 'viscosity', 'radius', 'sensitivity', 'turbulence', 'stiffness', 'damping', 'count', 'segments[0]', 'speeds[0]'])
  const draw = uniforms(rendering, ['source', 'field', 'size'])
  function texture(filter: number) {
    const result = gl!.createTexture()!
    gl!.bindTexture(gl!.TEXTURE_2D, result)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    return result
  }
  function releaseTargets() { targets.forEach(t => { gl!.deleteTexture(t.texture); gl!.deleteFramebuffer(t.framebuffer) }); targets = [] }
  function allocate() {
    releaseTargets()
    const mobileLimit = window.matchMedia('(pointer: coarse)').matches ? 256 : settings.resolution
    const resolution = Math.min(settings.resolution, mobileLimit)
    simWidth = Math.round(resolution)
    simHeight = Math.max(64, Math.round(resolution * height / width))
    for (let i = 0; i < 2; i++) {
      const tex = texture(gl!.NEAREST)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA16F, simWidth, simHeight, 0, gl!.RGBA, gl!.HALF_FLOAT, null)
      const framebuffer = gl!.createFramebuffer()!
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, framebuffer)
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0)
      targets.push({ texture: tex, framebuffer })
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
    bind(source, 0); bind(targets[read].texture, 1)
    gl!.uniform1i(draw.source, 0); gl!.uniform1i(draw.field, 1)
    gl!.uniform2f(draw.size, simWidth, simHeight)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }
  function reset() {
    if (destroyed) return
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0; previous = null; strokes = []; read = 0
    targets.forEach(t => { gl!.bindFramebuffer(gl!.FRAMEBUFFER, t.framebuffer); gl!.clearColor(0,0,0,0); gl!.clear(gl!.COLOR_BUFFER_BIT) })
    render()
    stage.dataset.liquidState = 'rest'
  }
  function rebuild() {
    if (destroyed) return
    const rect = stage.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    width = rect.width; height = rect.height
    const hardwareMax = gl!.getParameter(gl!.MAX_TEXTURE_SIZE) as number
    const dpr = Math.min(devicePixelRatio || 1, renderingLimits.maxDpr, Math.min(hardwareMax, renderingLimits.maxTextureSize) / Math.max(width, height))
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
    const raster = document.createElement('canvas'); raster.width = canvas.width; raster.height = canvas.height
    const ctx = raster.getContext('2d')!
    ctx.scale(dpr, dpr); ctx.fillStyle = '#151515'; ctx.textBaseline = 'alphabetic'
    heading.querySelectorAll<HTMLElement>('.hero-letter, .hero-word sup').forEach(node => {
      const box = node.getBoundingClientRect(), style = getComputedStyle(node)
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
    allocate(); render()
    stage.dataset.liquidReady = 'true'
  }
  function step(now: number) {
    raf = 0
    if (destroyed || !visible || document.hidden) { reset(); return }
    const elapsed = (now - lastInput) / 1000
    if (elapsed > renderingLimits.recoverySeconds) { reset(); return }
    const dt = Math.min(lastFrame ? (now - lastFrame) / 1000 : 1 / 60, 1 / 30)
    lastFrame = now
    const impulses = strokes.splice(0, renderingLimits.maxSegments)
    impulses.forEach((s, index) => { segmentData.set([s.ax,s.ay,s.bx,s.by], index*4); speedData[index] = s.speed })
    gl!.useProgram(simulation)
    gl!.uniform1i(sim.field, 0); gl!.uniform2f(sim.size, simWidth, simHeight); gl!.uniform2f(sim.viewport, width, height)
    gl!.uniform1f(sim.dt, dt)
    for (const name of ['strength','smear','viscosity','radius','sensitivity','turbulence','stiffness','damping'] as const) gl!.uniform1f(sim[name], settings[name])
    // Two substeps stabilize the spring on slower devices, inject strokes only once.
    for (let substep = 0; substep < 2; substep++) {
      gl!.uniform1f(sim.dt, dt / 2)
      gl!.uniform1i(sim.count, substep === 0 ? impulses.length : 0)
      gl!.uniform4fv(sim['segments[0]'], segmentData); gl!.uniform1fv(sim['speeds[0]'], speedData)
      bind(targets[read].texture, 0)
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, targets[1-read].framebuffer)
      gl!.viewport(0,0,simWidth,simHeight); gl!.drawArrays(gl!.TRIANGLES,0,3); read = 1-read
    }
    render()
    raf = requestAnimationFrame(step)
  }
  function wake() { if (!raf && visible && !document.hidden) { lastFrame = 0; raf = requestAnimationFrame(step) } }
  function pointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse' && event.type === 'pointermove' && event.buttons === 0) return
    const rect = stage.getBoundingClientRect()
    const now = performance.now()
    const x = (event.clientX - rect.left) / rect.width, y = 1 - (event.clientY - rect.top) / rect.height
    if (previous) {
      const dx = (x - previous.x) * width, dy = (y - previous.y) * height
      const distance = Math.hypot(dx,dy)
      if (distance > .2) {
        const speed = Math.min(distance / Math.max((now-previous.time)/1000, .008), 4000)
        strokes.push({ ax: previous.x, ay: previous.y, bx:x, by:y, speed })
        if (strokes.length > renderingLimits.maxSegments) strokes.shift()
        lastInput = now; stage.dataset.liquidState = 'active'; wake()
      }
    }
    previous = { x,y,time:now }
  }
  function leave() { previous = null }
  function down(event: PointerEvent) { previous = null; pointer(event); if (event.pointerType !== 'mouse') stage.setPointerCapture(event.pointerId) }
  function up(event: PointerEvent) { if (event.pointerType !== 'mouse') { previous = null; if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId) } }
  function key(event: KeyboardEvent) { if (event.key === 'Escape') reset() }
  function hidden() { if (document.hidden) reset() }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) reset() }, { threshold: .01 })
  const resizeObserver = new ResizeObserver(() => { try { rebuild() } catch (error) { fail(error) } })
  const onContextLost = (event: Event) => { event.preventDefault(); fail(new Error('WebGL context lost')) }
  function fail(error: unknown) { if (import.meta.env.DEV) console.warn('Liquid typography: static fallback.', error); dispose() }
  function dispose() {
    if (destroyed) return
    destroyed = true; cancelAnimationFrame(raf)
    observer.disconnect(); resizeObserver.disconnect()
    stage.removeEventListener('pointermove', pointer); stage.removeEventListener('pointerleave', leave)
    stage.removeEventListener('pointerdown', down); stage.removeEventListener('pointerup', up); stage.removeEventListener('pointercancel', leave)
    stage.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', hidden)
    canvas.removeEventListener('webglcontextlost', onContextLost)
    releaseTargets(); if (source) gl!.deleteTexture(source)
    programs.forEach(p => gl!.deleteProgram(p)); gl!.deleteVertexArray(vao)
    delete stage.dataset.liquidReady; delete stage.dataset.liquidState
  }
  try { rebuild() } catch (error) { dispose(); throw error }
  stage.addEventListener('pointermove', pointer, { passive: true }); stage.addEventListener('pointerleave', leave)
  stage.addEventListener('pointerdown', down, { passive: true }); stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', leave)
  stage.addEventListener('keydown', key); document.addEventListener('visibilitychange', hidden)
  canvas.addEventListener('webglcontextlost', onContextLost)
  observer.observe(stage); resizeObserver.observe(stage)
  return { dispose, reset, setSettings(next: LiquidSettings) { if (destroyed) return; const changed = settings.resolution !== next.resolution; settings = {...next}; if (changed) { try { allocate() } catch (error) { fail(error) } } } }
}
