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
    float width = radius * mix(.8,.42,clamp(speed,0.,1.));
    float envelope = exp(-dot(local,local)/(width*width));
    float edge = smoothstep(0.,.13,along) * (1.-smoothstep(.88,1.,along)) + .32;
    float curl = sin(along*9. + dot(uv*viewport,normal)/max(width,1.)*2.4);
    vec2 impulse = direction + normal * curl * turbulence * .5;
    float travel = min(len, radius * 1.8);
    v += impulse / viewport * travel * strength * (7. + speed * sensitivity * 5.) * envelope * edge;
    // Direct material drag prevents a spring lag at ordinary trackpad speeds.
    d += impulse / viewport * travel * strength * .09 * envelope;
  }
  d += v * dt;
  // Bound the surface without clamping source coordinates into permanent edge streaks.
  d = clamp(d, vec2(-.18), vec2(.18));
  v = clamp(v, vec2(-2.), vec2(2.));
  if (length(d * viewport) < .015 && length(v * viewport) < .04) { d=vec2(0.); v=vec2(0.); }
  state = vec4(d,v);
}`

export const heightShader = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 state;
uniform sampler2D heightField;
uniform sampler2D flow;
uniform vec2 size;
uniform float dt;
uniform float elasticity;
uniform float viscosity;
void main() {
 vec2 e=1./size;
 vec2 old=texture(heightField,uv).rg;
 float lap=texture(heightField,uv+vec2(e.x,0.)).r+texture(heightField,uv-vec2(e.x,0.)).r+texture(heightField,uv+vec2(0.,e.y)).r+texture(heightField,uv-vec2(0.,e.y)).r-4.*old.r;
 float divergence=(texture(flow,uv+vec2(e.x,0.)).z-texture(flow,uv-vec2(e.x,0.)).z+texture(flow,uv+vec2(0.,e.y)).w-texture(flow,uv-vec2(0.,e.y)).w)*10.;
 float velocity=old.g+(lap*120.-old.r*elasticity-divergence*.32)*dt;
 velocity*=exp(-(3.+viscosity*6.)*dt);
 float height=clamp(old.r+velocity*dt,-.2,.2);
 state=vec4(height,clamp(velocity,-1.,1.),0.,0.);
}`

