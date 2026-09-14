<script setup>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const props=defineProps({digital:Boolean,rotate:Boolean,traffic:Boolean,energy:Boolean,scan:Boolean,zoom:Number});
const emit=defineEmits(['select','unavailable']);
const host=ref(null);let renderer,scene,camera,controls,frame,observer,city,roads,beams,ring,points;const ready=ref(true);let last=0;const motion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function seed(i){const x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
onMounted(()=>{try{
scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(40,1,.1,300);camera.position.set(36,32,47);
renderer=new THREE.WebGLRenderer({alpha:true,antialias:devicePixelRatio<2,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);host.value.appendChild(renderer.domElement);
controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=28;controls.maxDistance=95;controls.maxPolarAngle=Math.PI*.46;controls.target.set(0,4,0);controls.autoRotateSpeed=.45;
scene.add(new THREE.AmbientLight(0x8acaff,2));let light=new THREE.DirectionalLight(0x00dcff,3);light.position.set(15,30,10);scene.add(light);
city=new THREE.Group();scene.add(city);
const mat=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`varying vec3 vPos; varying vec3 vNormal; void main(){vec4 p=vec4(position,1.);
#ifdef USE_INSTANCING
p=instanceMatrix*p;
#endif
vPos=p.xyz;vNormal=normal;gl_Position=projectionMatrix*modelViewMatrix*p;}`,fragmentShader:`varying vec3 vPos; varying vec3 vNormal; uniform float time; void main(){float windowX=step(.63,fract(vPos.x*4.+vPos.z*4.));float windowY=step(.65,fract(vPos.y*3.));float edge=pow(1.-abs(dot(normalize(vNormal),normalize(vec3(.5,.8,1.)))),2.);float band=pow(max(0.,1.-abs(vPos.y-mod(time*1.5,20.))*.65),5.);vec3 color=vec3(.012,.07,.13)+windowX*windowY*vec3(.05,.55,.75)+edge*vec3(.01,.12,.18)+band*vec3(.02,.25,.3);gl_FragColor=vec4(color,1.);}`});
const box=new THREE.BoxGeometry(1,1,1);const instanced=new THREE.InstancedMesh(box,mat,330);const dummy=new THREE.Object3D();let n=0;
for(let i=0;i<440&&n<330;i++){let x=(seed(i+2)-.5)*53,z=(seed(i+602)-.5)*42; if(Math.abs(z-Math.sin(x*.08)*7)<3.8)continue;const h=1.3+seed(i+200)*8;dummy.position.set(x,h/2,z);dummy.scale.set(.7+seed(i)*1.4,h,.7+seed(i+10)*1.4);dummy.updateMatrix();instanced.setMatrixAt(n++,dummy.matrix)} instanced.count=n;city.add(instanced);
function tower(x,z,h,r,type){let geo=type==='cylinder'?new THREE.CylinderGeometry(r*.5,r,h,8):new THREE.BoxGeometry(r,h,r);let m=new THREE.Mesh(geo,mat);m.position.set(x,h/2,z);city.add(m);const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x29cfe4,transparent:true,opacity:.55}));edge.position.copy(m.position);city.add(edge)}
tower(4,-7,23,2,'cylinder');tower(8,-9,19,2);tower(10,-5,15,2);tower(-6,-5,18,.35,'cylinder');[7,13].forEach(y=>{let s=new THREE.Mesh(new THREE.SphereGeometry(y===7?1.6:1.1,16,12),new THREE.MeshStandardMaterial({color:0x25798d,emissive:0x167d93,emissiveIntensity:1,wireframe:false}));s.position.set(-6,y,-5);city.add(s)});
let grid=new THREE.GridHelper(68,40,0x12799a,0x0d2e43);grid.material.transparent=true;grid.material.opacity=.4;city.add(grid);
const riverGeo=new THREE.PlaneGeometry(62,7,80,1);let p=riverGeo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+Math.sin(p.getX(i)*.08)*7);riverGeo.computeVertexNormals();let river=new THREE.Mesh(riverGeo,new THREE.ShaderMaterial({uniforms:{time:{value:0}},transparent:true,side:THREE.DoubleSide,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float time;varying vec2 vUv;void main(){float wave=sin(vUv.x*90.-time*1.2+sin(vUv.y*30.))*0.5+0.5;gl_FragColor=vec4(.015,.24+wave*.09,.4+wave*.1,.68);}`}));river.rotation.x=-Math.PI/2;river.position.y=.05;city.add(river);
roads=new THREE.Group();city.add(roads);for(let i=0;i<12;i++){let a=new THREE.Vector3(-28,.12,-24+i*4.5),b=new THREE.Vector3(28,.12,-24+i*4.5);roads.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:0x19c2d8,transparent:true,opacity:.5})))}
beams=new THREE.Group();city.add(beams);[[4,-7],[-6,-5],[13,10]].forEach(([x,z])=>{let beam=new THREE.Mesh(new THREE.CylinderGeometry(.05,1.2,25,16,1,true),new THREE.MeshBasicMaterial({color:0x32e8c1,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false}));beam.position.set(x,12.5,z);beams.add(beam)});
ring=new THREE.Mesh(new THREE.RingGeometry(9,9.12,100),new THREE.MeshBasicMaterial({color:0x33e9e5,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.2;city.add(ring);
const particles=new Float32Array(160*3);for(let i=0;i<160;i++){particles[i*3]=(seed(i+902)-.5)*70;particles[i*3+1]=seed(i+1200)*28;particles[i*3+2]=(seed(i+1500)-.5)*55}points=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(particles,3)),new THREE.PointsMaterial({color:0x72e8fb,size:.07,transparent:true,opacity:.6}));scene.add(points);
observer=new ResizeObserver(()=>{if(!host.value)return;let {width,height}=host.value.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height)});observer.observe(host.value);
function animate(t){frame=requestAnimationFrame(animate);if(document.hidden||t-last<32)return;last=t;city.visible=props.digital;roads.visible=props.traffic;beams.visible=props.energy;ring.visible=props.scan;controls.enabled=props.digital;controls.autoRotate=props.rotate&&!motion;controls.update();if(!motion){mat.uniforms.time.value=t*.001;river.material.uniforms.time.value=t*.001;ring.scale.setScalar(1+(t*.0001)%1.2);ring.material.opacity=.5*(1-((t*.0001)%1.2)/1.2);points.rotation.y=t*.000008}renderer.render(scene,camera)}frame=requestAnimationFrame(animate);
}catch(e){ready.value=false;emit('unavailable');console.warn('WebGL unavailable, using city image',e)}});
watch(()=>props.zoom,()=>{if(camera){camera.position.multiplyScalar(props.zoom>0?.86:1.16);camera.position.clampLength(28,95)}});
onBeforeUnmount(()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();scene?.traverse(o=>{o.geometry?.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}});renderer?.dispose()});
</script>
<template><div class="city-scene" :class="{digital}" ref="host"><div v-if="!ready" class="webgl-note">当前设备使用夜景模式</div></div></template>
