import{a as e,n as t}from"./scheduler.8Htqy825.js";import{At as n,D as r,J as i,T as a,_ as o,gt as s,h as c,k as l,tt as u,u as d,vt as f,w as p}from"./events-9ce18a08.esm.PZFu4mFO.js";import{c as m,i as h,l as g,n as _,o as v,r as y,s as b}from"./shared.DtmpXTRN.js";import{i as x,o as S,r as C,s as w,t as T}from"./dist.DDB3cfA7.js";var E=e(t(),1),D=o(),O=14,k=`#05060a`,A=new l(`#5eead4`),j=new l(`#8b5cf6`);function M({quality:e,onReady:t}){v();let n=m(),r=n.frameCount*O+180;return b(t),(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`color`,{attach:`background`,args:[k]}),(0,D.jsx)(`fogExp2`,{attach:`fog`,args:[k,.012]}),(0,D.jsx)(N,{}),(0,D.jsx)(I,{count:e===`high`?9e3:3800,length:r}),(0,D.jsx)(L,{count:e===`high`?260:120}),(0,D.jsx)(z,{length:r}),(0,D.jsx)(B,{}),(0,D.jsx)(G,{}),(0,D.jsx)(K,{z:-(n.frameCount-1)*O-70}),(0,D.jsxs)(C,{multisampling:e===`high`?4:0,children:[(0,D.jsx)(T,{mipmapBlur:!0,intensity:1.1,luminanceThreshold:.16,luminanceSmoothing:.25,radius:.72}),(0,D.jsx)(x,{premultiply:!0,blendFunction:w.ADD,opacity:.32}),(0,D.jsx)(S,{offset:.22,darkness:.78})]})]})}function N(){let e=m(),t=(0,E.useMemo)(()=>new n,[]),r=(0,E.useMemo)(()=>new n(0,0,-20),[]),i=(0,E.useMemo)(()=>new n,[]);return d((n,a)=>{let o=e.g,s=-.9+Math.sin(o*.55)*.7+e.pointer.x*.35,c=.15+Math.cos(o*.43)*.35+e.pointer.y*.22;t.set(s,c,6-o*O),g.damp3(n.camera.position,t,.16,a),i.set(s*.3+.7,c*.25,n.camera.position.z-24),g.damp3(r,i,.22,a),n.camera.lookAt(r),n.camera.rotateZ(Math.sin(o*.35)*.035-e.pointer.x*.02)}),null}var P=`
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uWarp;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depth = -mv.z;
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.8 + aPhase * 0.3) + aPhase * 6.0);
    vAlpha = twinkle * smoothstep(0.4, 5.0, depth) * (1.0 - smoothstep(170.0, 290.0, depth));
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio * (210.0 / max(depth, 0.1)) * (1.0 + uWarp * 0.5);
    gl_Position = projectionMatrix * mv;
  }
`,F=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float a = pow(core, 2.4) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (0.8 + core * 1.4), a);
  }
