import * as THREE from 'three';
import {sitePath} from '../../paths.js';
import {texturePresets} from './environment-config.js';
import {waterMaterial} from '../runtime/scenes/detailKit.js';

// Scene-local resources: identical overrides share a material; texture sources stay warm
// while sliders change. Everything is released with the scene composer.
export class SceneMaterials{
 constructor({time={value:0},changed=()=>{},textureLoader}={}){this.time=time;this.changed=changed;this.textureLoader=textureLoader||new THREE.TextureLoader();this.sources=new Map();this.materials=new Map();this.dead=false;}
 source(url,normal=false){
  if(this.sources.has(url))return this.sources.get(url);
  const texture=new THREE.Texture();texture.colorSpace=normal?THREE.NoColorSpace:THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;
  const entry={texture,clones:new Set()};this.sources.set(url,entry);
  if(typeof document!=='undefined')this.textureLoader.load(sitePath(url),loaded=>{
   if(this.dead){loaded.dispose();return;}texture.image=loaded.image;texture.needsUpdate=true;
   for(const clone of entry.clones){clone.image=loaded.image;clone.needsUpdate=true;}
   loaded.dispose();this.changed();
  },undefined,()=>{if(!this.dead)this.changed();});
  return entry;
 }
 map(url,c,normal=false){const source=this.source(url,normal),map=source.texture.clone();map.repeat.fromArray(c.textureRepeat||[2,2]);map.center.set(.5,.5);map.rotation=THREE.MathUtils.degToRad(c.textureRotation||0);map.needsUpdate=!!map.image;source.clones.add(map);return {map,release:()=>{source.clones.delete(map);map.dispose();}};}
 acquire(c){
  const key=JSON.stringify(c);let entry=this.materials.get(key);
  if(!entry){
   const material=c.preset==='water'?waterMaterial(this.time,{color:c.color,tint:'#83d3de'}):new THREE.MeshPhysicalMaterial();
   material.color.set(c.color);material.metalness=c.metalness;material.roughness=c.roughness;material.transparent=c.opacity<1;material.opacity=c.opacity;material.depthWrite=c.opacity>.9;material.emissive.set(c.color);material.emissiveIntensity=c.emissive;material.clearcoat=c.preset==='water'?1:.18;
   const leases=[],texture=texturePresets.find(t=>t.id===c.texture);
   if(texture?.url){const lease=this.map(texture.url,c);leases.push(lease);material.map=lease.map;if(texture.normal){const normal=this.map(texture.normal,c,true);leases.push(normal);material.normalMap=normal.map;material.normalScale.setScalar(.45);}else{material.bumpMap=lease.map;material.bumpScale=.025;}}
   if(c.preset==='hologram'){
    material.onBeforeCompile=shader=>{shader.uniforms.astraObjectTime=this.time;shader.vertexShader='varying vec3 asObjectPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n asObjectPosition=position;');shader.fragmentShader='uniform float astraObjectTime;varying vec3 asObjectPosition;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n float scan=pow(max(0.,1.-abs(fract(asObjectPosition.y*.12-astraObjectTime*.15)-.5)*12.),3.);totalEmissiveRadiance+=diffuseColor.rgb*scan*.8;');};material.customProgramCacheKey=()=> 'astra-object-hologram-v1';
   }
   entry={material,leases,refs:0};this.materials.set(key,entry);
  }
  entry.refs++;let released=false;
  return {material:entry.material,release:()=>{if(released)return;released=true;if(--entry.refs===0){entry.material.dispose();entry.leases.forEach(l=>l.release());this.materials.delete(key);}}};
 }
 dispose(){this.dead=true;for(const e of this.materials.values()){e.material.dispose();e.leases.forEach(l=>l.release());}this.materials.clear();for(const s of this.sources.values())s.texture.dispose();this.sources.clear();}
}
