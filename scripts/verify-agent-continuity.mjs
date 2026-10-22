import assert from 'node:assert/strict';
import {createRenderer,h,nextTick,reactive} from 'vue';
import {makeProject} from '../src/workbench/templates.js';
import {createNode} from '../src/workbench/catalog.js';
import {runDesignAgent} from '../src/workbench/agent/runtime.js';
import {prepareAgentTurn,projectFingerprint} from '../src/workbench/agent/state.js';
import {useWorkbench} from '../src/workbench/useWorkbench.js';
import {resolveHeaderConfig} from '../src/workbench/header.js';

const original=makeProject('blank');original.nodes.push(createNode('header'));
const originalState=projectFingerprint(original);
const tool=(id,name,args)=>({id,type:'function',function:{name,arguments:JSON.stringify(args)}});
const response=(content,tool_calls=[])=>({message:{role:'assistant',content,tool_calls},usage:{}});
let createRound=0;
const generated=await runDesignAgent({project:original,prompt:'新建一个完整园区大屏',request:async()=>++createRound===1?response('',[
 tool('context','get_project_context',{}),
 tool('plan','plan_design',{mode:'create',scope:'all',title:'园区大屏',industry:'campus',style:'保留行业布局',objectives:['构建完整园区大屏']}),
 tool('create','create_dashboard',{industry:'campus',name:'连续创作验证'})
]):response('完整大屏已生成。')});
assert(generated.report.passed);assert(generated.project.nodes.length>10);assert.notEqual(generated.project.id,original.id);

// Reproduce the regression: the stored original has only a header, while the
// visible generated draft contains the full screen. Never restart from it.
const turn=prepareAgentTurn({project:original,revision:7,result:reactive(generated),baseRevision:7,selectedIds:[original.nodes[0].id]});
assert(turn.continuing);assert.equal(turn.origin.id,original.id);assert.equal(turn.baseRevision,7);assert.deepEqual(turn.selectedIds,[]);
assert.equal(turn.project.id,generated.project.id);assert.equal(turn.project.nodes.length,generated.project.nodes.length);
const header=turn.project.nodes.find(n=>n.type==='header'),untouched=turn.project.nodes.filter(n=>n.id!==header.id);
let refineRound=0,firstInput;
const refined=await runDesignAgent({project:turn.project,canvasSource:'pending-draft',prompt:'只把标题改为「星屿 · 连续创作」，其他内容保留',request:async(path,input)=>{
 firstInput||=JSON.parse(input.messages[0].content);
 return ++refineRound===1?response('',[
  tool('context-2','get_project_context',{}),
  tool('plan-2','plan_design',{mode:'refine',scope:'all',title:'仅修改标题',industry:'campus',style:'保留全部组件',objectives:['只修改标题']}),
  tool('title','configure_header',{id:header.id,patch:{title:'星屿 · 连续创作'}})
 ]):response('标题已修改，其余组件完整保留。');
}});
assert.equal(firstInput.canvas.source,'pending-draft');assert.equal(firstInput.canvas.componentCount,generated.project.nodes.length);
assert(refined.report.passed);assert.equal(refined.project.id,generated.project.id);assert.equal(refined.project.nodes.length,generated.project.nodes.length);
assert.deepEqual(refined.project.nodes.filter(n=>n.id!==header.id),untouched,'Title refinement must preserve every chart, data source, scene and code workspace');
assert.equal(projectFingerprint(original),originalState,'An unapplied continuation must not mutate the stored original');
assert.equal(resolveHeaderConfig(generated.project.nodes.find(n=>n.id===header.id)).title,resolveHeaderConfig(header).title,'Previous delivery must remain isolated');
const recovered=JSON.parse(JSON.stringify({result:refined,baseProject:originalState}));
assert.equal(prepareAgentTurn({project:original,revision:12,result:recovered.result,baseRevision:12}).project.nodes.length,generated.project.nodes.length);
assert.throws(()=>prepareAgentTurn({project:original,revision:8,result:generated,baseRevision:7}),/原稿已发生变化/);

// The same real transaction used by auto-apply must produce one undo step per
// completed turn, including a new project followed by a title-only refinement.
let workbench;
const renderer=createRenderer({createElement:()=>({}),insert(){},remove(){},createText:()=>({}),createComment:()=>({}),setText(){},setElementText(){},parentNode(){},nextSibling(){},patchProp(){}});
const app=renderer.createApp({setup(){workbench=useWorkbench();return()=>h('div');}});app.mount({});
await new Promise(resolve=>setTimeout(resolve,0));await nextTick();workbench.project.value=JSON.parse(JSON.stringify(original));await nextTick();workbench.record();
await workbench.commitAgentDraft(reactive(generated.project),workbench.revision.value);await nextTick();
const firstApplied=workbench.raw();
const appliedTurn=prepareAgentTurn({project:workbench.project.value,revision:workbench.revision.value,result:generated,applied:true,baseRevision:-1});
assert(!appliedTurn.continuing);assert.equal(appliedTurn.project.id,firstApplied.id);assert.equal(appliedTurn.project.nodes.length,firstApplied.nodes.length);
await workbench.commitAgentDraft(reactive(refined.project),workbench.revision.value);await nextTick();
assert.equal(workbench.project.value.nodes.find(n=>n.id===header.id).props.headerConfig.title,'星屿 · 连续创作');
workbench.undo();await nextTick();assert.equal(projectFingerprint(workbench.raw()),projectFingerprint(firstApplied),'One undo must restore the full first generation');
workbench.redo();await nextTick();assert.deepEqual(workbench.raw().nodes.filter(n=>n.id!==header.id),untouched);
app.unmount();
console.log('Agent continuity: generated-draft refinement, refreshed recovery, original revision anchoring, stale-selection filtering, conflict protection and per-turn apply/undo passed.');