`;function I({count:e,length:t}){let n=m(),r=(0,E.useMemo)(()=>{let n=_(7),r=new Float32Array(e*3),i=new Float32Array(e*3),o=new Float32Array(e),s=new Float32Array(e),c=new l;for(let a=0;a<e;a++){let e=2.6+n()**.55*78,l=n()*Math.PI*2;r[a*3]=Math.cos(l)*e,r[a*3+1]=Math.sin(l)*e*.72,r[a*3+2]=24-n()*(t+60);let u=n();c.set(u<.72?`#ffffff`:u<.86?`#7ff5e1`:`#b49cff`),i.set([c.r,c.g,c.b],a*3),o[a]=.35+n()**3.2*2.8,s[a]=n()}let u=new a;return u.setAttribute(`position`,new p(r,3)),u.setAttribute(`aColor`,new p(i,3)),u.setAttribute(`aSize`,new p(o,1)),u.setAttribute(`aPhase`,new p(s,1)),u},[e,t]),i=(0,E.useMemo)(()=>new f({uniforms:{uTime:{value:0},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uWarp:{value:0}},vertexShader:P,fragmentShader:F,transparent:!0,depthWrite:!1,blending:2}),[]);return(0,E.useEffect)(()=>()=>r.dispose(),[r]),(0,E.useEffect)(()=>()=>i.dispose(),[i]),d(e=>{i.uniforms.uTime.value=e.clock.elapsedTime,i.uniforms.uWarp.value=Math.min(1,Math.abs(n.velocity)/40)}),(0,D.jsx)(`points`,{geometry:r,material:i,frustumCulled:!1})}function L({count:e}){let t=m(),n=c(e=>e.camera),r=(0,E.useMemo)(()=>{let t=_(11);return Array.from({length:e},()=>{let e=2.2+t()*16,n=t()*Math.PI*2;return{x:Math.cos(n)*e,y:Math.sin(n)*e*.75,z:-t()*90,tint:t()}})},[e]),o=(0,E.useMemo)(()=>{let t=new a;t.setAttribute(`position`,new p(new Float32Array(e*6),3));let n=new Float32Array(e*6),i=new l;return r.forEach((e,t)=>{i.copy(e.tint<.5?A:j).multiplyScalar(1.6),n.set([i.r,i.g,i.b,0,0,0],t*6)}),t.setAttribute(`color`,new p(n,3)),t},[e,r]),s=(0,E.useMemo)(()=>new i({vertexColors:!0,transparent:!0,opacity:0,depthWrite:!1,blending:2,toneMapped:!1}),[]);return(0,E.useEffect)(()=>()=>o.dispose(),[o]),(0,E.useEffect)(()=>()=>s.dispose(),[s]),d((i,a)=>{let c=Math.min(1,Math.abs(t.velocity)/32);if(s.opacity=u.lerp(s.opacity,c*.85,.12),s.opacity<.01)return;let l=o.attributes.position.array,d=t.velocity>=0?1:-1,f=.6+c*16,p=n.position.z;for(let t=0;t<e;t++){let e=r[t];e.z+=a*(18+c*170)*d,e.z>6&&(e.z-=96),e.z<-90&&(e.z+=96);let n=p+e.z;l[t*6]=e.x,l[t*6+1]=e.y,l[t*6+2]=n,l[t*6+3]=e.x,l[t*6+4]=e.y,l[t*6+5]=n-f*d}o.attributes.position.needsUpdate=!0}),(0,D.jsx)(`lineSegments`,{geometry:o,material:s,frustumCulled:!1})}function R(e){let t=document.createElement(`canvas`);t.width=t.height=256;let n=t.getContext(`2d`),i=_(e);for(let e=0;e<9;e++){let e=256*(.3+i()*.4),t=256*(.3+i()*.4),r=Math.min(256*(.18+i()*.32),e,t,256-e,256-t),a=n.createRadialGradient(e,t,0,e,t,r);a.addColorStop(0,`rgba(255,255,255,${.22+i()*.2})`),a.addColorStop(1,`rgba(255,255,255,0)`),n.fillStyle=a,n.fillRect(0,0,256,256)}n.globalCompositeOperation=`destination-in`;let a=n.createRadialGradient(128,128,0,128,128,128);a.addColorStop(0,`rgba(0,0,0,1)`),a.addColorStop(.7,`rgba(0,0,0,0.6)`),a.addColorStop(1,`rgba(0,0,0,0)`),n.fillStyle=a,n.fillRect(0,0,256,256);let o=new r(t);return o.colorSpace=s,o}function z({length:e}){let t=(0,E.useMemo)(()=>[R(3),R(8)],[]);(0,E.useEffect)(()=>()=>t.forEach(e=>e.dispose()),[t]);let n=(0,E.useMemo)(()=>{let t=_(5);return Array.from({length:12},()=>{let n=t()<.5?-1:1,r=50+t()*70;return{position:[n*(r/2+12+t()*30),(t()-.4)*40,-t()*e],scale:r,color:t()<.5?`#2fd4bd`:`#7c4dff`,opacity:.12+t()*.12,rotation:t()*Math.PI*2,tex:t()<.5?0:1}})},[e]);return(0,D.jsx)(D.Fragment,{children:n.map((e,n)=>(0,D.jsx)(`sprite`,{position:e.position,scale:[e.scale,e.scale,1],children:(0,D.jsx)(`spriteMaterial`,{map:t[e.tex],color:e.color,opacity:e.opacity,rotation:e.rotation,transparent:!0,depthWrite:!1,blending:2,fog:!1})},n))})}function B(){v();let e=m(),t=new Map(e.stations.map((e,t)=>[e.firstFrame,t])),n=[];for(let r=1;r<e.frameCount-1;r++){let i=e.frameStation[r]??0,a=t.has(r);n.push((0,D.jsx)(V,{z:-r*O-6,isStation:a,color:i%2==0?j:A,tilt:r*37%9*.04-.16},r))}return(0,D.jsx)(D.Fragment,{children:n})}function V({z:e,isStation:t,color:n,tilt:r}){let i=(0,E.useRef)(null),a=(0,E.useRef)([]),o=(0,E.useMemo)(()=>n.clone().multiplyScalar(t?1.7:1.15),[n,t]),s=t?4.6:3.4,c=(0,E.useMemo)(()=>t?Array.from({length:36},(e,t)=>{let n=t/36*Math.PI*2;return{x:Math.cos(n)*s*1.16,y:Math.sin(n)*s*1.16,a:n}}):[],[t,s]);d((n,r)=>{let s=i.current;if(!s)return;s.rotation.z+=r*(t?.06:-.04);let c=Math.abs(n.camera.position.z-e),l=1+.7*y(24,3,c);for(let e of a.current)e.color.copy(o).multiplyScalar(l)});let l=e=>t=>{t&&(a.current[e]=t)};return(0,D.jsx)(`group`,{position:[.9,0,e],rotation:[r*.5,r,0],children:(0,D.jsxs)(`group`,{ref:i,children:[(0,D.jsxs)(`mesh`,{children:[(0,D.jsx)(`torusGeometry`,{args:[s,t?.035:.018,12,220]}),(0,D.jsx)(`meshBasicMaterial`,{ref:l(0),toneMapped:!1})]}),t&&(0,D.jsxs)(D.Fragment,{children:[(0,D.jsxs)(`mesh`,{children:[(0,D.jsx)(`torusGeometry`,{args:[s*1.06,.012,8,220]}),(0,D.jsx)(`meshBasicMaterial`,{ref:l(1),toneMapped:!1,transparent:!0,opacity:.5})]}),c.map((e,t)=>(0,D.jsxs)(`mesh`,{position:[e.x,e.y,0],rotation:[0,0,e.a],children:[(0,D.jsx)(`boxGeometry`,{args:[t%3==0?.42:.18,.025,.025]}),(0,D.jsx)(`meshBasicMaterial`,{color:n,toneMapped:!1,transparent:!0,opacity:.7})]},t))]})]})})}var H=`
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`,U=`
  uniform vec3 uRim;
  uniform vec3 uCore;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uAlpha;
  uniform float uHalo;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float d = dot(normalize(vNormal), normalize(vView));
    if (!gl_FrontFacing) d = -d;
    d = clamp(d, 0.0, 1.0);
    if (uHalo > 0.5) {
      // Halo: fuerte junto al cuerpo y transparente en el borde exterior.
      float h = pow(d, uPower);
      gl_FragColor = vec4(uRim * uIntensity * h, h * uAlpha);
      return;
    }
    float f = pow(1.0 - d, uPower);
    vec3 col = mix(uCore, uRim, f) * (0.35 + f * uIntensity);
    gl_FragColor = vec4(col, uAlpha);
  }
