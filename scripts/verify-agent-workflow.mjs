import assert from 'node:assert/strict';
import {createRenderer,h,ref,nextTick,reactive} from 'vue';
import {useDataRuntime} from '../src/workbench/runtime/data.js';
import {validateProject,projectForExport} from '../src/workbench/schema.js';
import {finishAgentTurn} from '../src/workbench/agent/state.js';
import {createDesignEngine} from '../src/workbench/agent/engine.js';
import {runDesignAgent,waitForCode} from '../src/workbench/agent/runtime.js';
import {compactTranscript,boundReceipt} from '../src/workbench/agent/transcript.js';
import {normalizeMessages,modelCompletion} from '../server/agent.js';
import {makeProject} from '../src/workbench/templates.js';
import {resolveHeaderConfig} from '../src/workbench/header.js';
import {makeWorkspace,writeCodeFiles,workspaceDirty} from '../src/workbench/code/workspace.js';

const p=makeProject('campus'),header=p.nodes.find(n=>n.type==='header'),scene=p.nodes.find(n=>n.type==='scene'),metric=p.nodes.find(n=>n.type==='number');
assert.equal(validateProject(reactive(p)).nodes.length,p.nodes.length,'Saved reactive projects must reopen without DataCloneError');assert.equal(projectForExport(reactive(p)).id,p.id);
const plan=(extra={})=>({mode:'refine',scope:'all',title:'局部修改',industry:'campus',style:'保留现有风格',objectives:['只修改目标'],...extra});
const call=(id,name,args)=>({id,type:'function',function:{name,arguments:JSON.stringify(args)}});
const answer=(calls=[],content='已完成。',extra={})=>({message:{role:'assistant',content,tool_calls:calls},usage:{},...extra});
const e=createDesignEngine(p,{mode:'auto'});
assert(!(await e.execute('plan_design',plan())).ok,'A plan must have a real document context');
await e.execute('get_project_context',{});assert((await e.execute('plan_design',plan({targetIds:[header.id],checks:[{kind:'title',id:header.id,value:'精确标题'},{kind:'prop',id:header.id,key:'title',value:'精确标题'}]}))).ok);
const original=e.project,oldScene=original.nodes.find(n=>n.id===scene.id);
assert(!(await e.execute('update_widgets',{updates:[{id:metric.id,changes:{name:'out of scope'}}]})).ok);
assert(!(await e.execute('remove_widgets',{ids:[scene.id]})).ok);
assert((await e.execute('configure_header',{id:header.id,patch:{title:'精确标题'}})).ok);
assert.strictEqual(e.project.nodes.find(n=>n.id===scene.id),oldScene,'Untouched scene must retain identity');
assert.strictEqual(e.project.variables,original.variables,'Unchanged variables must not restart remote queries');
assert.equal(resolveHeaderConfig(original.nodes.find(n=>n.id===header.id)).title,resolveHeaderConfig(header).title,'Published snapshots must remain immutable');
assert(!(await e.execute('plan_design',plan({targetIds:[header.id,scene.id]}))).ok);
assert((await e.execute('evaluate_design',{})).passed);
const changes=await e.execute('get_design_changes',{});assert.equal(changes.counts.updated,1);assert.equal(changes.retained,p.nodes.length-1);

const objects=createDesignEngine(p);await objects.execute('add_scene_objects',{id:scene.id,objects:[{preset:'pump',name:'Pump A'}]});const objectId=objects.project.nodes.find(n=>n.id===scene.id).props.sceneObjects[0].id,before=objects.project;
assert(!(await objects.execute('update_scene_objects',{id:scene.id,updates:[{objectId,changes:{name:'must roll back'}},{objectId:'missing',changes:{name:'bad'}}]})).ok);
assert.strictEqual(objects.project,before);assert.equal(objects.project.nodes.find(n=>n.id===scene.id).props.sceneObjects[0].name,'Pump A');
assert((await objects.execute('update_scene_objects',{id:scene.id,updates:[{objectId,changes:{name:'Pump B'}}]})).ok);assert.equal(before.nodes.find(n=>n.id===scene.id).props.sceneObjects[0].name,'Pump A');
assert.equal((await objects.execute('get_scene_state',{id:scene.id})).objects[0].name,'Pump B');
assert((await objects.execute('remove_scene_objects',{id:scene.id,objectIds:[objectId]})).ok);assert.equal(objects.project.nodes.find(n=>n.id===scene.id).props.sceneObjects.length,0);
assert.equal(objects.project.nodes.filter(n=>n.type==='scene').length,1);

