import assert from 'node:assert/strict';
import {makeProject} from '../src/workbench/templates.js';
import {runDesignAgent} from '../src/workbench/agent/runtime.js';
import {createDesignEngine} from '../src/workbench/agent/engine.js';
import {designChanges,validateAcceptanceChecks} from '../src/workbench/agent/changes.js';
import {finishAgentTurn,projectFingerprint} from '../src/workbench/agent/state.js';
import {resolveHeaderConfig} from '../src/workbench/header.js';

const clone=value=>JSON.parse(JSON.stringify(value));
const plan=(extra={})=>({mode:'refine',scope:'all',title:'精准修改',industry:'campus',style:'保留现有视觉',objectives:['只修改用户指定部分'],...extra});
const call=(name,args)=>({id:crypto.randomUUID(),type:'function',function:{name,arguments:JSON.stringify(args)}});
const response=(calls=[],content='指定修改已完成。')=>({message:{role:'assistant',content,tool_calls:calls},usage:{}});
async function turn(project,prompt,steps,extra={}){
 let round=0;const before=projectFingerprint(project);
 const result=await runDesignAgent({project,prompt,inspect:async()=>({code:{state:'ready',diagnostics:[]},metrics:{renderChecked:true}}),
  request:async(_path,input)=>{assert(input.messages.some(m=>m.role==='user'&&m.content===prompt),'Latest request must be a separate user message');const context=JSON.parse(input.messages[0].content).currentContext;return round<steps.length?response(steps[round++](context),''):response();},...extra});
 assert.equal(projectFingerprint(project),before,'Each turn must leave its source snapshot immutable');return result;
}
function preserved(before,after,changedIds=[]){
 assert.equal(after.id,before.id);assert.deepEqual(after.nodes.map(n=>n.id),before.nodes.map(n=>n.id),'Keep component IDs, order and count');
 assert.deepEqual({...after,nodes:[]},{...before,nodes:[]},'Keep all project settings');
 for(const node of before.nodes)if(!changedIds.includes(node.id))assert.deepEqual(after.nodes.find(n=>n.id===node.id),node,'Untargeted component changed: '+node.name);
}
const generated=await turn(makeProject('blank'),'创建带两台设备的园区大屏',[
 ()=>[call('plan_design',plan({mode:'create'})),call('create_dashboard',{industry:'campus',name:'连续修改回归',theme:'violet'})],
 ctx=>{const id=ctx.components.find(n=>n.type==='scene').id;return [call('configure_header',{id:ctx.components.find(n=>n.type==='header').id,patch:{title:'星港 · 园区总览'}}),call('add_scene_objects',{id,objects:[
  {kind:'model',modelPreset:'pump',name:'循环水泵 A',position:[-10,1,18],material:{preset:'graphite'},label:{title:'循环水泵 A'}},
  {kind:'model',modelPreset:'charger',name:'充电桩 B',position:[10,1,18],material:{preset:'titanium'},label:{title:'充电桩 B'}}
 ]})];}
]);
assert(generated.report.passed);assert.equal(generated.project.nodes.length,15);
const independent=designChanges(makeProject('industry'),generated.project);assert(independent.createdProject);assert.equal(independent.counts.added,15);assert.equal(independent.counts.removed,0,'Creating a separate project must not claim deletion from the previous project');
const headerId=generated.project.nodes.find(n=>n.type==='header').id,metricId=generated.project.nodes.find(n=>n.type==='number').id,sceneId=generated.project.nodes.find(n=>n.type==='scene').id;
const title=await turn(generated.project,'只修改主标题',[
 ()=>[call('plan_design',plan({targetIds:[headerId],checks:[{kind:'title',id:headerId,value:'星港 · 低碳运营中心'}]})),call('configure_header',{id:headerId,patch:{title:'星港 · 低碳运营中心'}})]
]);
preserved(generated.project,title.project,[headerId]);
const oldHeader=clone(generated.project.nodes.find(n=>n.id===headerId)),newHeader=clone(title.project.nodes.find(n=>n.id===headerId));
assert.equal(resolveHeaderConfig(newHeader).title,'星港 · 低碳运营中心');
for(const node of [oldHeader,newHeader]){delete node.props.title;delete node.props.text;delete node.props.headerConfig.title;}
assert.deepEqual(newHeader,oldHeader,'Keep header background, SVG paths and typography');