export const renderShader = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform sampler2D source;
uniform sampler2D field;
uniform sampler2D heightField;
uniform vec2 size;
uniform float time;
uniform float aspect;
uniform float thickness;
uniform float distortion;
uniform float refraction;
uniform float chromaticAberration;
uniform float ambientFlow;
uniform float reflection;
uniform float fullBleed;
vec4 bilinear(sampler2D tex,vec2 p) {
 vec2 pos=clamp(p,vec2(0.),vec2(1.))*size-.5,b=floor(pos),f=fract(pos),e=1./size;
 return mix(mix(texture(tex,(b+.5)*e),texture(tex,(b+vec2(1.5,.5))*e),f.x),mix(texture(tex,(b+vec2(.5,1.5))*e),texture(tex,(b+1.5)*e),f.x),f.y);
}
float shape(vec2 p) {
 if (fullBleed>.5) return -.25;
 vec2 flow=bilinear(field,p).xy;
 vec2 q=(p-vec2(.5,.51)-flow*.55)*vec2(aspect*.64,1.);
 float t=time*.115;
 float angle=atan(q.y,q.x);
 float rim=.475+ambientFlow*smoothstep(.12,.35,length(q))*(.07*sin(angle*3.+t)+.045*sin(angle*5.-t*.7));
 float main=length(q)-rim;
 vec2 lobe=vec2(.4+.08*sin(t*.73),-.24+.06*cos(t*.51));
 float satellite=length(q-lobe)-(.115+.025*sin(t*.41));
 float blend=clamp(.5+.5*(satellite-main)/.12,0.,1.);
 return mix(satellite,main,blend)-.12*blend*(1.-blend);
}
float elevation(vec2 p) {
 float distance=shape(p);
 vec2 q=p+bilinear(field,p).xy;
 float inside=smoothstep(.025,-.04,distance);
 float cap=fullBleed>.5 ? .12 : sqrt(max(0.,-distance))*.3;
 float t=time*.115;
 q+=.07*vec2(sin(q.y*9.-t*.6),sin(q.x*7.+t*.7));
 float fold1=sin(q.x*16.+q.y*8.+t);
 float fold2=sin(q.y*20.-q.x*7.-t*.8);
 float folds=(sqrt(fold1*fold1+.045)+fold2*.6)*.07*ambientFlow;
 folds+=sin(q.x*9.-q.y*11.+t*.43)*.024*ambientFlow;
 return (cap+folds+bilinear(heightField,p).r*2.)*inside;
}
vec3 environment(vec3 ray) {
 // Analytic studio environment: broad softboxes, dark bands, and a bright window.
 float window=pow(max(0.,1.-abs(ray.x*.65+ray.z*.35-.18)*3.),12.);
 float strip=pow(max(0.,1.-abs(ray.y-.48)*9.),7.);
 float dark=smoothstep(.08,.24,abs(ray.y+.18));
 float fineStrip=pow(max(0.,1.-abs(ray.x+.32)*28.),9.)*smoothstep(-.25,.25,ray.y);
 return mix(vec3(.025,.032,.04),vec3(.35,.4,.45),dark)+vec3(.95,.97,1.)*window+vec3(1.)*strip*.7+vec3(1.)*fineStrip*.65;
}
vec3 background(vec2 p) { return texture(source,clamp(p,vec2(.001),vec2(.999))).rgb; }
void main() {
 vec3 original=background(uv);
 float distance=shape(uv);
 float cover=1.-smoothstep(-.003,.006,distance);
 if(cover<.001) {color=vec4(original,1.);return;}
 float e=.0025;
 float h=elevation(uv);
 vec2 grad=vec2(elevation(uv+vec2(e,0.))-elevation(uv-vec2(e,0.)),elevation(uv+vec2(0.,e))-elevation(uv-vec2(0.,e)))/(2.*e);
 vec3 normal=normalize(vec3(-grad.x/aspect,-grad.y,1.));
 vec3 view=vec3(0.,0.,1.);
 float eta=1./max(refraction,1.01);
 vec3 bent=refract(-view,normal,eta);
 float depth=(.08+h)*thickness;
 vec2 wake=bilinear(field,uv).xy;
 float activity=smoothstep(.001,.035,length(wake));
 vec2 offset=bent.xy/max(abs(bent.z),.25)*depth*distortion*mix(.62,1.,activity)+wake*.26;
 float edge=pow(1.-normal.z,1.4);
 vec2 separation=normalize(offset+vec2(.00001))*chromaticAberration*(.02+edge*2.5)*mix(.45,1.,activity);
 vec2 sampleUV=uv+offset;
 vec3 transmitted=vec3(background(sampleUV+separation).r,background(sampleUV).g,background(sampleUV-separation).b);
 float f0=pow((refraction-1.)/(refraction+1.),2.);
 float fresnel=f0+(1.-f0)*pow(1.-max(normal.z,0.),5.);
 vec3 reflected=environment(reflect(-view,normal));
 float rim=exp(-abs(distance)*100.);
 float reflectAmount=clamp((fresnel+rim*.35)*reflection,0.,.85);
 vec3 glass=mix(transmitted,reflected,reflectAmount);
 vec3 light=normalize(vec3(-.5,.65,1.));
 float spec=pow(max(dot(normal,normalize(light+view)),0.),180.);
 float second=pow(max(dot(normal,normalize(vec3(.7,-.4,1.)+view)),0.),240.);
 glass+=vec3(1.)*(spec*.6+second*.4)*reflection;
 vec3 spectrum=.5+.5*cos(6.283185*(normal.x*1.8+normal.y*.9+vec3(0.,.33,.67)));
 glass+=(spectrum-.5)*smoothstep(.03,.3,edge)*reflection*.1*mix(.35,1.,activity);
 glass*=1.-thickness*.035;
 float bottomFade=fullBleed>.5 ? smoothstep(0.,.22,uv.y) : 1.;
 color=vec4(mix(original,glass,cover*bottomFade),1.);
}`
