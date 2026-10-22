import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {sitePath} from '../../paths.js';
import {normalizeSceneObjects} from './config.js';
import {createPrefab} from './prefabs.js';
import {disposeObject} from '../runtime/world.js';

export class SceneComposer {
 constructor(scene,{changed=()=>{},status=()=>{},loadModel}={}){
  this.scene=scene;this.changed=changed;this.status=status;this.entries=new Map();this.dead=false;this.time={value:0};
  this.loader=new GLTFLoader();this.loadModel=loadModel||((url,draco)=>{if(draco){this.draco||=new DRACOLoader();this.draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');this.loader.setDRACOLoader(this.draco);}else this.loader.setDRACOLoader(null);return this.loader.loadAsync(url);});
 }
 sync(objects,assets={}){
  const configs=normalizeSceneObjects(objects),ids=new Set(configs.map(c=>c.id));
  for(const [id,e] of this.entries)if(!ids.has(id)){this.release(e);this.entries.delete(id);}
  for(const config of configs){const url=assets[config.assetId]||config.url,source=[config.kind,config.preset,url,config.draco,config.fitSize].join('|');let e=this.entries.get(config.id);
   if(!e||e.source!==source){if(e)this.release(e);const anchor=new THREE.Group();anchor.userData.sceneObjectId=config.id;anchor.name=config.name;this.scene.add(anchor);e={id:config.id,config,source,anchor,url,originals:new Map(),loaded:false,removed:false};this.entries.set(e.id,e);this.load(e);}else e.config=config;
   this.apply(e);
  }
  this.changed();
 }
 async load(e){
  this.status(e.id,'loading','');
  try{
   let visual,mixer,update=()=>{},dynamic=false;
   if(e.config.kind==='model'){
    if(!e.url)throw Error('模型素材不存在，请重新选择 GLB 文件或填写地址');
    const gltf=await this.loadModel(sitePath(e.url),e.config.draco);visual=gltf.scene;
    if(e.removed||this.dead){disposeObject(visual);return;}
    visual.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(visual),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    if(box.isEmpty()||!Number.isFinite(size.length())){disposeObject(visual);throw Error('模型中没有可显示的几何体');}
    const fit=new THREE.Group();fit.add(visual);visual.position.sub(new THREE.Vector3(center.x,box.min.y,center.z));fit.scale.setScalar(e.config.fitSize/Math.max(size.x,size.y,size.z,.01));
    if(gltf.animations?.length){mixer=new THREE.AnimationMixer(visual);gltf.animations.forEach(clip=>mixer.clipAction(clip).play());dynamic=true;}
    visual=fit;
   }else{const p=createPrefab(e.config.kind==='label'?'label':e.config.preset);visual=p.root;update=p.update;dynamic=p.dynamic;}
   if(e.removed||this.dead){mixer?.stopAllAction();disposeObject(visual);return;}
   const box=new THREE.Box3().setFromObject(visual);e.labelHeight=box.isEmpty()?2:Math.max(.5,box.max.y);
   const animated=new THREE.Group();animated.add(visual);e.visual=animated;e.mixer=mixer;e.update=update;e.dynamic=dynamic;e.anchor.add(animated);
   visual.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;e.originals.set(o,o.material);}});
   e.loaded=true;
   this.apply(e);this.status(e.id,'ready','');this.changed();
  }catch(error){if(!e.removed&&!this.dead){e.error=error.message;this.status(e.id,'error',e.error);this.changed();}}
 }
 apply(e){
  const c=e.config;e.anchor.position.fromArray(c.position);e.anchor.rotation.set(...c.rotation.map(THREE.MathUtils.degToRad));e.anchor.scale.fromArray(c.scale);e.anchor.visible=c.visible;e.anchor.name=c.name;
  if(!e.loaded)return;const key=JSON.stringify(c.material);
  if(key!==e.materialKey){e.materialKey=key;if(c.material.preset==='original'){for(const [o,m] of e.originals)o.material=m;e.override?.dispose();e.override=null;}
   else {const m=c.material;const previous=e.override;e.override=new THREE.MeshPhysicalMaterial({color:m.color,metalness:m.metalness,roughness:m.roughness,transparent:m.opacity<1,opacity:m.opacity,depthWrite:m.opacity>.9,clearcoat:.65,emissive:m.color,emissiveIntensity:m.emissive});
    if(m.preset==='hologram'){e.override.onBeforeCompile=shader=>{shader.uniforms.astraObjectTime=this.time;shader.vertexShader='varying vec3 asObjectPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n asObjectPosition=position;');shader.fragmentShader='uniform float astraObjectTime;varying vec3 asObjectPosition;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n float scan=pow(max(0.,1.-abs(fract(asObjectPosition.y*.12-astraObjectTime*.15)-.5)*12.),3.);totalEmissiveRadiance+=diffuseColor.rgb*scan*.8;');};e.override.customProgramCacheKey=()=> 'astra-object-hologram-v1';}
    for(const [o] of e.originals)o.material=e.override;previous?.dispose();
   }
  }
  e.anchor.updateWorldMatrix(true,true);
 }
 update(time,dt,playing){
  this.time.value=time;
  for(const e of this.entries.values()){
   if(!e.loaded||!e.anchor.visible)continue;
   if(playing&&e.config.animation.clips)e.mixer?.update(dt);
   e.update?.(time);
   const a=e.config.animation,s=a.speed;
   e.visual.rotation.y=a.type==='rotate'?time*s*.3:0;
   e.visual.position.y=a.type==='float'?Math.sin(time*s)*.35:0;
   e.visual.scale.setScalar(a.type==='pulse'?1+Math.sin(time*s*2)*.035:1);
  }
 }
 get dynamicShadows(){return [...this.entries.values()].some(e=>e.loaded&&e.anchor.visible&&(e.dynamic||e.config.animation.type!=='none'));}
 poi(e){
  if(!e.loaded)return null;const c=e.config,l=c.label;
  const local=new THREE.Vector3(l.offset[0],e.labelHeight+l.offset[1],l.offset[2]);e.anchor.updateWorldMatrix(true,true);
  return {id:'object-'+e.id,objectId:e.id,world:true,name:l.title||c.name,description:l.description,status:l.status,color:l.color,style:l.style,rows:l.rows,link:l.link,linkText:l.linkText,value:l.rows[0]?.value,unit:l.rows[0]?.unit,position:e.anchor.localToWorld(local)};
 }
 labels(){return [...this.entries.values()].filter(e=>e.config.visible&&e.config.label.enabled).map(e=>this.poi(e)).filter(Boolean);}
 pick(object){let o=object;while(o){const id=o.userData.sceneObjectId;if(id)return this.entries.get(id);o=o.parent;}return null;}
 transform(id){const e=this.entries.get(id);if(!e)return null;return {id,position:e.anchor.position.toArray().map(round),rotation:[e.anchor.rotation.x,e.anchor.rotation.y,e.anchor.rotation.z].map(v=>round(THREE.MathUtils.radToDeg(v))),scale:e.anchor.scale.toArray().map(v=>Math.max(.02,round(v)))};}
 ground(id){const e=this.entries.get(id);if(!e?.loaded)return null;e.anchor.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(e.anchor);e.anchor.position.y-=box.min.y;return this.transform(id);}
 retry(id){const e=this.entries.get(id);if(!e||e.loaded)return;e.error='';this.load(e);}
 release(e){e.removed=true;e.mixer?.stopAllAction();e.mixer?.uncacheRoot(e.mixer.getRoot());for(const [o,m] of e.originals)o.material=m;e.override?.dispose();disposeObject(e.anchor);e.anchor.removeFromParent();}
 dispose(){this.dead=true;for(const e of this.entries.values())this.release(e);this.entries.clear();this.draco?.dispose();}
}
const round=v=>Math.round(v*1000)/1000;