const metric=await turn(title.project,'只调整一个数字卡片',[
 ()=>[call('plan_design',plan({targetIds:[metricId]})),call('update_widgets',{updates:[{id:metricId,changes:{style:{color:'#22d3ee',fontSize:17},props:{flip:false}}}]})]
]);
preserved(title.project,metric.project,[metricId]);
const expectedMetric=clone(title.project.nodes.find(n=>n.id===metricId));Object.assign(expectedMetric.style,{color:'#22d3ee',fontSize:17});expectedMetric.props.flip=false;
assert.deepEqual(metric.project.nodes.find(n=>n.id===metricId),expectedMetric);

const sceneBefore=metric.project.nodes.find(n=>n.id===sceneId),objectId=sceneBefore.props.sceneObjects[0].id;
const material=await turn(metric.project,'只切换循环水泵 A 材质',[
 ()=>[call('plan_design',plan({targetIds:[sceneId]})),call('update_scene_objects',{id:sceneId,updates:[{objectId,changes:{material:{preset:'glass'}}}]})]
]);
preserved(metric.project,material.project,[sceneId]);
const oldScene=clone(sceneBefore),materialScene=clone(material.project.nodes.find(n=>n.id===sceneId));
assert.equal(materialScene.props.sceneObjects[0].material.preset,'glass');assert.equal(materialScene.props.sceneObjects[0].material.opacity,.48);
delete oldScene.props.sceneObjects[0].material;delete materialScene.props.sceneObjects[0].material;assert.deepEqual(materialScene,oldScene,'Material edits must preserve both objects, transforms, labels, data and the base scene');

const files=[
 {path:'main.js',content:"import frag from './ring.frag.glsl';\nexport function build(THREE){const root=new THREE.Group();const material=new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:frag,transparent:true,uniforms:{uTime:{value:0},uColor:{value:new THREE.Color('#22d3ee')}}});const ring=new THREE.Mesh(new THREE.PlaneGeometry(70,70),material);ring.rotation.x=-Math.PI/2;ring.position.y=1.5;root.add(ring);return {root,update(time){material.uniforms.uTime.value=time;}};}"},
 {path:'ring.frag.glsl',content:'uniform float uTime;uniform vec3 uColor;varying vec2 vUv;void main(){float r=fract(uTime * 0.12);float a=exp(-abs(length(vUv-.5)-r*.5)*50.0);gl_FragColor=vec4(uColor,a);}'},
];
const shader=await turn(material.project,'只叠加已有场景的 GLSL 光环',[
 ()=>[call('plan_design',plan({targetIds:[sceneId]})),call('write_code_files',{id:sceneId,files,mode:'overlay'})],
 ()=>[call('run_code',{id:sceneId})]
]);
assert(shader.report.passed);preserved(material.project,shader.project,[sceneId]);
const sceneWithoutCode=clone(shader.project.nodes.find(n=>n.id===sceneId));delete sceneWithoutCode.props.codeWorkspace;
const materialWithoutCode=clone(material.project.nodes.find(n=>n.id===sceneId));delete materialWithoutCode.props.codeWorkspace;
assert.deepEqual(sceneWithoutCode,materialWithoutCode,'Shader code must not replace the scene or modify models');
const refined=await turn(shader.project,'只改光环颜色和速度',[
 ()=>[call('plan_design',plan({targetIds:[sceneId]})),call('edit_code_file',{id:sceneId,path:'main.js',oldText:'#22d3ee',newText:'#ffb65c'}),call('edit_code_file',{id:sceneId,path:'ring.frag.glsl',oldText:'uTime * 0.12',newText:'uTime * 0.18'})],
 ()=>[call('run_code',{id:sceneId})]
]);
assert(refined.report.passed);preserved(shader.project,refined.project,[sceneId]);
assert.deepEqual(refined.project.nodes.find(n=>n.id===sceneId).props.sceneObjects,sceneBefore.props.sceneObjects.map((o,i)=>i?o:{...o,material:material.project.nodes.find(n=>n.id===sceneId).props.sceneObjects[0].material}));
const workspace=refined.project.nodes.find(n=>n.id===sceneId).props.codeWorkspace;
assert.equal(workspace.mode,'overlay');assert(workspace.files[0].content.includes('#ffb65c'));assert(workspace.files[1].content.includes('uTime * 0.18'));
assert.equal(workspace.files[0].content,files[0].content.replace('#22d3ee','#ffb65c'));assert.equal(workspace.files[1].content,files[1].content.replace('uTime * 0.12','uTime * 0.18'));

