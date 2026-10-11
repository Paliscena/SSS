export const vertexShader = `#version 300 es
precision highp float;
out vec2 uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

// Signed RG = displacement; BA = velocity. Ping-pong state never changes source pixels.
export const simulationShader = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 state;
uniform sampler2D field;
uniform vec2 size;
uniform vec2 viewport;
uniform float dt;
uniform float strength;
uniform float smear;
uniform float viscosity;
uniform float radius;
uniform float sensitivity;
uniform float turbulence;
uniform float stiffness;
uniform float damping;
uniform int count;
uniform vec4 segments[8];
uniform float speeds[8];

vec4 sampleField(vec2 p) {
  vec2 pos = clamp(p, vec2(0.), vec2(1.)) * size - .5;
  vec2 base = floor(pos), f = fract(pos);
  vec2 texel = 1. / size;
  vec4 a = texture(field, (base + .5) * texel);
  vec4 b = texture(field, (base + vec2(1.5,.5)) * texel);
  vec4 c = texture(field, (base + vec2(.5,1.5)) * texel);
  vec4 d = texture(field, (base + 1.5) * texel);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
void main() {
  vec4 old = sampleField(uv);
  // Advect retained deformation along its own flow to produce bent, connected ribbons.
  vec4 carried = sampleField(uv - old.zw * dt * smear * .7);
  vec2 d = mix(old.xy, carried.xy, .7);
  vec2 v = mix(old.zw, carried.zw, .7);
  vec2 texel = 1. / size;
  vec4 neighbors = (sampleField(uv+vec2(texel.x,0.)) + sampleField(uv-vec2(texel.x,0.)) + sampleField(uv+vec2(0.,texel.y)) + sampleField(uv-vec2(0.,texel.y))) * .25;
  v = mix(v, neighbors.zw, viscosity * .14);
  d = mix(d, neighbors.xy, viscosity * .035);
  // Semi-implicit damped spring. Slightly underdamped: a restrained elastic return.
  v += -d * stiffness * dt;
  v *= exp(-damping * dt);
  for (int i=0; i<8; i++) {
    if (i >= count) break;
    vec2 a = segments[i].xy * viewport;
    vec2 b = segments[i].zw * viewport;
    vec2 movement = b-a;
    float len = length(movement);
    vec2 direction = movement / max(len,.001);
    vec2 normal = vec2(-direction.y,direction.x);
    float speed = clamp(speeds[i] / 1400., 0., 2.);
    // A swept, anisotropic capsule, rather than a radial magnifying lens.
    vec2 tail = a - direction * radius * speed * smear * .85;
    vec2 line = b-tail;
    float along = clamp(dot(uv*viewport-tail,line)/max(dot(line,line),1.),0.,1.);
    vec2 local = uv*viewport - mix(tail,b,along);
    float width = radius * mix(.7,.27,clamp(speed,0.,1.));
    float envelope = exp(-dot(local,local)/(width*width));
    float edge = smoothstep(0.,.13,along) * (1.-smoothstep(.88,1.,along)) + .32;
    float curl = sin(along*9. + dot(uv*viewport,normal)/max(width,1.)*2.4);
    vec2 impulse = direction + normal * curl * turbulence * .5;
    float travel = min(len, radius * 1.8);
    v += impulse / viewport * travel * strength * (7. + speed * sensitivity * 5.) * envelope * edge;
    // Direct material drag prevents a spring lag at ordinary trackpad speeds.
    d += impulse / viewport * travel * strength * .2 * envelope;
  }
  d += v * dt;
  // Bound the surface without clamping source coordinates into permanent edge streaks.
  d = clamp(d, vec2(-.28), vec2(.28));
  v = clamp(v, vec2(-2.), vec2(2.));
  if (length(d * viewport) < .015 && length(v * viewport) < .04) { d=vec2(0.); v=vec2(0.); }
  state = vec4(d,v);
}`

export const renderShader = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform sampler2D source;
uniform sampler2D field;
uniform vec2 size;
vec2 displacement(vec2 p) {
  vec2 pos = p * size - .5, base = floor(pos), f = fract(pos);
  vec2 t = 1. / size;
  vec2 a = texture(field,(base+.5)*t).xy;
  vec2 b = texture(field,(base+vec2(1.5,.5))*t).xy;
  vec2 c = texture(field,(base+vec2(.5,1.5))*t).xy;
  vec2 d = texture(field,(base+1.5)*t).xy;
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
void main() {
  vec2 original = uv - displacement(uv);
  float mask = texture(source,clamp(original,vec2(0.),vec2(1.))).a;
  mask *= step(0.,original.x)*step(original.x,1.)*step(0.,original.y)*step(original.y,1.);
  // No translucent feedback copies. One pristine high-resolution mask, warped by memory.
  color = vec4(mix(vec3(241.,240.,235.)/255.,vec3(21.)/255.,mask),1.);
}`
