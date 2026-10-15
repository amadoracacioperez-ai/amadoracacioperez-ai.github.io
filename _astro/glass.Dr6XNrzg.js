import{a as e,n as t}from"./scheduler.8Htqy825.js";import{n,r,t as i}from"./Lightformer.Jwrc6FuI.js";import{At as a,H as o,I as s,Mt as c,Tt as l,W as u,Y as d,_ as f,h as p,k as m,ot as h,s as g,st as _,tt as v,u as y,vt as b,w as x,wt as S,yt as C}from"./events-9ce18a08.esm.PZFu4mFO.js";import{c as w,i as T,l as E,o as D,s as ee}from"./shared.DtmpXTRN.js";import{i as te,o as O,r as k,s as A,t as j}from"./dist.DDB3cfA7.js";function M(e,t=Math.PI/3){let n=Math.cos(t),r=(1+1e-10)*100,i=[new a,new a,new a],o=new a,s=new a,c=new a,l=new a;function u(e){return`${~~(e.x*r)},${~~(e.y*r)},${~~(e.z*r)}`}let d=e.index?e.toNonIndexed():e,f=d.attributes.position,p={};for(let e=0,t=f.count/3;e<t;e++){let t=3*e,n=i[0].fromBufferAttribute(f,t+0),r=i[1].fromBufferAttribute(f,t+1),c=i[2].fromBufferAttribute(f,t+2);o.subVectors(c,r),s.subVectors(n,r);let l=new a().crossVectors(o,s).normalize();for(let e=0;e<3;e++){let t=i[e],n=u(t);n in p||(p[n]=[]),p[n].push(l)}}let m=new Float32Array(f.count*3),h=new x(m,3,!1);for(let e=0,t=f.count/3;e<t;e++){let t=3*e,r=i[0].fromBufferAttribute(f,t+0),a=i[1].fromBufferAttribute(f,t+1),d=i[2].fromBufferAttribute(f,t+2);o.subVectors(d,a),s.subVectors(r,a),c.crossVectors(o,s).normalize();for(let e=0;e<3;e++){let r=i[e],a=p[u(r)];l.set(0,0,0);for(let e=0,t=a.length;e<t;e++){let t=a[e];c.dot(t)>n&&l.add(t)}l.normalize(),h.setXYZ(t+e,l.x,l.y,l.z)}}return d.setAttribute(`normal`,h),d}function N(e,t,n,r){var i=class extends b{constructor(i){super({vertexShader:t,fragmentShader:n,...i});for(let t in e)this.uniforms[t]=new S(e[t]),Object.defineProperty(this,t,{get(){return this.uniforms[t].value},set(e){this.uniforms[t].value=e}});this.uniforms=l.clone(this.uniforms),r?.(this)}};return i.key=v.generateUUID(),i}var P=e(t());function F(e,t,n){let r=p(e=>e.size),i=p(e=>e.viewport),a=typeof e==`number`?e:r.width*i.dpr,l=typeof t==`number`?t:r.height*i.dpr,f=(typeof e==`number`?n:e)||{},{samples:m=0,depth:h,...g}=f,_=h??f.depthBuffer,v=P.useMemo(()=>{let e=new c(a,l,{minFilter:d,magFilter:d,type:u,...g});return _&&(e.depthTexture=new s(a,l,o)),e.samples=m,e},[]);return P.useLayoutEffect(()=>{v.setSize(a,l),m&&(v.samples=m)},[m,v,a,l]),P.useEffect(()=>()=>v.dispose(),[]),v}var ne=N({},`void main() { }`,`void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); discard;  }`),re=class extends h{constructor(e=6,t=!1){super(),this.uniforms={chromaticAberration:{value:.05},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},roughness:{value:0},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:1/0},attenuationColor:{value:new m(`white`)},anisotropicBlur:{value:.1},time:{value:0},distortion:{value:0},distortionScale:{value:.5},temporalDistortion:{value:0},buffer:{value:null}},this.onBeforeCompile=n=>{n.uniforms={...n.uniforms,...this.uniforms},(this.anisotropy??0)>0&&(n.defines.USE_ANISOTROPY=``),t?n.defines.USE_SAMPLER=``:n.defines.USE_TRANSMISSION=``,n.fragmentShader=`
      uniform float chromaticAberration;         
      uniform float anisotropicBlur;      
      uniform float time;
      uniform float distortion;
      uniform float distortionScale;
      uniform float temporalDistortion;
      uniform sampler2D buffer;

      vec3 random3(vec3 c) {
        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
        vec3 r;
        r.z = fract(512.0*j);
        j *= .125;
        r.x = fract(512.0*j);
        j *= .125;
        r.y = fract(512.0*j);
        return r-0.5;
      }

      uint hash( uint x ) {
        x += ( x << 10u );
        x ^= ( x >>  6u );
        x += ( x <<  3u );
        x ^= ( x >> 11u );
        x += ( x << 15u );
        return x;
      }

      // Compound versions of the hashing algorithm I whipped together.
      uint hash( uvec2 v ) { return hash( v.x ^ hash(v.y)                         ); }
      uint hash( uvec3 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z)             ); }
      uint hash( uvec4 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w) ); }

      // Construct a float with half-open range [0:1] using low 23 bits.
      // All zeroes yields 0.0, all ones yields the next smallest representable value below 1.0.
      float floatConstruct( uint m ) {
        const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
        const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32
        m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
        m |= ieeeOne;                          // Add fractional part to 1.0
        float  f = uintBitsToFloat( m );       // Range [1:2]
        return f - 1.0;                        // Range [0:1]
      }

      // Pseudo-random value in half-open range [0:1].
      float randomBase( float x ) { return floatConstruct(hash(floatBitsToUint(x))); }
      float randomBase( vec2  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float randomBase( vec3  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float randomBase( vec4  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float rand(float seed) {
        float result = randomBase(vec3(gl_FragCoord.xy, seed));
        return result;
      }

      const float F3 =  0.3333333;
      const float G3 =  0.1666667;

      float snoise(vec3 p) {
        vec3 s = floor(p + dot(p, vec3(F3)));
        vec3 x = p - s + dot(s, vec3(G3));
        vec3 e = step(vec3(0.0), x - x.yzx);
        vec3 i1 = e*(1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy*(1.0 - e);
        vec3 x1 = x - i1 + G3;
        vec3 x2 = x - i2 + 2.0*G3;
        vec3 x3 = x - 1.0 + 3.0*G3;
        vec4 w, d;
        w.x = dot(x, x);
        w.y = dot(x1, x1);
        w.z = dot(x2, x2);
        w.w = dot(x3, x3);
        w = max(0.6 - w, 0.0);
        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);
        w *= w;
        w *= w;
        d *= w;
        return dot(d, vec4(52.0));
      }

      float snoiseFractal(vec3 m) {
        return 0.5333333* snoise(m)
              +0.2666667* snoise(2.0*m)
              +0.1333333* snoise(4.0*m)
              +0.0666667* snoise(8.0*m);
      }
`+n.fragmentShader,n.fragmentShader=n.fragmentShader.replace(`#include <transmission_pars_fragment>`,`
        #ifdef USE_TRANSMISSION
          // Transmission code is based on glTF-Sampler-Viewer
          // https://github.com/KhronosGroup/glTF-Sample-Viewer
          uniform float _transmission;
          uniform float thickness;
          uniform float attenuationDistance;
          uniform vec3 attenuationColor;
          #ifdef USE_TRANSMISSIONMAP
            uniform sampler2D transmissionMap;
          #endif
          #ifdef USE_THICKNESSMAP
            uniform sampler2D thicknessMap;
          #endif
          uniform vec2 transmissionSamplerSize;
          uniform sampler2D transmissionSamplerMap;
          uniform mat4 modelMatrix;
          uniform mat4 projectionMatrix;
          varying vec3 vWorldPosition;
          vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in vec3 modelScale ) {
            // Direction of refracted light.
            // n is normalized once when the sample normal is built.
            vec3 refractionVector = refract( - v, n, 1.0 / ior );
            // The thickness is specified in local space.
            return normalize( refractionVector ) * thickness * modelScale;
          }
          float applyIorToRoughness( const in float roughness, const in float ior ) {
            // Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
            // an IOR of 1.5 results in the default amount of microfacet refraction.
            return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
          }
          vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
            float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );            
            #ifdef USE_SAMPLER
              #ifdef texture2DLodEXT
                return texture2DLodEXT(transmissionSamplerMap, fragCoord.xy, framebufferLod);
              #else
                return texture2D(transmissionSamplerMap, fragCoord.xy, framebufferLod);
              #endif
            #else
              return texture2D(buffer, fragCoord.xy);
            #endif
          }
          vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
            const in vec3 position, const in vec3 modelScale, const in vec3 attenuationCoefficient, const in vec3 F,
            const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
            const in float attenuationDistance ) {
            vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelScale );
            vec3 refractedRayExit = position + transmissionRay;
            // Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
            vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
            vec2 refractionCoords = ndcPos.xy / ndcPos.w;
            refractionCoords += 1.0;
            refractionCoords /= 2.0;
            // Sample framebuffer to get pixel the refracted ray hits.
            vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
            vec3 attenuatedColor = transmittedLight.rgb;
            if ( !isinf( attenuationDistance ) ) {
              // Apply Beer's law.
              attenuatedColor *= exp( - attenuationCoefficient * length( transmissionRay ) );
            }
            return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
          }
        #endif
`),n.fragmentShader=n.fragmentShader.replace(`#include <transmission_fragment>`,`  
        // Improve the refraction to use the world pos
        material.transmission = _transmission;
        material.transmissionAlpha = 1.0;
        material.thickness = thickness;
        material.attenuationDistance = attenuationDistance;
        material.attenuationColor = attenuationColor;
        #ifdef USE_TRANSMISSIONMAP
          material.transmission *= texture2D( transmissionMap, vUv ).r;
        #endif
        #ifdef USE_THICKNESSMAP
          material.thickness *= texture2D( thicknessMap, vUv ).g;
        #endif
        
        if (material.transmission != 0.0) {
          vec3 pos = vWorldPosition;
          float runningSeed = 0.0;
          vec3 v = normalize( cameraPosition - pos );
          vec3 n = inverseTransformDirection( normal, viewMatrix );
          vec3 transmission = vec3(0.0);
          float randomCoords = rand(runningSeed++);
          float thickness_smear = thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);
          vec3 distortionNormal = vec3(0.0);
          vec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;

          vec3 modelScale = vec3(
            length( vec3( modelMatrix[ 0 ].xyz ) ),
            length( vec3( modelMatrix[ 1 ].xyz ) ),
            length( vec3( modelMatrix[ 2 ].xyz ) )
          );

          // Beer's-law coefficient
          vec3 attenuationCoefficient = vec3(0.0);
          if ( !isinf( material.attenuationDistance ) ) {
            attenuationCoefficient = -log( material.attenuationColor ) / material.attenuationDistance;
          }

          if (distortion > 0.0) {
            distortionNormal = distortion * vec3(snoiseFractal(vec3((pos * distortionScale + temporalOffset))), snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)), snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset)));
          }
          for (float i = 0.0; i < ${e}.0; i ++) {
            vec3 sampleNorm;
            if (roughnessFactor > 0.0) {
              sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
            } else {
              // Smooth surfaces skip four hashes, a pow, and a normalization per sample
              sampleNorm = normalize(n + distortionNormal);
            }
            float sampleProgress = (i + randomCoords) / float(${e});
            float sampleThickness = material.thickness + thickness_smear * sampleProgress;
            // Fresnel is identical for RGB; only the refracted IOR changes.
            vec3 F = EnvironmentBRDF( sampleNorm, v, material.specularColor, material.specularF90, material.roughness );
            if (chromaticAberration == 0.0) {
              // With one IOR, a single framebuffer sample supplies all RGB channels
              transmission += getIBLVolumeRefraction(
                sampleNorm, v, material.roughness, material.diffuseColor, pos, modelScale, attenuationCoefficient, F,
                viewMatrix, projectionMatrix, material.ior, sampleThickness, material.attenuationDistance
              ).rgb;
            } else {
              float aberration = chromaticAberration * sampleProgress;
              transmission.r += getIBLVolumeRefraction(
                sampleNorm, v, material.roughness, material.diffuseColor, pos, modelScale, attenuationCoefficient, F,
                viewMatrix, projectionMatrix, material.ior, sampleThickness, material.attenuationDistance
              ).r;
              transmission.g += getIBLVolumeRefraction(
                sampleNorm, v, material.roughness, material.diffuseColor, pos, modelScale, attenuationCoefficient, F,
                viewMatrix, projectionMatrix, material.ior * (1.0 + aberration), sampleThickness, material.attenuationDistance
              ).g;
              transmission.b += getIBLVolumeRefraction(
                sampleNorm, v, material.roughness, material.diffuseColor, pos, modelScale, attenuationCoefficient, F,
                viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * aberration), sampleThickness, material.attenuationDistance
              ).b;
            }
          }
          transmission /= ${e}.0;
          totalDiffuse = mix( totalDiffuse, transmission, material.transmission );
        }\n`)},Object.keys(this.uniforms).forEach(e=>Object.defineProperty(this,e,{get:()=>this.uniforms[e].value,set:t=>this.uniforms[e].value=t}))}},I=P.forwardRef(({buffer:e,transmissionSampler:t=!1,backside:n=!1,side:i=0,transmission:a=1,thickness:o=0,backsideThickness:s=0,backsideEnvMapIntensity:c=1,samples:l=10,resolution:u,backsideResolution:d,background:f,anisotropy:p,anisotropicBlur:m,...h},_)=>{g({MeshTransmissionMaterial:re});let v=P.useRef(null),[b]=P.useState(()=>new ne),x=d??u,S=F(x,x),C=F(u,u),w,T,E,D;return y(e=>{let r=v.current;if(r.uniforms.time.value=e.clock.elapsedTime,r.uniforms.buffer.value===C.texture&&!t){var a;D=(a=r.__r3f)==null||(a=a.parent)==null?void 0:a.object,D&&r.visible&&r.uniforms._transmission.value!==0&&(E=e.gl.toneMapping,w=e.scene.background,T=r.envMapIntensity,e.gl.toneMapping=0,f&&(e.scene.background=f),D.material=b,n&&(e.gl.setRenderTarget(S),e.gl.render(e.scene,e.camera),D.material=r,r.uniforms.buffer.value=S.texture,r.uniforms.thickness.value=s,r.side=1,i!==1&&(r.needsUpdate=!0),r.envMapIntensity=c),e.gl.setRenderTarget(C),e.gl.render(e.scene,e.camera),D.material=r,r.uniforms.thickness.value=o,r.side=i,n&&i!==1&&(r.needsUpdate=!0),r.uniforms.buffer.value=C.texture,r.envMapIntensity=T,e.scene.background=w,e.gl.setRenderTarget(null),e.gl.toneMapping=E)}}),P.useImperativeHandle(_,()=>v.current,[]),P.createElement(`meshTransmissionMaterial`,r({args:[l,t],ref:v},h,{buffer:e||C.texture,_transmission:a,anisotropicBlur:m??p,transmission:t?a:0,thickness:o,side:i}))}),L=1e-5;function R(e,t,n){let r=new C,i=n-L;return r.absarc(L,L,L,-Math.PI/2,-Math.PI,!0),r.absarc(L,t-i*2,L,Math.PI,Math.PI/2,!0),r.absarc(e-i*2,t-i*2,L,Math.PI/2,0,!0),r.absarc(e-i*2,L,L,0,-Math.PI/2,!0),r}var z=P.forwardRef(function({args:[e=1,t=1,n=1]=[],radius:i=.05,steps:a=1,smoothness:o=4,bevelSegments:s=4,creaseAngle:c=.4,children:l,...u},d){return P.createElement(`mesh`,r({ref:d},u),P.createElement(B,{args:[e,t,n],radius:i,steps:a,smoothness:o,bevelSegments:s,creaseAngle:c}),l)}),B=P.forwardRef(function({args:[e=1,t=1,n=1]=[],radius:i=.05,steps:a=1,smoothness:o=4,bevelSegments:s=4,creaseAngle:c=.4,...l},u){let d=P.useMemo(()=>R(e,t,i),[e,t,i]),f=P.useMemo(()=>({depth:n-i*2,bevelEnabled:!0,bevelSegments:s*2,steps:a,bevelSize:i-L,bevelThickness:i,curveSegments:o}),[n,i,o,s,a]),p=P.useRef(null);return P.useLayoutEffect(()=>{p.current&&(p.current.center(),M(p.current,c))},[d,f,c]),P.useImperativeHandle(u,()=>p.current),P.createElement(`extrudeGeometry`,r({ref:p,args:[d,f]},l))}),V=P.forwardRef(({children:e,enabled:t=!0,speed:n=1,rotationIntensity:r=1,floatIntensity:i=1,floatingRange:a=[-.1,.1],autoInvalidate:o=!1,...s},c)=>{let l=P.useRef(null);P.useImperativeHandle(c,()=>l.current,[]);let u=P.useRef(Math.random()*1e4);return y(e=>{if(!t||n===0)return;o&&e.invalidate();let s=u.current+e.clock.elapsedTime;l.current.rotation.x=Math.cos(s/4*n)/8*r,l.current.rotation.y=Math.sin(s/4*n)/8*r,l.current.rotation.z=Math.sin(s/4*n)/20*r;let c=Math.sin(s/4*n)/10;c=v.mapLinear(c,-.1,.1,a?.[0]??-.1,a?.[1]??.1),l.current.position.y=c*i,l.current.updateMatrix()}),P.createElement(`group`,s,P.createElement(`group`,{ref:l,matrixAutoUpdate:!1},e))}),H=f(),U=14,W=`#111214`,G=-2.6;function K({quality:e,onReady:t}){D();let n=w();ee(t);let r=n.frameCount*U+200;return(0,H.jsxs)(H.Fragment,{children:[(0,H.jsx)(`color`,{attach:`background`,args:[W]}),(0,H.jsx)(`fog`,{attach:`fog`,args:[W,22,95]}),(0,H.jsx)(q,{quality:e}),(0,H.jsx)(`hemisphereLight`,{args:[`#ffffff`,`#202226`,.7]}),(0,H.jsx)(`directionalLight`,{position:[6,9,4],intensity:1.6}),(0,H.jsx)(J,{}),(0,H.jsx)(Y,{length:r}),(0,H.jsx)(ie,{quality:e}),(0,H.jsxs)(k,{multisampling:e===`high`?4:0,children:[(0,H.jsx)(j,{mipmapBlur:!0,intensity:.5,luminanceThreshold:.82,luminanceSmoothing:.2}),(0,H.jsx)(te,{premultiply:!0,blendFunction:A.ADD,opacity:.22}),(0,H.jsx)(O,{offset:.25,darkness:.7})]})]})}function q({quality:e}){return(0,H.jsxs)(n,{resolution:e===`high`?256:128,frames:1,children:[(0,H.jsx)(`color`,{attach:`background`,args:[`#24272c`]}),(0,H.jsx)(i,{form:`rect`,intensity:5,position:[0,6,-6],scale:[16,1.6,1]}),(0,H.jsx)(i,{form:`rect`,intensity:3.5,color:`#d8f1ff`,position:[-9,1.5,-1],"rotation-y":Math.PI/2,scale:[12,2.6,1]}),(0,H.jsx)(i,{form:`rect`,intensity:4,position:[9,2,1],"rotation-y":-Math.PI/2,scale:[12,1.6,1]}),(0,H.jsx)(i,{form:`ring`,intensity:4,position:[0,3,9],scale:3.5}),(0,H.jsx)(i,{form:`rect`,intensity:1.6,color:`#b9e6ff`,position:[0,-4,0],"rotation-x":Math.PI/2,scale:[20,20,1]})]})}function J(){let e=w(),t=(0,P.useMemo)(()=>new a,[]),n=(0,P.useMemo)(()=>new a(0,0,-20),[]),r=(0,P.useMemo)(()=>new a,[]);return y((i,a)=>{let o=e.g,s=-.7+Math.sin(o*.5)*.5+e.pointer.x*.3,c=.45+Math.cos(o*.38)*.3+e.pointer.y*.18;t.set(s,c,6-o*U),E.damp3(i.camera.position,t,.2,a),r.set(s+1.4,c*.2-.1,i.camera.position.z-18),E.damp3(n,r,.25,a),i.camera.lookAt(n)}),null}function Y({length:e}){return(0,H.jsxs)(`mesh`,{rotation:[-Math.PI/2,0,0],position:[0,G,-e/2+40],children:[(0,H.jsx)(`planeGeometry`,{args:[160,e+80]}),(0,H.jsx)(`meshStandardMaterial`,{color:`#121316`,metalness:.55,roughness:.32,envMapIntensity:.6})]})}function X(){let e=(0,P.useMemo)(()=>new h({color:`#f4f8ff`,metalness:0,roughness:.04,transmission:1,thickness:1.2,ior:1.5,attenuationColor:new m(`#b9e6ff`),attenuationDistance:2.5,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.4,specularIntensity:1}),[]);return(0,P.useEffect)(()=>()=>e.dispose(),[e]),e}function Z(e=.06,t=`#ffffff`){let n=(0,P.useMemo)(()=>new _({color:t,metalness:1,roughness:e,envMapIntensity:1.6}),[e,t]);return(0,P.useEffect)(()=>()=>n.dispose(),[n]),n}function ie({quality:e}){D();let t=w(),n=T()<.9,r=n?1.6:4.8,i=n?-1.6:.6,a=e=>6-e*U-15,o=t.stations.map(e=>e.id);return(0,H.jsx)(H.Fragment,{children:t.stations.map((t,n)=>{let s=a(t.firstFrame),c=[r,i,s];switch(o[n]){case`hero`:return(0,H.jsx)(ae,{position:c,quality:e},t.id);case`about`:return(0,H.jsx)(oe,{position:c},t.id);case`journey`:return(0,H.jsx)($,{firstFrame:t.firstFrame,count:t.frameCount,x:r,y:i,zOf:a},t.id);case`milestones`:return(0,H.jsx)(se,{position:c},t.id);case`projects`:return(0,H.jsx)(ce,{position:c},t.id);case`contact`:return(0,H.jsx)(le,{position:[r-.6,i+.2,s+2]},t.id);default:return null}})})}function Q({children:e,speed:t=.2}){let n=(0,P.useRef)(null),r=w();return y(e=>{n.current&&(n.current.rotation.y=e.clock.elapsedTime*t+r.g*.5,n.current.rotation.x=Math.sin(e.clock.elapsedTime*t*.7)*.25)}),(0,H.jsx)(`group`,{ref:n,children:e})}function ae({position:e,quality:t}){let n=X();return(0,H.jsx)(`group`,{position:e,children:(0,H.jsx)(V,{speed:1.2,rotationIntensity:.4,floatIntensity:.6,children:(0,H.jsx)(Q,{speed:.18,children:t===`high`?(0,H.jsxs)(`mesh`,{children:[(0,H.jsx)(`torusKnotGeometry`,{args:[1.25,.42,220,36]}),(0,H.jsx)(I,{backside:!0,samples:6,resolution:512,thickness:.9,roughness:.04,chromaticAberration:.08,anisotropy:.25,distortion:.2,distortionScale:.35,temporalDistortion:.06,ior:1.45,color:`#eef6ff`})]}):(0,H.jsx)(`mesh`,{material:n,children:(0,H.jsx)(`torusKnotGeometry`,{args:[1.25,.42,160,28]})})})})})}function oe({position:e}){let t=Z(.05),n=Z(.28,`#d6dde4`),r=(0,P.useRef)(null);return y(e=>{r.current&&(r.current.rotation.y=e.clock.elapsedTime*.25)}),(0,H.jsx)(`group`,{position:e,children:(0,H.jsxs)(V,{speed:1,floatIntensity:.5,children:[(0,H.jsx)(`mesh`,{material:t,children:(0,H.jsx)(`sphereGeometry`,{args:[1.05,64,64]})}),(0,H.jsxs)(`group`,{ref:r,children:[(0,H.jsx)(`mesh`,{material:n,position:[1.9,.6,0],children:(0,H.jsx)(`sphereGeometry`,{args:[.42,48,48]})}),(0,H.jsx)(`mesh`,{material:t,position:[-1.5,-.7,.6],children:(0,H.jsx)(`sphereGeometry`,{args:[.28,48,48]})}),(0,H.jsx)(`mesh`,{material:n,position:[0,1.4,-1.2],children:(0,H.jsx)(`torusGeometry`,{args:[1.8,.02,12,160]})})]})]})})}function $({firstFrame:e,count:t,x:n,y:r,zOf:i}){let a=X(),o=Z(.12);return(0,H.jsx)(H.Fragment,{children:Array.from({length:t},(t,s)=>{let c=i(e+s),l=(s%2==0?1:-1)*.35;return(0,H.jsx)(`group`,{position:[n+s%2*.6,r+.2,c],rotation:[0,l,.08*l],children:(0,H.jsxs)(V,{speed:1.4,rotationIntensity:.2,floatIntensity:.4,children:[(0,H.jsx)(z,{args:[2.2,3,.16],radius:.07,smoothness:4,material:a}),(0,H.jsx)(`mesh`,{material:o,position:[0,-1.62,0],children:(0,H.jsx)(`boxGeometry`,{args:[2.3,.06,.06]})})]})},s)})})}function se({position:e}){let t=Z(.05),n=X();return(0,H.jsx)(`group`,{position:e,children:(0,H.jsx)(V,{speed:1.1,floatIntensity:.5,children:(0,H.jsxs)(Q,{speed:.15,children:[(0,H.jsx)(`mesh`,{material:n,position:[0,.3,0],children:(0,H.jsx)(`icosahedronGeometry`,{args:[1.05,0]})}),[-1.6,1.6].map((e,n)=>(0,H.jsx)(`mesh`,{material:t,position:[e,-.4+n*.5,.2],children:(0,H.jsx)(`capsuleGeometry`,{args:[.28,1.1+n*.4,12,32]})},n))]})})})}function ce({position:e}){let t=X(),n=Z(.08),r=(0,P.useMemo)(()=>[{p:[0,0,0],s:1.2,m:`g`},{p:[1.5,.9,-.6],s:.75,m:`c`},{p:[-1.3,-.8,.4],s:.85,m:`g`},{p:[1.1,-1.1,.8],s:.5,m:`c`},{p:[-.9,1.2,-.9],s:.55,m:`g`}],[]);return(0,H.jsx)(`group`,{position:e,children:(0,H.jsx)(V,{speed:1.2,floatIntensity:.5,children:(0,H.jsx)(Q,{speed:.12,children:r.map((e,r)=>(0,H.jsx)(z,{args:[e.s,e.s,e.s],radius:e.s*.12,smoothness:4,position:e.p,rotation:[r*.4,r*.7,0],material:e.m===`g`?t:n},r))})})})}function le({position:e}){let t=X(),n=Z(.04);return(0,H.jsx)(`group`,{position:e,children:(0,H.jsxs)(V,{speed:.9,floatIntensity:.4,children:[(0,H.jsx)(Q,{speed:.1,children:(0,H.jsx)(`mesh`,{material:t,children:(0,H.jsx)(`torusGeometry`,{args:[1.9,.38,48,160]})})}),(0,H.jsx)(`mesh`,{material:n,children:(0,H.jsx)(`sphereGeometry`,{args:[.7,64,64]})})]})})}export{K as default};