const graph=createDesignEngine(p);await graph.execute('configure_events',{id:metric.id,events:[{on:'click',action:'refresh',target:header.id}]});
const duplicate=await graph.execute('duplicate_widgets',{ids:[metric.id,header.id]});assert(duplicate.ok);const copiedMetric=graph.project.nodes.find(n=>n.id===duplicate.added[0].id);assert.equal(copiedMetric.events[0].target,duplicate.added[1].id);assert.equal(graph.project.nodes.find(n=>n.id===metric.id).events[0].target,header.id);
assert(!(await graph.execute('remove_widgets',{ids:[header.id]})).ok);await graph.execute('get_project_context',{});await graph.execute('plan_design',plan({removeIds:[header.id]}));assert((await graph.execute('remove_widgets',{ids:[header.id]})).ok);assert.equal(graph.project.nodes.find(n=>n.id===metric.id).events.length,0);
const query=await graph.execute('query_widgets',{query:copiedMetric.name,limit:1});assert.equal(query.components.length,1);

let published=0,checkpoints=0,round=0;const batched=await runDesignAgent({project:p,prompt:'修改标题和指标',onDraft:()=>published++,onCheckpoint:()=>checkpoints++,request:async()=>++round===1?answer([
 call('plan','plan_design',plan()),call('a','configure_header',{id:header.id,patch:{title:'合并预览'}}),call('b','update_widgets',{updates:[{id:metric.id,changes:{props:{value:123}}}]}),call('check','evaluate_design',{})
]):answer()});
assert.equal(published,1,'Independent mutations must publish one preview per batch');assert.equal(checkpoints,1);assert.equal(batched.performance.previewUpdates,1);

round=0;const repeat=await runDesignAgent({project:p,prompt:'连续修改',request:async()=>{
 round++;if(round===1)return answer([call('plan','plan_design',plan()),call('same-id','configure_header',{id:header.id,patch:{title:'第一版'}})]);
 if(round===2)return answer([call('same-id','configure_header',{id:header.id,patch:{title:'第二版'}})]);return answer();
}});assert.equal(resolveHeaderConfig(repeat.project.nodes.find(n=>n.id===header.id)).title,'第二版','Reused IDs with different arguments must not replay stale receipts');

round=0;const noop=await runDesignAgent({project:p,prompt:'保留当前名称',request:async()=>++round===1?answer([call('plan','plan_design',plan()),call('same','configure_canvas',{name:p.name})]):answer([], '当前名称已经符合要求。')});assert(noop.noChange&&!noop.modified);assert.equal(noop.performance.previewUpdates,1,'Final inspection mounts the unchanged document once');

round=0;const truncated=await runDesignAgent({project:p,prompt:'改标题',request:async()=>{
 round++;if(round===1)return answer([call('danger','remove_widgets',{ids:p.nodes.slice(1).map(n=>n.id)})],'',{finishReason:'length'});
 if(round===2)return answer([call('plan','plan_design',plan()),call('title','configure_header',{id:header.id,patch:{title:'完整输出'}})]);return answer();
}});assert.equal(truncated.project.nodes.length,p.nodes.length);assert.equal(truncated.performance.toolCalls,2);

const controller=new AbortController();let inspections=0;
const stopped=await runDesignAgent({project:p,prompt:'中断',signal:controller.signal,onDraft:()=>controller.abort(),inspect:()=>{inspections++;throw Error('Do not inspect an aborted canvas')},request:async()=>answer([call('plan','plan_design',plan()),call('title','configure_header',{id:header.id,patch:{title:'中断前保留'}})])}).then(()=>null,error=>error);
assert.equal(stopped.name,'AbortError');assert(stopped.partial?.interrupted);assert.equal(inspections,0);assert.equal(resolveHeaderConfig(stopped.partial.project.nodes.find(n=>n.id===header.id)).title,'中断前保留');

const transcript=[{role:'user',content:'original request'}];for(let i=0;i<20;i++){transcript.push({role:'assistant',content:'',reasoning_details:[{type:'reasoning.encrypted',data:'opaque-'+i}],tool_calls:[call('read-'+i,'get_widget',{id:header.id})]},{role:'tool',tool_call_id:'read-'+i,content:JSON.stringify({ok:true,content:'x'.repeat(5000)})});}
const bounded=boundReceipt({ok:true,components:Array.from({length:50},()=>({rows:Array.from({length:100},()=>({name:'x'.repeat(4000),value:1}))}))});assert(bounded.ok&&bounded.truncated);assert(JSON.stringify(bounded).length<=32000);assert(JSON.parse(JSON.stringify(bounded)).ok);
const compacted=compactTranscript(transcript,{maxChars:18000,maxMessages:12});assert(compacted.length<transcript.length);assert(compacted[0]===transcript[0]);assert.deepEqual(compacted.at(-2),transcript.at(-2));assert(normalizeMessages(compacted).length===compacted.length);

