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
uniform float time;
uniform float aspect;
vec2 displacement(vec2 p) {
  vec2 pos=p*size-.5, base=floor(pos), f=fract(pos), t=1./size;
  return mix(mix(texture(field,(base+.5)*t).xy,texture(field,(base+vec2(1.5,.5))*t).xy,f.x),mix(texture(field,(base+vec2(.5,1.5))*t).xy,texture(field,(base+1.5)*t).xy,f.x),f.y);
}
// Layered travelling waves create an uninterrupted current at rest.
float water(vec2 p) {
  p.x *= aspect;
  float t=time*.55;
  p += .12*vec2(sin(p.y*5.+t),cos(p.x*4.-t*.7));
  return sin(p.x*7.+p.y*3.-t)*.45
    + sin(p.x*-4.+p.y*9.-t*.83)*.26
    + sin(p.x*13.-p.y*8.+t*.65)*.13
    + sin(p.x*21.+p.y*17.-t*1.3)*.055;
}
vec2 slope(vec2 p) {
  float e=.003;
  return vec2(water(p+vec2(e,0.))-water(p-vec2(e,0.)),water(p+vec2(0.,e))-water(p-vec2(0.,e)))/(2.*e);
}
void main() {
  vec2 flow=displacement(uv);
  vec2 gradient=slope(uv);
  vec2 original=uv-flow-gradient*vec2(.0033/aspect,.0033);
  float mask=texture(source,clamp(original,vec2(0.),vec2(1.))).a;
  mask*=step(0.,original.x)*step(original.x,1.)*step(0.,original.y)*step(original.y,1.);
  vec2 dx=displacement(uv+vec2(1./size.x,0.))-flow;
  vec2 dy=displacement(uv+vec2(0.,1./size.y))-flow;
  vec3 normal=normalize(vec3(-gradient*.19-vec2(dx.x,dy.y)*30.,1.));
  vec3 light=normalize(vec3(-.45,.65,1.));
  float diffuse=dot(normal,light);
  float highlight=pow(max(dot(normal,normalize(light+vec3(0.,0.,1.))),0.),38.);
  vec3 secondLight=normalize(vec3(.65,-.3,1.));
  float glint=pow(max(dot(normal,normalize(secondLight+vec3(0.,0.,1.))),0.),65.);
  // Spectral bands follow changing surface angles, rather than a fixed overlay.
  float angle=dot(normal.xy,vec2(.7,-.5));
  vec3 spectrum=.5+.5*cos(6.283185*(angle*2.1+water(uv)*.16+vec3(0.,.33,.67)));
  float spectralLight=(highlight*.5+glint*.75+pow(1.-normal.z,1.4)*.5);
  float fresnel=pow(1.-normal.z,2.);
  vec3 paper=vec3(144.,151.,158.)/255.;
  vec3 ink=vec3(240.,233.,211.)/255.;
  vec3 surface=mix(paper,ink,mask);
  surface*=.84+diffuse*.17;
  surface+=highlight*.25+glint*.22+fresnel*.14;
  surface+=(spectrum-vec3(.35))*spectralLight*.32;
  color=vec4(surface,1.);
}`
