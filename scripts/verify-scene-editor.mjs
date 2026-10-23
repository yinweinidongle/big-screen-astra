import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {SceneComposer} from '../src/workbench/scene/composer.js';
import {createPrefab} from '../src/workbench/scene/prefabs.js';
import {makeSceneObject,normalizeSceneObjects,cloneSceneObject,scenePresets,materialPresets,modelPresets} from '../src/workbench/scene/config.js';
import {scaleObjectBy,scaleObjectAxis,MIN_OBJECT_SCALE,MAX_OBJECT_SCALE} from '../src/workbench/scene/scaling.js';
import {makeProject} from '../src/workbench/templates.js';
import {validateProject,projectForExport} from '../src/workbench/schema.js';
import {buildWorld,disposeObject} from '../src/workbench/runtime/world.js';
import {themeById} from '../src/workbench/catalog.js';
const turn=()=>new Promise(resolve=>setTimeout(resolve,0));
const finish=async c=>{for(let i=0;i<30&&[...c.entries.values()].some(e=>!e.loaded&&!e.error);i++)await turn();};
const near=(actual,expected,message)=>assert(Math.abs(actual-expected)<1e-6*Math.max(1,Math.abs(expected)),`${message}: expected ${expected}, received ${actual}`);
const nearVector=(actual,expected,message)=>actual.forEach((value,i)=>near(value,expected[i],`${message} axis ${i}`));
const proportions=[1,2,4];
assert.deepEqual(scaleObjectBy(proportions,2),[2,4,8]);assert.deepEqual(proportions,[1,2,4],'scale helpers must not mutate undo snapshots');
assert.deepEqual(scaleObjectBy(proportions,100),[10,20,MAX_OBJECT_SCALE],'uniform enlargement must preserve proportions at the upper bound');
assert.deepEqual(scaleObjectBy(proportions,.0001),[MIN_OBJECT_SCALE,.04,.08],'uniform shrinking must preserve proportions at the lower bound');
assert.deepEqual(scaleObjectAxis(proportions,1,4,true),[2,4,8],'linked axis input scales the whole object');
assert.deepEqual(scaleObjectAxis(proportions,1,4,false),[1,4,4],'independent axis input preserves the other dimensions');
assert.deepEqual(scaleObjectAxis(proportions,0,100,true),[10,20,40]);
assert.deepEqual(scaleObjectAxis(proportions,2,-1,false),[1,2,MIN_OBJECT_SCALE]);
assert.deepEqual(scaleObjectAxis(proportions,2,100,false),[1,2,MAX_OBJECT_SCALE]);
for(const factor of [0,-1,NaN,Infinity])assert.deepEqual(scaleObjectBy(proportions,factor),proportions,'invalid scale factors must be ignored');
for(const axis of [-1,3,.5,NaN])assert.deepEqual(scaleObjectAxis(proportions,axis,2,false),proportions,'invalid axes must not change objects');
for(const value of [NaN,Infinity,undefined,'2'])assert.deepEqual(scaleObjectAxis(proportions,0,value,true),proportions,'non-numeric scale inputs must not change objects');
assert.deepEqual(scaleObjectBy([NaN,-1,Infinity],2),[MIN_OBJECT_SCALE,MIN_OBJECT_SCALE,MAX_OBJECT_SCALE],'invalid source scales must become finite and bounded');
for(const p of scenePresets){const model=createPrefab(p.id);let calls=0,triangles=0;model.root.traverse(o=>{if(!o.isMesh)return;calls++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;for(const n of o.geometry.attributes.position.array)assert(Number.isFinite(n),p.id);});assert(calls<=7,p.id+' must stay batched');assert(triangles<10000,p.id);model.update(1200);disposeObject(model.root);}
for(const p of modelPresets){const bytes=readFileSync('public'+p.url),gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');assert(!new THREE.Box3().setFromObject(gltf.scene).isEmpty(),p.id);disposeObject(gltf.scene);}
const scene=new THREE.Scene(),project=makeProject('city'),node=project.nodes.find(n=>n.type==='scene'),world=await buildWorld(scene,'city',node.props,themeById(project.theme)),base=world.root;
const statuses=[];let resolves;
const composer=new SceneComposer(scene,{status:(id,status,message)=>statuses.push({id,status,message}),loadModel:async()=>{const bytes=readFileSync('public/assets/factory-sample.glb');return new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');}});
const tower=makeSceneObject('tower',{position:[12,1,13]}),label=makeSceneObject('label',{position:[1,2,3],label:{title:'设备状态',rows:[{label:'温度',value:'27.5',unit:'°C'}]}}),glb=makeSceneObject('glb',{url:'/assets/factory-sample.glb'});
composer.sync([tower,label,glb]);await finish(composer);assert.equal(scene.children.includes(base),true);assert.equal(composer.entries.size,3);assert([...composer.entries.values()].every(e=>e.loaded));
const entry=composer.entries.get(tower.id),visual=entry.visual,geometry=[...entry.originals.keys()][0].geometry;
tower.position=[14,2,9];tower.rotation=[0,45,0];composer.sync([tower,label,glb]);assert.equal(entry.visual,visual);assert.equal([...entry.originals.keys()][0].geometry,geometry);assert.deepEqual(composer.transform(tower.id).position,[14,2,9]);assert(Math.abs(composer.transform(tower.id).rotation[1]-45)<.001);
for(const mat of materialPresets){tower.material={preset:mat.id,...mat};composer.sync([tower,label,glb]);assert.equal(entry.visual,visual);for(const [mesh,original] of entry.originals)assert.equal(mesh.material,mat.id==='original'?original:entry.override);}
const gb=composer.entries.get(glb.id);for(let i=0;i<200;i++)composer.update(0,0,false);assert(new THREE.Box3().setFromObject(gb.anchor).getSize(new THREE.Vector3()).length()<15,'normalized GLB size must survive updates');
// Measure rendered dimensions, including the GLB normalization group. Config-only
// checks would miss a per-frame animation update that resets the model's scale.
tower.rotation=[0,0,0];glb.animation.clips=false;composer.sync([tower,label,glb]);composer.update(0,0,false);
const sizeOf=anchor=>{anchor.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(anchor).getSize(new THREE.Vector3()).toArray();};
const towerSize=sizeOf(entry.anchor),glbSize=sizeOf(gb.anchor),baseSize=sizeOf(base),labelTransform=composer.transform(label.id),loadCount=statuses.length;
const meshGeometry=new Map([...entry.originals.keys(),...gb.originals.keys()].map(mesh=>[mesh,mesh.geometry])),glbVisual=gb.visual,fitScale=gb.visual.children[0].scale.toArray();
assert([...towerSize,...glbSize].every(value=>value>0),'test models must have measurable three-dimensional bounds');
tower.scale=[.5,2,1.25];composer.sync([tower,label,glb]);
nearVector(sizeOf(entry.anchor),towerSize.map((value,i)=>value*tower.scale[i]),'prefab non-uniform scale changes actual bounds');
nearVector(sizeOf(gb.anchor),glbSize,'scaling a prefab must leave the GLB unchanged');
assert.deepEqual(composer.transform(tower.id).scale,tower.scale);
const scaledTowerSize=sizeOf(entry.anchor);
glb.scale=[2,.75,1.5];composer.sync([tower,label,glb]);
nearVector(sizeOf(gb.anchor),glbSize.map((value,i)=>value*glb.scale[i]),'GLB non-uniform scale composes with its normalized fit');
nearVector(sizeOf(entry.anchor),scaledTowerSize,'scaling a GLB must leave the prefab unchanged');
for(const playing of [false,true])for(let i=0;i<100;i++)composer.update(i/30,1/30,playing);
nearVector(sizeOf(entry.anchor),scaledTowerSize,'playing and paused updates preserve prefab scale');
nearVector(sizeOf(gb.anchor),glbSize.map((value,i)=>value*glb.scale[i]),'playing and paused updates preserve GLB scale');
// Object pulse and imported clips use child wrappers, never the user transform.
tower.animation.type='pulse';glb.animation.type='pulse';glb.animation.clips=true;composer.sync([tower,label,glb]);
for(let i=0;i<100;i++){composer.update(i/30,1/30,true);assert.deepEqual(composer.transform(tower.id).scale,tower.scale);assert.deepEqual(composer.transform(glb.id).scale,glb.scale);}
nearVector(gb.visual.children[0].scale.toArray(),fitScale,'GLB fit scale survives object and imported animations');
tower.animation.type='none';glb.animation.type='none';composer.sync([tower,label,glb]);composer.update(0,0,false);
assert.equal(entry.visual,visual);assert.equal(gb.visual,glbVisual);for(const [mesh,originalGeometry] of meshGeometry)assert.equal(mesh.geometry,originalGeometry,'scaling must reuse loaded mesh geometry');
assert.equal(statuses.length,loadCount,'scaling must not reload models');assert.deepEqual(composer.transform(label.id),labelTransform,'scaling must not change another object');nearVector(sizeOf(base),baseSize,'scaling must not change the original scene');
const poi=composer.labels().find(p=>p.objectId===label.id);assert.equal(poi.rows[0].value,'27.5');assert.equal(poi.name,'设备状态');assert.equal(poi.world,true);
label.visible=false;composer.sync([tower,label,glb]);assert(!composer.labels().some(p=>p.objectId===label.id));
const before=composer.transform(tower.id);composer.update(6,0,false);assert.deepEqual(composer.transform(tower.id),before);
const copy=cloneSceneObject(tower);assert.notEqual(copy.id,tower.id);assert.equal(copy.position[0],tower.position[0]+2);
composer.sync([tower,glb]);assert(!composer.entries.has(label.id));assert.equal(scene.children.includes(base),true);
node.props.sceneObjects=[tower,glb];project.assets.push({id:'custom-glb',name:'equipment.glb',type:'model',url:''});node.props.sceneObjects[1].assetId='custom-glb';const roundTrip=validateProject(projectForExport(project));assert.equal(roundTrip.nodes.find(n=>n.id===node.id).props.sceneObjects[1].assetId,'custom-glb');assert.deepEqual(roundTrip.nodes.find(n=>n.id===node.id).props.sceneObjects[0].position,tower.position);assert.deepEqual(roundTrip.nodes.find(n=>n.id===node.id).props.sceneObjects.map(o=>o.scale),[tower.scale,glb.scale],'project export/import preserves independent GLB and prefab scales');
const invalid=normalizeSceneObjects([{id:'same',position:[NaN,Infinity,-999],scale:[0,-2,100],url:'javascript:alert(1)',label:{link:'javascript:alert(1)'}},{id:'same'}]);assert.notEqual(invalid[0].id,invalid[1].id);assert.equal(invalid[0].url,'');assert.equal(invalid[0].label.link,'');assert.deepEqual(invalid[0].scale,[.02,.02,40]);assert(invalid[0].position.every(Number.isFinite));assert.equal(normalizeSceneObjects(Array.from({length:100},()=>({}))).length,64);
const delayed=new SceneComposer(scene,{loadModel:()=>new Promise(resolve=>resolves=resolve)});const stale=makeSceneObject('glb',{url:'/assets/stale.glb'});delayed.sync([stale]);delayed.sync([]);const staleRoot=new THREE.Group();staleRoot.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial()));let disposed=false;staleRoot.children[0].geometry.addEventListener('dispose',()=>disposed=true);resolves({scene:staleRoot,animations:[]});await turn();assert(disposed);assert.equal(delayed.entries.size,0);delayed.dispose();
composer.dispose();assert.equal(scene.children.includes(base),true);disposeObject(base);console.log(`Scene editor: ${scenePresets.length} batched prefabs, ${materialPresets.length} materials, same-scene GLB composition, proportional and independent scaling with rendered bounds, animation isolation, annotations, project round-trip, normalization and stale-load disposal passed.`);
