import{a as e,n as t}from"./scheduler.8Htqy825.js";import{At as n,C as r,K as i,Tt as a,U as o,_ as s,it as c,k as l,nt as u,rt as d,u as f,v as p,vt as m}from"./events-9ce18a08.esm.PZFu4mFO.js";import{a as h,c as g,l as _,o as v,s as y,t as b}from"./shared.DtmpXTRN.js";var x=e(t(),1),S=s(),C=14,w=`#0a0a0a`,T=`#e0263f`,E=`#f5f5f2`,D=-1.7,O=1.22,k=O*8/2,A=-.6100000000000003;function j({quality:e,onReady:t}){v();let n=g();y(t);let r=n.frameCount*C+240;return(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`color`,{attach:`background`,args:[w]}),(0,S.jsx)(`fog`,{attach:`fog`,args:[w,16,120]}),(0,S.jsx)(`ambientLight`,{intensity:.6}),(0,S.jsx)(M,{}),(0,S.jsx)(F,{length:r}),(0,S.jsx)(L,{length:r}),(0,S.jsx)(R,{length:r,quality:e}),(0,S.jsx)(z,{}),(0,S.jsx)(U,{})]})}function M(){let e=g(),t=(0,x.useMemo)(()=>new n,[]),r=(0,x.useMemo)(()=>new n(0,D,-20),[]),i=(0,x.useMemo)(()=>new n,[]),a=(0,x.useRef)(0);return f((n,o)=>{let s=Math.min(1,Math.abs(e.velocity)/28);a.current+=o*(2+s*9);let c=Math.abs(Math.sin(a.current*2))*.05*(.3+s),l=A+e.pointer.x*.25,u=-.34999999999999987+c+e.pointer.y*.1;t.set(l,u,6-e.g*C),_.damp3(n.camera.position,t,.14,o),i.set(l+1.1,-.95,n.camera.position.z-22),_.damp3(r,i,.2,o),n.camera.lookAt(r)}),null}var N=`
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`,P=`
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uRed;
  uniform float uHalf;
  uniform float uLane;
  varying vec3 vWorld;
  #include <fog_pars_fragment>

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float lineAt(float x, float center, float width) {
    float d = abs(x - center);
    float w = fwidth(x) * 1.2;
    return 1.0 - smoothstep(width - w, width + w, d);
  }

  void main() {
    float x = vWorld.x;
    float z = vWorld.z;
    vec3 col = uBase;
    // grano del tartán
    col += (hash(floor(vWorld.xz * 60.0)) - 0.5) * 0.018;

    float inside = step(-uHalf, x) * step(x, uHalf);
    // líneas de calle
    float lines = 0.0;
    for (int i = 1; i < 8; i++) {
      lines = max(lines, lineAt(x, -uHalf + float(i) * uLane, 0.025));
    }
    // Más suaves cerca de la cámara, donde pasan por debajo del texto.
    float near = smoothstep(1.5, 12.0, distance(vWorld.xz, cameraPosition.xz));
    col = mix(col, uLine * 0.62, lines * inside * mix(0.3, 1.0, near));
    // bordes: interior rojo, exterior blanco
    col = mix(col, uRed, lineAt(x, -uHalf, 0.05));
    col = mix(col, uLine, lineAt(x, uHalf, 0.04));
    // marcas cada 10 m en el borde interior
    float tick = (1.0 - step(0.14, fract(z / 10.0))) * step(-uHalf - 0.55, x) * step(x, -uHalf - 0.12);
    col = mix(col, uLine * 0.6, tick);
    // fuera de la pista: más oscuro
    col *= mix(0.55, 1.0, inside);
    // salida en z = 0
    col = mix(col, uLine, (1.0 - step(0.1, abs(z + 0.0))) * inside);

    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }
`;function F({length:e}){let t=(0,x.useMemo)(()=>new m({uniforms:a.merge([p.fog,{uBase:{value:new l(`#141414`)},uLine:{value:new l(E)},uRed:{value:new l(T)},uHalf:{value:k},uLane:{value:O}}]),vertexShader:N,fragmentShader:P,fog:!0}),[]);return(0,x.useEffect)(()=>()=>t.dispose(),[t]),(0,S.jsx)(`mesh`,{material:t,rotation:[-Math.PI/2,0,0],position:[0,D,-e/2+40],children:(0,S.jsx)(`planeGeometry`,{args:[48,e+80,1,1]})})}var I=`
  uniform float uBand;
  uniform float uTime;
  uniform vec3 uRed;
  varying vec3 vWorld;
  void main() {
    float cell = fract(vWorld.z / 0.5);
    float across = abs(vWorld.x - uHalfX) / 0.06;
    float led = (1.0 - smoothstep(0.18, 0.32, abs(cell - 0.5))) * (1.0 - smoothstep(0.6, 1.0, across));
    float d = vWorld.z - uBand;
    float on = smoothstep(-9.0, -6.5, d) * (1.0 - smoothstep(-1.0, 1.2, d));
    float pulse = 0.85 + 0.15 * sin(uTime * 6.0 - vWorld.z * 0.8);
    vec3 col = uRed * (0.12 + on * 1.25 * pulse);
    gl_FragColor = vec4(col, led * (0.35 + on * 0.65));
  }
`;function L({length:e}){let t=g(),n=(0,x.useMemo)(()=>new m({uniforms:{uBand:{value:0},uTime:{value:0},uRed:{value:new l(`#ff2a40`)}},defines:{},vertexShader:`
          varying vec3 vWorld;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,fragmentShader:I.replace(`uHalfX`,(-5.2).toFixed(3)),transparent:!0,depthWrite:!1}),[]);return(0,x.useEffect)(()=>()=>n.dispose(),[n]),f(e=>{n.uniforms.uTime.value=e.clock.elapsedTime;let r=4+Math.min(1,Math.abs(t.velocity)/30)*6;n.uniforms.uBand.value=e.camera.position.z-r}),(0,S.jsx)(`mesh`,{material:n,rotation:[-Math.PI/2,0,0],position:[-5.2,-1.688,-e/2+40],children:(0,S.jsx)(`planeGeometry`,{args:[.16,e+80,1,1]})})}function R({length:e,quality:t}){let n=(0,x.useMemo)(()=>{let t=Math.ceil(e/7),n=new i(new r(.035,1.1,.035),new c({color:`#3a3a38`}),t*2),a=new u;for(let e=0;e<t;e++){let t=20-e*7;a.setPosition(-4.88-2.4,-1.15,t),n.setMatrixAt(e*2,a),a.setPosition(7.279999999999999,-1.15,t),n.setMatrixAt(e*2+1,a)}return n},[e]),a=(0,x.useMemo)(()=>{let t=Math.ceil(e/46),n=new o,i=new r(.12,16,.12),a=new r(2.6,1.1,.12),s=new c({color:`#262624`}),l=new c({color:`#f5f5f2`});for(let e=0;e<t;e++)for(let t of[-1,1]){let r=-10-e*46-(t>0?23:0),o=new d(i,s);o.position.set(t*17.88,6.3,r);let c=new d(a,l);c.position.set(t*17.88,14.600000000000001,r),c.rotation.y=t*.4,n.add(o,c)}return n},[e]);return(0,x.useEffect)(()=>()=>{n.geometry.dispose(),n.material.dispose(),n.dispose(),a.traverse(e=>{e instanceof d&&(e.geometry.dispose(),e.material.dispose())})},[n,a]),(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`primitive`,{object:n}),t===`high`&&(0,S.jsx)(`primitive`,{object:a}),[-1,1].map(t=>(0,S.jsxs)(`mesh`,{position:[t*7.279999999999999,-.5999999999999999,-e/2+40],children:[(0,S.jsx)(`boxGeometry`,{args:[.03,.03,e+80]}),(0,S.jsx)(`meshBasicMaterial`,{color:`#5a5a56`})]},t))]})}function z(){v();let e=g(),t=h(`900 200px "Archivo Variable"`),n=e.stations.slice(1).map((e,t)=>({key:e.id,z:6-e.firstFrame*C-1,number:String(t+1).padStart(2,`0`),label:e.label.toUpperCase()}));return(0,S.jsx)(S.Fragment,{children:n.map(e=>(0,S.jsxs)(`group`,{position:[0,0,e.z],children:[(0,S.jsx)(B,{}),t&&(0,S.jsx)(V,{number:e.number,label:e.label})]},e.key))})}function B(){let e=10.959999999999999;return(0,S.jsxs)(`group`,{position:[0,D,0],children:[[-1,1].map(t=>(0,S.jsxs)(`mesh`,{position:[e/2*t,2.1,0],children:[(0,S.jsx)(`boxGeometry`,{args:[.07,4.2,.07]}),(0,S.jsx)(`meshBasicMaterial`,{color:E})]},t)),(0,S.jsxs)(`mesh`,{position:[0,4.2,0],children:[(0,S.jsx)(`boxGeometry`,{args:[11.03,.07,.07]}),(0,S.jsx)(`meshBasicMaterial`,{color:E})]}),(0,S.jsxs)(`mesh`,{position:[0,3.85,0],children:[(0,S.jsx)(`boxGeometry`,{args:[e*.32,.22,.05]}),(0,S.jsx)(`meshBasicMaterial`,{color:T})]}),(0,S.jsxs)(`mesh`,{rotation:[-Math.PI/2,0,0],position:[0,.006,0],children:[(0,S.jsx)(`planeGeometry`,{args:[k*2,.09]}),(0,S.jsx)(`meshBasicMaterial`,{color:E})]})]})}function V({number:e,label:t}){let n=(0,x.useMemo)(()=>b([e,t],{font:`900 200px "Archivo Variable"`,fontStretch:`ultra-expanded`,color:`rgba(245,245,242,0.92)`,width:1024,height:512,letterSpacing:`6px`}),[e,t]);return(0,x.useEffect)(()=>()=>n.dispose(),[n]),(0,S.jsxs)(`mesh`,{rotation:[-Math.PI/2,0,0],position:[O*2.2,-1.692,7],children:[(0,S.jsx)(`planeGeometry`,{args:[5.2,2.6]}),(0,S.jsx)(`meshBasicMaterial`,{map:n,transparent:!0,depthWrite:!1,toneMapped:!1})]})}function H({x:e}){let t=.84,n=O*.86,r=(0,x.useMemo)(()=>new c({color:E}),[]);return(0,x.useEffect)(()=>()=>r.dispose(),[r]),(0,S.jsxs)(`group`,{position:[e,D,0],children:[(0,S.jsx)(`mesh`,{material:r,position:[0,t,0],children:(0,S.jsx)(`boxGeometry`,{args:[n,.07,.02]})}),[-1,1].map(e=>(0,S.jsxs)(`group`,{children:[(0,S.jsx)(`mesh`,{material:r,position:[e*n/2,t/2,0],children:(0,S.jsx)(`boxGeometry`,{args:[.025,t,.025]})}),(0,S.jsx)(`mesh`,{material:r,position:[e*n/2,.012,.22],children:(0,S.jsx)(`boxGeometry`,{args:[.025,.025,.5]})})]},e))]})}function U(){v();let e=g(),t=new Set(e.stations.map(e=>e.firstFrame)),n=[];for(let r=1;r<e.frameCount-1;r++)t.has(r)||n.push(6-r*C-7);let r=[5,6,7];return(0,S.jsx)(S.Fragment,{children:n.map(e=>(0,S.jsx)(`group`,{position:[0,0,e],children:r.map(e=>(0,S.jsx)(H,{x:-4.88+O*(e+.5)},e))},e))})}export{j as default};