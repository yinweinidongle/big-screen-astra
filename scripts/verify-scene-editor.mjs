import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {SceneComposer} from '../src/workbench/scene/composer.js';
import {createPrefab} from '../src/workbench/scene/prefabs.js';
import {makeSceneObject,normalizeSceneObjects,cloneSceneObject,scenePresets,materialPresets,modelPresets} from '../src/workbench/scene/config.js';
import {makeProject} from '../src/workbench/templates.js';
import {validateProject,projectForExport} from '../src/workbench/schema.js';
import {buildWorld,disposeObject} from '../src/workbench/runtime/world.js';
import {themeById} from '../src/workbench/catalog.js';
const turn=()=>new Promise(resolve=>setTimeout(resolve,0));
const finish=async c=>{for(let i=0;i<30&&[...c.entries.values()].some(e=>!e.loaded&&!e.error);i++)await turn();};
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
const poi=composer.labels().find(p=>p.objectId===label.id);assert.equal(poi.rows[0].value,'27.5');assert.equal(poi.name,'设备状态');assert.equal(poi.world,true);
label.visible=false;composer.sync([tower,label,glb]);assert(!composer.labels().some(p=>p.objectId===label.id));
const before=composer.transform(tower.id);composer.update(6,0,false);assert.deepEqual(composer.transform(tower.id),before);
const copy=cloneSceneObject(tower);assert.notEqual(copy.id,tower.id);assert.equal(copy.position[0],tower.position[0]+2);
composer.sync([tower,glb]);assert(!composer.entries.has(label.id));assert.equal(scene.children.includes(base),true);
node.props.sceneObjects=[tower,glb];project.assets.push({id:'custom-glb',name:'equipment.glb',type:'model',url:''});node.props.sceneObjects[1].assetId='custom-glb';const roundTrip=validateProject(projectForExport(project));assert.equal(roundTrip.nodes.find(n=>n.id===node.id).props.sceneObjects[1].assetId,'custom-glb');assert.deepEqual(roundTrip.nodes.find(n=>n.id===node.id).props.sceneObjects[0].position,tower.position);
const invalid=normalizeSceneObjects([{id:'same',position:[NaN,Infinity,-999],scale:[0,-2,100],url:'javascript:alert(1)',label:{link:'javascript:alert(1)'}},{id:'same'}]);assert.notEqual(invalid[0].id,invalid[1].id);assert.equal(invalid[0].url,'');assert.equal(invalid[0].label.link,'');assert.deepEqual(invalid[0].scale,[.02,.02,40]);assert(invalid[0].position.every(Number.isFinite));assert.equal(normalizeSceneObjects(Array.from({length:100},()=>({}))).length,64);
const delayed=new SceneComposer(scene,{loadModel:()=>new Promise(resolve=>resolves=resolve)});const stale=makeSceneObject('glb',{url:'/assets/stale.glb'});delayed.sync([stale]);delayed.sync([]);const staleRoot=new THREE.Group();staleRoot.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial()));let disposed=false;staleRoot.children[0].geometry.addEventListener('dispose',()=>disposed=true);resolves({scene:staleRoot,animations:[]});await turn();assert(disposed);assert.equal(delayed.entries.size,0);delayed.dispose();
composer.dispose();assert.equal(scene.children.includes(base),true);disposeObject(base);console.log(`Scene editor: ${scenePresets.length} batched prefabs, ${materialPresets.length} materials, same-scene GLB composition, transforms, annotations, project round-trip, normalization and stale-load disposal passed.`);
