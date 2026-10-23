import assert from 'node:assert/strict';
import * as THREE from 'three';
import {access} from 'node:fs/promises';
import {SceneEnvironment} from '../src/workbench/scene/environment.js';
import {SceneMaterials} from '../src/workbench/scene/materials.js';
import {normalizeSceneEnvironment,skyPresets,texturePresets} from '../src/workbench/scene/environment-config.js';
import {makeSceneObject} from '../src/workbench/scene/config.js';
import {poiConnection} from '../src/workbench/scene/poi-connection.js';
import {makeProject} from '../src/workbench/templates.js';
import {createDesignEngine} from '../src/workbench/agent/engine.js';
import {validateProject,projectForExport} from '../src/workbench/schema.js';
import {inspectCanvas} from '../src/workbench/agent/runtime.js';

const scene=new THREE.Scene(),base=new THREE.Group(),fallback=new THREE.Texture();scene.add(base);
const pending=[];let allocations=0,disposed=0;
const env=new SceneEnvironment(scene,{}, {fallback,loadTexture:url=>new Promise(resolve=>pending.push({url,resolve})),makeEnvironment:texture=>{allocations++;return {texture,dispose(){disposed++;}};}});
const sunny=env.sync({sky:'sunny'}),cloudy=env.sync({sky:'overcast',rotation:90});
const stale=new THREE.Texture();let staleDisposed=false;stale.addEventListener('dispose',()=>staleDisposed=true);pending[0].resolve(stale);await sunny;assert(staleDisposed);
const cloud=new THREE.Texture();pending[1].resolve(cloud);await cloudy;assert.equal(scene.background,cloud);assert.equal(env.telemetry().renderedSky,'overcast');assert.equal(scene.backgroundRotation.y,Math.PI/2);assert.equal(allocations,1);
const retry=env.sync({sky:'sunny'});await env.sync({sky:'overcast'});pending[2].resolve(new THREE.Texture());await retry;assert.equal(env.telemetry().renderedSky,'overcast');
const final=env.sync({sky:'sunny'});assert.equal(pending.length,4,'A cancelled request must not permanently suppress retry');pending[3].resolve(new THREE.Texture());await final;assert.equal(env.telemetry().renderedSky,'sunny');
const rainy=env.sync({sky:'rainy',rain:.5},{quality:'balanced'});pending[4].resolve(new THREE.Texture());await rainy;
assert.equal(env.rainCount,300);assert.equal(env.rain.geometry.attributes.position.count,600);assert.equal(scene.children.filter(o=>o.name==='environment-rain').length,1);env.update(12);assert.equal(env.rain.material.uniforms.time.value,12);
await env.sync({sky:'none'});assert.equal(scene.environment,fallback);assert.equal(env.rain,null);assert.equal(scene.children.includes(base),true);env.dispose();assert.equal(disposed,3);fallback.dispose();
assert.deepEqual(normalizeSceneEnvironment({sky:'javascript:',brightness:Infinity,rotation:999,fog:-10,rain:3}),{sky:'none',brightness:1,rotation:180,blur:0,fog:0,rain:1});

const ground=makeSceneObject('ground');assert.equal(ground.material.preset,'concrete');assert.equal(ground.label.enabled,false);assert.deepEqual(ground.material.textureRepeat,[16,16]);
const library=new SceneMaterials(),a=library.acquire(ground.material),b=library.acquire(ground.material);assert.equal(a.material,b.material);assert.deepEqual(a.material.map.repeat.toArray(),[16,16]);a.release();assert.equal(library.materials.size,1);b.release();assert.equal(library.materials.size,0);
const water=makeSceneObject('ground',{material:{preset:'water'}}),lease=library.acquire(water.material);assert.equal(lease.material.customProgramCacheKey(),'astra-water-v3');lease.release();library.dispose();assert.equal(library.sources.size,0);
for(const source of [...skyPresets,...texturePresets])if(source.url){await access('public'+source.url);if(source.normal)await access('public'+source.normal);}