`;function W(e,t,n,r,i,a=!1){let o=(0,E.useMemo)(()=>new f({uniforms:{uRim:{value:new l(e)},uCore:{value:new l(t)},uPower:{value:n},uIntensity:{value:r},uAlpha:{value:i},uHalo:{value:+!!a}},vertexShader:H,fragmentShader:U,transparent:!0,depthWrite:!a,side:+!!a,blending:a?2:1}),[e,t,n,r,i,a]);return(0,E.useEffect)(()=>()=>o.dispose(),[o]),o}function G(){let e=h(),t=(0,E.useRef)(null),n=(0,E.useRef)(null),r=W(`#7ff5e1`,`#1d1450`,2.4,1.5,1),i=W(`#5eead4`,`#000000`,2.6,.9,.55,!0),o=(0,E.useMemo)(()=>{let e=_(21),t=new Float32Array(780);for(let n=0;n<260;n++){let r=2.3+e()*1.4,i=e()*Math.PI*2,a=(e()-.5)*.5;t.set([Math.cos(i)*r,a,Math.sin(i)*r],n*3)}let n=new a;return n.setAttribute(`position`,new p(t,3)),n},[]);(0,E.useEffect)(()=>()=>o.dispose(),[o]),d((e,r)=>{let i=e.clock.elapsedTime;t.current&&(t.current.rotation.y+=r*.22,t.current.rotation.x=Math.sin(i*.3)*.25),n.current&&n.current.scale.setScalar(1+Math.sin(i*1.3)*.025)});let s=e<.9;return(0,D.jsx)(`group`,{position:s?[1.6,-3.1,-9]:[3.6,.25,-7],scale:s?.8:1,children:(0,D.jsxs)(`group`,{ref:t,children:[(0,D.jsxs)(`mesh`,{ref:n,children:[(0,D.jsx)(`icosahedronGeometry`,{args:[1.75,1]}),(0,D.jsx)(`meshBasicMaterial`,{color:A.clone().multiplyScalar(1.5),wireframe:!0,transparent:!0,opacity:.45,toneMapped:!1})]}),(0,D.jsx)(`mesh`,{material:r,children:(0,D.jsx)(`icosahedronGeometry`,{args:[1.15,6]})}),(0,D.jsx)(`mesh`,{material:i,scale:1.75,children:(0,D.jsx)(`sphereGeometry`,{args:[1.15,48,48]})}),(0,D.jsx)(`group`,{rotation:[.45,0,.2],children:(0,D.jsx)(`points`,{geometry:o,children:(0,D.jsx)(`pointsMaterial`,{size:.045,color:`#b8fff3`,transparent:!0,opacity:.85,depthWrite:!1,blending:2,toneMapped:!1})})})]})})}function K({z:e}){let t=W(`#5eead4`,`#070a1a`,3.4,1.1,1),n=W(`#8b5cf6`,`#000000`,3.2,.8,.5,!0),r=(0,E.useRef)(null);return d((e,t)=>{r.current&&(r.current.rotation.y+=t*.02)}),(0,D.jsxs)(`group`,{ref:r,position:[22,-12,e],children:[(0,D.jsx)(`mesh`,{material:t,children:(0,D.jsx)(`sphereGeometry`,{args:[18,96,96]})}),(0,D.jsx)(`mesh`,{material:n,scale:1.22,children:(0,D.jsx)(`sphereGeometry`,{args:[18,64,64]})})]})}export{M as default};