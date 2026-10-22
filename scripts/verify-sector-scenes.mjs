import assert from 'node:assert/strict';import * as THREE from 'three';import {buildWorld,disposeObject} from '../src/workbench/runtime/world.js';import {makeProject} from '../src/workbench/templates.js';import {themeById} from '../src/workbench/catalog.js';
for(const id of ['city','agriculture','industry','campus']){
 const p=makeProject(id),node=p.nodes.find(n=>n.type==='scene'),scene=new THREE.Scene(),world=await buildWorld(scene,node.props.variant,node.props,themeById(p.theme));
 const rig=world.root.getObjectByName('sector-presentation');assert(rig?.children.length>3,id+': missing sector effects');
 for(const time of [0,1,30,3600]){world.update(time,true);scene.updateMatrixWorld(true);scene.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite));if(o.geometry)assert([...o.geometry.getAttribute('position').array].every(Number.isFinite));});}
 const before=new Map(),instanceBefore=new Map();scene.traverse(o=>{before.set(o.uuid,[...o.matrixWorld.elements]);if(o.isInstancedMesh)instanceBefore.set(o.uuid,[...o.instanceMatrix.array]);});world.update(4000,false);scene.updateMatrixWorld(true);scene.traverse(o=>{assert.deepEqual(o.matrixWorld.elements,before.get(o.uuid),id+': paused scene moved');if(o.isInstancedMesh)assert.deepEqual([...o.instanceMatrix.array],instanceBefore.get(o.uuid),id+': paused fleet moved');});
 assert(world.root.userData.features?.length>=6,id+': missing architectural detail');
 let draws=0,triangles=0;scene.traverse(o=>{if(o.geometry&&(o.isMesh||o.isLine||o.isPoints)){draws++;if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);}});
 const budget={city:65,agriculture:105,industry:120,campus:85}[id];assert(draws<=budget,`${id}: ${draws} draws exceeded ${budget}`);assert(triangles<120000,id+': geometry budget exceeded');
 if(id==='city'){const buildings=world.root.getObjectByName('city-buildings');assert(buildings?.isInstancedMesh&&buildings.count>=310,'City building population regressed');}
 node.props.energy=false;world.update(4000,false);assert(!rig.visible,id+': energy control ignored while paused');
 let meshes=0;scene.traverse(o=>{if(o.isMesh)meshes++});assert(meshes<140,id+': draw batching regressed');assert.equal(world.labels.length,3);assert(world.labels.every(l=>l.region));disposeObject(scene);assert(scene.children.length>0,'Disposal must not mutate hierarchy');
 console.log(`${id}: sector geometry, effect visibility, pause, 1-hour animation and ${meshes} mesh batches / ${draws} draws / ${Math.round(triangles)} triangles passed`);
}
