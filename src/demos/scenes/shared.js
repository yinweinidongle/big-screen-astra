import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export {THREE};
export function box(group,x,y,z,w,h,d,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
export function cylinder(group,x,y,z,r,h,material,top=r){const m=new THREE.Mesh(new THREE.CylinderGeometry(top,r,h,24),material);m.position.set(x,y,z);m.castShadow=true;group.add(m);return m}
export function line(group,points,color,opacity=1){const m=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));group.add(m);return m}
export function standard(color,options={}){return new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.2,...options})}
export function glow(color,opacity=1){return new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity})}
export function label(name,position,detail){return {name,position:new THREE.Vector3(...position),detail}}
export function seed(i){return ((Math.sin(i*127.1+311.7)*43758.5453)%1+1)%1}
export function halo(group,x,z,color,r=2){const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{tint:{value:new THREE.Color(color)}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform vec3 tint;void main(){float d=length(v-.5)*2.;gl_FragColor=vec4(tint,pow(max(0.,1.-d),3.)*.6);}'}));m.rotation.x=-Math.PI/2;m.position.set(x,.17,z);group.add(m);return m}

// Batch stationary opaque meshes by material while leaving animated pivots,
// transparent glass and independently switchable layers intact.
export function batchStatic(group,excluded=[]){
 group.updateWorldMatrix(true,true);
 const blocked=new Set(excluded),buckets=new Map();
 function collect(object){
  if(blocked.has(object))return;
  if(object.isMesh&&!object.isInstancedMesh&&!Array.isArray(object.material)&&!object.material.transparent&&!object.material.isShaderMaterial){
   const m=object.material;
   const key=[m.type,m.color?.getHex(),m.roughness,m.metalness,m.emissive?.getHex(),m.side].join(':');
   if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(object);
  }
  for(const child of object.children)collect(child);
 }
 collect(group);
 const inverse=new THREE.Matrix4().copy(group.matrixWorld).invert();
 for(const meshes of buckets.values()){
  if(meshes.length<2)continue;
  const copies=meshes.map(mesh=>mesh.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld)));
  const merged=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());if(!merged)continue;
  const result=new THREE.Mesh(merged,meshes[0].material);result.castShadow=meshes.some(m=>m.castShadow);result.receiveShadow=meshes.some(m=>m.receiveShadow);group.add(result);
  for(const mesh of meshes){mesh.removeFromParent();mesh.geometry.dispose();}
 }
}
