import * as THREE from 'three';
import assert from 'node:assert/strict';
import {buildAgriculture} from '../src/demos/scenes/agriculture.js';
import {buildPark} from '../src/demos/scenes/park.js';
import {buildIndustry} from '../src/demos/scenes/industry.js';
for(const [name,build,isolatedLayer] of [['agriculture',buildAgriculture,'infrastructure'],['industry',buildIndustry,'utilities'],['park',buildPark,'energy']]){
 const scene=new THREE.Scene(),model=build(scene);
 for(const t of [0,1,30,3600]){
  model.update(t,true);scene.updateMatrixWorld(true);
  scene.traverse(o=>assert(o.matrixWorld.elements.every(Number.isFinite),`${name}: nonfinite transform`));
 }
 const before=new Map();scene.traverse(o=>before.set(o.uuid,[...o.matrixWorld.elements]));
 model.update(4000,false);scene.updateMatrixWorld(true);
 scene.traverse(o=>assert.deepEqual(o.matrixWorld.elements,before.get(o.uuid),`${name}: pause changed transform`));
 let meshes=0,instances=0,vertices=0;
 scene.traverse(o=>{
  if(o.isMesh)meshes++;
  if(o.isInstancedMesh){instances+=o.count;assert(o.count<=o.instanceMatrix.count)}
  if(o.geometry){const position=o.geometry.getAttribute('position');vertices+=position.count;assert([...position.array].every(Number.isFinite),'Invalid vertex');}
 });
 assert.equal(model.labels.length,3);assert(meshes>10&&meshes<150,`${name}: mesh batching regressed`);assert(vertices>1000);
 if(name==='agriculture')assert.equal(instances,1134);
 model.setLayer(isolatedLayer);let hidden=0;scene.traverse(o=>{if(!o.visible)hidden++});assert(hidden>0,'Layer switch did not hide objects');
 model.setLayer('all');scene.traverse(o=>assert(o.visible,'All-layers mode failed to restore an object'));
 const size=new THREE.Box3().setFromObject(model.root).getSize(new THREE.Vector3());assert(size.x>30&&size.x<40&&size.z>24&&size.z<30,'Unexpected scene bounds');
 console.log(`${name}: passed | ${meshes} mesh batches, ${instances} instances | geometry, pause, layers, long-running animation`);
}