// General questions must neither enter a design plan nor mount/evaluate/apply
// a canvas. This also applies when a pending draft conflicts with the canvas.
for(const question of ['你好','17 乘以 23 是多少？','如何学习英语？','你有哪些能力？']){
 let requests=0,drafts=0,checks=0,checkpoints=0;const events=[];
 const reply=await turn(refined.project,question,[],{designError:'原稿已发生变化',history:[{role:'user',content:'上一轮要求修改 Shader'}],
  request:async(_path,input)=>{requests++;assert.equal(input.messages[1].content,question);return response([],question.includes('23')?'391':'直接回答用户问题。');},
  onDraft:()=>drafts++,inspect:()=>checks++,onCheckpoint:()=>checkpoints++,onEvent:e=>events.push(e)});
 assert.equal(reply.kind,'conversation');assert.equal(reply.report,null);assert.equal(reply.performance.toolCalls,0);assert.equal(requests,1);
 assert.equal(drafts+checks+checkpoints,0);assert(!reply.modified);assert(!events.some(e=>['tool-start','evaluation','brief'].includes(e.type)));
 preserved(refined.project,reply.project);
 const pending=finishAgentTurn({continuing:true,origin:makeProject('blank')},reply);assert.equal(pending.kind,'conversation');assert(!pending.modified,'A reply must not turn an existing pending draft into a new auto-apply result');
}
await assert.rejects(()=>turn(refined.project,'只修改标题',[()=>[call('plan_design',plan({targetIds:[headerId]}))]],{designError:'原稿已发生变化'}),/原稿已发生变化/);
for(const checks of [[{kind:'exists',id:headerId,value:null}],[{kind:'exists',value:true}],[{kind:'count',value:0}],[{kind:'count',value:1.5}],[{kind:'title',value:true}],[{kind:'prop',id:headerId,value:'missing key'}]])assert.throws(()=>validateAcceptanceChecks(checks));
validateAcceptanceChecks([{kind:'count',value:15},{kind:'exists',id:headerId,value:true},{kind:'title',value:'园区'},{kind:'prop',id:metricId,key:'flip',value:false}]);
const invalid=createDesignEngine(refined.project,{mode:'auto',contextProvided:true});const rejected=await invalid.execute('plan_design',plan({checks:[{kind:'exists',id:headerId,value:null}]}));assert(!rejected.ok);assert.equal(invalid.mode,'auto');assert(!invalid.brief,'Invalid checks must fail before changing planning state');
const text=refined.project.nodes.find(n=>n.type==='text');const hint=await createDesignEngine(refined.project).execute('update_widgets',{updates:[{id:text.id,changes:{props:{content:'bad alias'}}}]});assert(!hint.ok);assert(hint.error.includes('text'),'Unsupported prop feedback must expose the actual editable fields');
console.log('Agent sequence: create → title → metric → GLB material → overlay GLSL → precise shader edits; immutable untargeted content, zero-tool conversations, draft/conflict boundaries and typed acceptance checks passed.');