const workspace=makeWorkspace();writeCodeFiles(workspace,[{path:'main.js',content:'export function build(THREE){return new THREE.Group();}'}]);Object.assign(workspace,{activeFiles:workspace.files,activeEntry:'main.js',activeMode:'overlay',activeParameters:{}});assert(!workspaceDirty(workspace));workspace.parameters={speed:2};assert(workspaceDirty(workspace),'Parameter-only edits must be run again');
const oldDocument=globalThis.document,code={dataset:{codeHash:'same-source',codeActivation:'old-run',codeState:'ready'}};globalThis.document={querySelectorAll:()=>[{dataset:{nodeId:'scene'},querySelector:()=>code}]};
try{setTimeout(()=>Object.assign(code.dataset,{codeActivation:'new-run',codeState:'error',codeError:'actual shader failure'}),10);const actual=await waitForCode({codeNodeId:'scene',hash:'same-source',activation:'new-run'});assert.equal(actual.code.state,'error');}finally{if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;}

const resumed=finishAgentTurn({continuing:true,origin:p},{project:repeat.project,noChange:true,modified:false});assert(resumed.modified&&!resumed.noChange,'An unchanged continuation must not discard the already-completed pending draft');assert.equal(resumed.changes.counts.updated,1);
let inspectionsNow=0;round=0;await runDesignAgent({project:p,prompt:'修改并持续检查',inspect:()=>({metrics:{sample:++inspectionsNow}}),request:async()=>{round++;if(round===1)return answer([call('plan','plan_design',plan()),call('title','configure_header',{id:header.id,patch:{title:'持续检查'}}),call('check','inspect_runtime',{})]);if(round===2)return answer([call('check','inspect_runtime',{})]);return answer();}});assert(inspectionsNow>=3,'Actual runtime checks must not replay previous receipts');
const brokenPreview=createDesignEngine(p,{onChange:()=>{throw Error('PREVIEW_FAILED')}});const beforeVersion=brokenPreview.version;assert(!(await brokenPreview.execute('configure_header',{id:header.id,patch:{title:'should roll back'}})).ok);assert.equal(brokenPreview.version,beforeVersion);assert(!brokenPreview.modified);

const oldFetch=globalThis.fetch;try{globalThis.fetch=async()=>new Response('SECRET_PROVIDER_BODY',{status:401});await assert.rejects(()=>modelCompletion({protocol:'openai',key:'TEST',model:'test',baseUrl:'https://example.com'},[],AbortSignal.timeout(1000)),e=>e.status===422&&e.code==='PROVIDER_AUTH'&&!e.message.includes('SECRET_PROVIDER_BODY'));}finally{globalThis.fetch=oldFetch;}
console.log('Agent workflow: immutable incremental previews, scoped plans, acceptance checks, graph-safe tools, batching, exact receipts, no-op delivery, truncation recovery, cancellation checkpoints, bounded transcripts, execution identities and provider errors passed.');

const savedDocument=globalThis.document,savedFetch=globalThis.fetch,pendingRequests=[];let dataRuntime;
globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
globalThis.fetch=(url,options)=>new Promise(resolve=>pendingRequests.push({resolve,signal:options.signal}));
const remote=structuredClone(metric);Object.assign(remote.data,{kind:'http',url:'https://example.com/metrics',path:'',poll:30});const live=ref({...p,nodes:[remote]});
const renderer=createRenderer({createElement:()=>({}),insert(){},remove(){},createText:()=>({}),createComment:()=>({}),setText(){},setElementText(){},parentNode(){},nextSibling(){},patchProp(){}}),app=renderer.createApp({setup(){dataRuntime=useDataRuntime(live,ref(true));return()=>h('div');}});
try{app.mount({});const refresh=dataRuntime.refresh(live.value.nodes[0]);assert.equal(pendingRequests.length,2);pendingRequests[1].resolve(new Response(JSON.stringify([{name:'Latest',value:2}])));await refresh;pendingRequests[0].resolve(new Response(JSON.stringify([{name:'Stale',value:1}])));await new Promise(resolve=>setTimeout(resolve,0));assert.equal(dataRuntime.rows(live.value.nodes[0])[0].name,'Latest','A stale response must never replace the latest refresh');live.value.nodes=[];await nextTick();await new Promise(resolve=>setTimeout(resolve,220));assert(!dataRuntime.status[remote.id],'Removed widgets must release runtime state');}
finally{app.unmount();globalThis.fetch=savedFetch;if(savedDocument===undefined)delete globalThis.document;else globalThis.document=savedDocument;}
console.log('Data runtime: overlapping fetch cancellation, latest-response ordering and removed-component cleanup passed.');
