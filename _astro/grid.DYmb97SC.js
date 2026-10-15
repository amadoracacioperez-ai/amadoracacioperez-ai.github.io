import{a as e,n as t}from"./scheduler.8Htqy825.js";import{At as n,C as r,L as i,T as a,_ as o,ft as s,it as c,k as l,kt as u,u as d,vt as f,w as p}from"./events-9ce18a08.esm.PZFu4mFO.js";import{a as m,c as h,l as g,n as _,o as v,s as y,t as b}from"./shared.DtmpXTRN.js";import{a as x,n as S,o as C,r as w,s as T,t as E}from"./dist.DDB3cfA7.js";var D=e(t(),1),O=o(),k=14,A=-2,j=`#07010f`,M=new l(`#2a0a3d`),N=new l(`#ff2bd6`),P=new l(`#22d3ee`);function F({quality:e,onReady:t}){v();let n=h();y(t);let r=n.frameCount*k+320;return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`color`,{attach:`background`,args:[j]}),(0,O.jsx)(I,{}),(0,O.jsx)(L,{}),(0,O.jsx)(R,{}),(0,O.jsx)(z,{}),(0,O.jsx)(B,{length:r,side:-1}),(0,O.jsx)(B,{length:r,side:1}),(0,O.jsx)(V,{}),(0,O.jsx)(U,{count:e===`high`?1600:700,length:r}),(0,O.jsxs)(w,{multisampling:e===`high`?4:0,children:[(0,O.jsx)(E,{mipmapBlur:!0,intensity:1.25,luminanceThreshold:.14,luminanceSmoothing:.3,radius:.68}),(0,O.jsx)(S,{blendFunction:T.NORMAL,offset:new u(.0011,7e-4),radialModulation:!0,modulationOffset:.35}),(0,O.jsx)(x,{blendFunction:T.OVERLAY,density:1.4,opacity:.08}),(0,O.jsx)(C,{offset:.2,darkness:.8})]})]})}function I(){let e=h(),t=(0,D.useMemo)(()=>new n,[]),r=(0,D.useMemo)(()=>new n(0,0,-30),[]),i=(0,D.useMemo)(()=>new n,[]),a=(0,D.useRef)(0);return d((n,o)=>{let s=e.g,c=-.6+Math.sin(s*.42)*1.1+e.pointer.x*.4,l=-.25+Math.sin(s*.3)*.25+e.pointer.y*.2;t.set(c,l,6-s*k),g.damp3(n.camera.position,t,.16,o),i.set(c*.4+1.2,l+.9,n.camera.position.z-30),g.damp3(r,i,.25,o),n.camera.lookAt(r),g.damp(a,`current`,Math.cos(s*.42)*-.06-e.pointer.x*.03,.3,o),n.camera.rotateZ(a.current)}),null}function L(){let e=(0,D.useRef)(null),t=(0,D.useMemo)(()=>new f({uniforms:{uTop:{value:new l(j)},uHorizon:{value:M}},vertexShader:`
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          uniform vec3 uTop;
          uniform vec3 uHorizon;
          varying vec3 vDir;
          void main() {
            float h = vDir.y;
            float glow = exp(-abs(h - 0.02) * 9.0);
            vec3 col = mix(uTop, uHorizon, glow);
            gl_FragColor = vec4(col, 1.0);
          }
        `,side:1,depthWrite:!1}),[]);return(0,D.useEffect)(()=>()=>t.dispose(),[t]),d(t=>e.current?.position.copy(t.camera.position)),(0,O.jsx)(`mesh`,{ref:e,material:t,renderOrder:-1,children:(0,O.jsx)(`sphereGeometry`,{args:[400,32,16]})})}function R(){let e=(0,D.useRef)(null),t=(0,D.useMemo)(()=>new f({uniforms:{uTime:{value:0}},vertexShader:`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p);
            float disc = 1.0 - smoothstep(0.49, 0.5, r);
            float y = vUv.y;
            // franjas horizontales en la mitad inferior (cada vez más anchas)
            float band = fract(y * 16.0 + uTime * 0.08);
            float cut = step(y, 0.48) * step(band, mix(0.65, 0.05, y / 0.48));
            vec3 top = vec3(1.0, 0.72, 0.22);
            vec3 bottom = vec3(0.95, 0.08, 0.62);
            vec3 col = mix(bottom, top, smoothstep(0.15, 0.95, y)) * 0.92;
            float a = disc * (1.0 - cut);
            gl_FragColor = vec4(col, a);
          }
        `,transparent:!0,depthWrite:!1,toneMapped:!1}),[]);return(0,D.useEffect)(()=>()=>t.dispose(),[t]),d(n=>{t.uniforms.uTime.value=n.clock.elapsedTime,e.current?.position.set(26,24,n.camera.position.z-260)}),(0,O.jsx)(`mesh`,{ref:e,material:t,children:(0,O.jsx)(`planeGeometry`,{args:[80,80]})})}function z(){let e=(0,D.useRef)(null),t=(0,D.useMemo)(()=>new f({uniforms:{uLine:{value:N.clone().multiplyScalar(1.3)},uPath:{value:P.clone()},uHorizon:{value:M}},vertexShader:`
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `,fragmentShader:`
          uniform vec3 uLine;
          uniform vec3 uPath;
          uniform vec3 uHorizon;
          varying vec3 vWorld;
          float gridLine(vec2 coord) {
            vec2 g = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
            return 1.0 - min(min(g.x, g.y), 1.0);
          }
          void main() {
            vec2 c = vWorld.xz / 2.0;
            float minor = gridLine(c);
            float major = gridLine(c / 5.0);
            float dist = distance(vWorld.xz, cameraPosition.xz);
            float fade = 1.0 - smoothstep(30.0, 170.0, dist);
            vec3 col = uLine * (minor * 0.45 + major * 1.0) * fade;
            // "carril" cian bajo la cámara
            float lane = 1.0 - smoothstep(0.0, 2.6, abs(vWorld.x + 0.4));
            col += uPath * lane * 0.06;
            col = mix(col, uHorizon * 0.6, smoothstep(90.0, 190.0, dist));
            gl_FragColor = vec4(col, 1.0);
          }
        `,toneMapped:!1}),[]);return(0,D.useEffect)(()=>()=>t.dispose(),[t]),d(t=>{e.current&&(e.current.position.z=t.camera.position.z-150)}),(0,O.jsx)(`mesh`,{ref:e,material:t,rotation:[-Math.PI/2,0,0],position:[0,A,0],children:(0,O.jsx)(`planeGeometry`,{args:[520,420]})})}function B({length:e,side:t}){let n=(0,D.useMemo)(()=>{let n=Math.ceil(e/5),r=new s(70,e,28,n);r.rotateX(-Math.PI/2);let i=r.attributes.position,a=_(t>0?31:17),o=Array.from({length:i.count},()=>a());for(let e=0;e<i.count;e++){let n=i.getX(e),r=i.getZ(e),a=(n*t+35)/70,s=(Math.sin(r*.06+a*4.1)*.5+.5)*(Math.sin(r*.017+a*2.3+t)*.5+.5),c=a**1.6*(6+s*22)+o[e]*1.2*a;i.setY(e,c)}return r.computeVertexNormals(),r},[e,t]),r=(0,D.useMemo)(()=>new c({color:(t>0?N:P).clone().multiplyScalar(.9),wireframe:!0,transparent:!0,opacity:.32,fog:!1}),[t]);return(0,D.useEffect)(()=>()=>n.dispose(),[n]),(0,D.useEffect)(()=>()=>r.dispose(),[r]),(0,O.jsx)(`mesh`,{geometry:n,material:r,position:[t*47,-2.05,-e/2+60]})}function V(){v();let e=h(),t=m(`700 120px "Chakra Petch"`);return(0,O.jsx)(O.Fragment,{children:e.stations.slice(1).map((e,n)=>(0,O.jsx)(H,{z:6-e.firstFrame*k-20,number:String(n+1).padStart(2,`0`),label:e.label.toUpperCase(),fontReady:t,flip:n%2==1},e.id))})}function H({z:e,number:t,label:n,fontReady:a,flip:o}){let s=(0,D.useRef)(null),c=(0,D.useMemo)(()=>{let e=new r(2.2,12,2.2),t=new i(e);return e.dispose(),t},[]),l=(0,D.useMemo)(()=>{let e=new r(1.4,7,1.4),t=new i(e);return e.dispose(),t},[]),u=(0,D.useMemo)(()=>a?b([`// ${t}`,n],{font:`700 120px "Chakra Petch"`,color:`#c9f6ff`,glow:`rgba(34,211,238,0.9)`,width:1024,height:384,align:`left`,letterSpacing:`8px`}):null,[a,t,n]);(0,D.useEffect)(()=>()=>c.dispose(),[c]),(0,D.useEffect)(()=>()=>l.dispose(),[l]),(0,D.useEffect)(()=>()=>u?.dispose(),[u]),d(t=>{s.current&&(s.current.position.y=4+Math.sin(t.clock.elapsedTime*.9+e)*5.5)});let f=o?10.5:8.5;return(0,O.jsxs)(`group`,{position:[0,0,e],children:[(0,O.jsx)(`lineSegments`,{geometry:c,position:[f,4,0],children:(0,O.jsx)(`lineBasicMaterial`,{color:P.clone().multiplyScalar(2),toneMapped:!1})}),(0,O.jsxs)(`mesh`,{ref:s,position:[f,4,0],rotation:[-Math.PI/2,0,0],children:[(0,O.jsx)(`planeGeometry`,{args:[2.2,2.2]}),(0,O.jsx)(`meshBasicMaterial`,{color:P.clone().multiplyScalar(1.6),transparent:!0,opacity:.25,side:2,toneMapped:!1,depthWrite:!1})]}),(0,O.jsx)(`lineSegments`,{geometry:l,position:[-11,1.5,-6],children:(0,O.jsx)(`lineBasicMaterial`,{color:N.clone().multiplyScalar(2),toneMapped:!1})}),u&&(0,O.jsxs)(`mesh`,{position:[f-4.2,2.8,1.5],rotation:[0,-.4,0],children:[(0,O.jsx)(`planeGeometry`,{args:[6.4,2.4]}),(0,O.jsx)(`meshBasicMaterial`,{map:u,transparent:!0,depthWrite:!1,toneMapped:!1})]})]})}function U({count:e,length:t}){let n=(0,D.useRef)(null),r=(0,D.useMemo)(()=>{let n=_(77),r=new Float32Array(e*3);for(let i=0;i<e;i++)r[i*3]=(n()-.5)*60,r[i*3+1]=A+n()*18,r[i*3+2]=20-n()*t;let i=new a;return i.setAttribute(`position`,new p(r,3)),i},[e,t]);return(0,D.useEffect)(()=>()=>r.dispose(),[r]),d((e,t)=>{let n=r.attributes.position,i=n.array;for(let e=1;e<i.length;e+=3)i[e]+=t*.35,i[e]>16&&(i[e]=A);n.needsUpdate=!0}),(0,O.jsx)(`points`,{ref:n,geometry:r,children:(0,O.jsx)(`pointsMaterial`,{size:.06,color:P.clone().multiplyScalar(1.4),transparent:!0,opacity:.75,depthWrite:!1,blending:2,toneMapped:!1})})}export{F as default};