for(const x of [100,700]){const line=poiConnection({x,y:350,width:90},{x:400,y:100,width:280,height:360});assert(line&&!line.path.includes('NaN'));assert.equal(line.end.y,182);assert.equal(line.end.x,x===100?400:680);}
assert.equal(poiConnection({x:450,y:150},{x:400,y:100,width:280,height:360}),null);assert.equal(poiConnection({x:NaN,y:0},{x:0,y:0,width:1,height:1}),null);

const project=makeProject('industry'),node=project.nodes.find(n=>n.type==='scene'),others=JSON.stringify(project.nodes.filter(n=>n.id!==node.id));
const engine=createDesignEngine(project,{contextProvided:true,mode:'refine'});
const plan=await engine.execute('plan_design',{mode:'refine',scope:'all',title:'补充场景环境',industry:'industry',style:'保留原有组件',objectives:['仅调整场景的天空、地面与模型'],targetIds:[node.id]});assert(plan.ok);
for(const patch of [{sky:'rainy',brightness:.8},{rotation:45}])assert((await engine.execute('update_widgets',{updates:[{id:node.id,changes:{props:{sceneEnvironment:patch}}}]})).ok);
assert.equal(engine.project.nodes.find(n=>n.id===node.id).props.sceneEnvironment.brightness,.8,'Environment edits must merge incrementally');
const added=await engine.execute('add_scene_objects',{id:node.id,objects:[{preset:'ground',material:{preset:'tile',textureRepeat:[10,8]}},{kind:'model',modelPreset:'car'},{kind:'model',modelPreset:'person'}]});assert(added.ok);
const current=engine.project.nodes.find(n=>n.id===node.id),floor=current.props.sceneObjects[0];assert.equal(floor.material.texture,'tile');assert.deepEqual(floor.material.textureRepeat,[10,8]);
assert((await engine.execute('update_scene_objects',{id:node.id,updates:[{objectId:floor.id,changes:{material:{preset:'water'}}}]})).ok);
assert.equal(engine.project.nodes.find(n=>n.id===node.id).props.sceneObjects[0].material.texture,'none','Water must not inherit the previous tile texture');assert.deepEqual(engine.project.nodes.find(n=>n.id===node.id).props.sceneObjects[0].material.textureRepeat,[10,8],'Material changes preserve UV scale');
assert.equal(JSON.stringify(engine.project.nodes.filter(n=>n.id!==node.id)),others,'Untargeted components must remain identical');
const exported=validateProject(projectForExport(engine.project)),saved=exported.nodes.find(n=>n.id===node.id);assert.equal(saved.props.sceneEnvironment.rotation,45);assert.equal(saved.props.sceneObjects.length,3);

function runtime(renderedSky,state,textureReady=true){const canvas={width:800,height:600,dataset:{sceneEnvironment:JSON.stringify({renderedSky,state}),sceneObjectMaterials:JSON.stringify(saved.props.sceneObjects.map(o=>({id:o.id,loaded:true,preset:o.material.preset,color:o.material.color,textureReady})))}};const el={dataset:{nodeId:node.id},querySelectorAll:s=>s==='canvas'?[canvas]:[],querySelector:s=>s==='.aw-spatial canvas'?canvas:null};return {querySelectorAll:()=>[el]};}
assert(inspectCanvas(exported,runtime('sunny','loading'),{ids:[node.id]}).issues.some(i=>i.code==='render-pending'));
assert(inspectCanvas(exported,runtime('rainy','error'),{ids:[node.id]}).issues.some(i=>i.code==='scene-error'));
assert(inspectCanvas(exported,runtime('rainy','ready',false),{ids:[node.id]}).issues.some(i=>i.code==='render-pending'));
assert.equal(inspectCanvas(exported,runtime('rainy','ready'),{ids:[node.id]}).issues.length,0);
assert.equal(poiConnection({x:500,y:600,height:30},{x:400,y:100,width:280,height:360}).end.y,460);assert.equal(poiConnection({x:500,y:50,height:30},{x:400,y:100,width:280,height:360}).end.y,100);
console.log('Scene environments: stale-load cancellation/retry, sky caching, GPU rain, resource ownership, shared materials, texture configuration, POI connector geometry, agent incremental edits, unchanged components, project round-trip and actual render feedback passed.');
