import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export {THREE};
export const vec=(x,y,z)=>new THREE.Vector3(x,y,z);
export const rng=i=>{const n=Math.sin(i*127.1+31.7)*43758.5453;return n-Math.floor(n);};
export const metal=(color,roughness=.38,metalness=.65)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
export const glow=(color,intensity=.4)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.4,metalness:.2});
// Geometry is merged directly by material. Hundreds of architectural parts cost a few draws.
export class DetailBatch{
 constructor(root){this.root=root;this.buckets=new Map();this.parts=0;}
 add(g,m,x=0,y=0,z=0,rotation=null){if(!g.index)g.setIndex(Array.from({length:g.getAttribute('position').count},(_,i)=>i));const q=rotation instanceof THREE.Quaternion?rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rotation||[0,0,0])));g.applyMatrix4(new THREE.Matrix4().compose(vec(x,y,z),q,vec(1,1,1)));if(!this.buckets.has(m))this.buckets.set(m,[]);this.buckets.get(m).push(g);this.parts++;}
 box(x,y,z,w,h,d,m,rounded=false,rotation=null){this.add(rounded?new RoundedBoxGeometry(w,h,d,1,Math.min(w,h,d,.24)*.17):new THREE.BoxGeometry(w,h,d),m,x,y,z,rotation);}
 cylinder(x,y,z,r,h,m,top=r,segments=12){this.add(new THREE.CylinderGeometry(top,r,h,segments),m,x,y,z);}
 beam(a,b,width,depth,m){const direction=b.clone().sub(a),mid=a.clone().add(b).multiplyScalar(.5);this.add(new THREE.BoxGeometry(width,direction.length(),depth),m,mid.x,mid.y,mid.z,new THREE.Quaternion().setFromUnitVectors(vec(0,1,0),direction.normalize()));}
 pipe(points,r,m){const path=new THREE.CatmullRomCurve3(points.map(p=>vec(...p)));this.add(new THREE.TubeGeometry(path,Math.max(12,points.length*6),r,6,false),m);}
 ring(x,y,z,r,t,m,rotation=[Math.PI/2,0,0]){this.add(new THREE.TorusGeometry(r,t,6,40),m,x,y,z,rotation);}
 flush(name='architectural-detail'){let draws=0;for(const [m,list] of this.buckets){const g=mergeGeometries(list,false);list.forEach(g=>g.dispose());if(!g)continue;const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.castShadow=!m.transparent;mesh.receiveShadow=true;this.root.add(mesh);draws++;}this.buckets.clear();return {parts:this.parts,draws};}
}
export function instances(root,geometry,material,items,{cast=false,name='detail-instances'}={}){const mesh=new THREE.InstancedMesh(geometry,material,items.length),dummy=new THREE.Object3D();items.forEach((item,i)=>{dummy.position.fromArray(item.p);dummy.scale.fromArray(item.s||[1,1,1]);dummy.rotation.set(...(item.r||[0,0,0]));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(item.color)mesh.setColorAt(i,new THREE.Color(item.color));});mesh.name=name;mesh.castShadow=cast;mesh.receiveShadow=true;root.add(mesh);return mesh;}
export function contactShadows(root,items){const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const a=((x/(size-1)-.5)**2+(y/(size-1)-.5)**2)*4,offset=(y*size+x)*4;data[offset+3]=Math.round(Math.exp(-a*4)*210*Math.max(0,1-a*.55));}const map=new THREE.DataTexture(data,size,size);map.needsUpdate=true;const material=new THREE.MeshBasicMaterial({color:'#02070e',map,transparent:true,opacity:.48,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});const mesh=instances(root,new THREE.PlaneGeometry(1,1),material,items.map(p=>({p:[p[0],p[1],p[2]],s:[p[3],p[4],1],r:[-Math.PI/2,0,0]})),{name:'contact-shadows'});mesh.raycast=()=>{};return mesh;}
export function facadeMaterial(color,tint,clock,{floor=1.8,window=.58,warm=.25}={}){
 const material=new THREE.MeshPhysicalMaterial({color,metalness:.48,roughness:.24,clearcoat:.75,clearcoatRoughness:.2,envMapIntensity:1.05});
 material.onBeforeCompile=shader=>{shader.uniforms.detailTime=clock;shader.uniforms.detailTint={value:new THREE.Color(tint)};shader.uniforms.detailGrid={value:new THREE.Vector3(floor,window,warm)};
 shader.vertexShader=`varying vec3 vDetailPosition;varying vec3 vDetailNormal;\n`+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vDetailPosition=position;vDetailNormal=normal;
 #ifdef USE_INSTANCING
 vDetailPosition=(instanceMatrix*vec4(position,1.)).xyz;
 #endif
 `);
 shader.fragmentShader=`varying vec3 vDetailPosition;varying vec3 vDetailNormal;uniform float detailTime;uniform vec3 detailTint;uniform vec3 detailGrid;\n`+shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 vec2 coord=vec2(abs(vDetailNormal.z)>.5?vDetailPosition.x:vDetailPosition.z,vDetailPosition.y)*vec2(1.9,detailGrid.x);
 vec2 cell=fract(coord);vec2 index=floor(coord);
 float hash=fract(sin(dot(index,vec2(127.1,311.7)))*43758.54);
 float mask=smoothstep(.12,.2,cell.x)*(1.-smoothstep(.70,.78,cell.x))*smoothstep(.18,.25,cell.y)*(1.-smoothstep(.70,.78,cell.y));
 float lit=step(detailGrid.y,hash)*(1.-step(.6,abs(vDetailNormal.y)));
 vec3 windowColor=mix(detailTint,vec3(1.,.70,.35),step(1.-detailGrid.z,hash));
 float sweep=pow(max(0.,1.-abs(vDetailPosition.y-mod(detailTime*1.2,32.))*.8),5.);
 totalEmissiveRadiance+=windowColor*mask*lit*(.24+.08*sin(detailTime*.32+hash*6.28))+detailTint*sweep*.09;
 `);};material.customProgramCacheKey=()=> 'astra-facade-v3';return material;
}
export function waterMaterial(clock,{color='#174859',tint='#62dce9'}={}){const material=new THREE.MeshPhysicalMaterial({color,metalness:.42,roughness:.19,clearcoat:1,clearcoatRoughness:.15,envMapIntensity:1.3});material.onBeforeCompile=shader=>{shader.uniforms.waterTime=clock;shader.uniforms.waterTint={value:new THREE.Color(tint)};shader.vertexShader='varying vec2 vWaterUV;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vWaterUV=uv;');shader.fragmentShader='varying vec2 vWaterUV;uniform float waterTime;uniform vec3 waterTint;\n'+shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
 float waveA=sin(vWaterUV.x*96.+vWaterUV.y*41.+waterTime*.9);float waveB=cos(vWaterUV.y*132.-waterTime*1.4);
 normal=normalize(normal+vec3(waveA*.075,waveB*.055,0.));
 `).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 float caustic=pow(max(0.,sin(vWaterUV.x*75.+vWaterUV.y*45.+waterTime*.6)*cos(vWaterUV.y*99.-waterTime*.8)),9.);
 totalEmissiveRadiance+=waterTint*caustic*.15;
 `);};material.customProgramCacheKey=()=> 'astra-water-v3';return material;}
export function animateSurface(model,clock,callback){const previous=model.update.bind(model);model.update=(t,running)=>{previous(t,running);if(!running)return;clock.value=t;callback?.(t);};}
