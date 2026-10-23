import {replyLanguage} from './language.js';
import {themeById} from '../catalog.js';
import {readAgentStream} from './stream.js';
import {createDesignEngine,evaluateProject,projectContext,redactForModel} from './engine.js';
import {agentTools,readOnlyTools} from './contracts.js';
import {compactTranscript,callIdentity,boundReceipt} from './transcript.js';

export async function agentRequest(path,body,signal,options={}){
 const deadline=AbortSignal.timeout(65000),combined=signal?AbortSignal.any([signal,deadline]):deadline;
 let r;try{r=await fetch('/api/agent/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{}),signal:combined});}catch(e){if(deadline.aborted&&!signal?.aborted)throw Object.assign(Error('模型响应超时，可继续完成已保留的草稿'),{code:'REQUEST_TIMEOUT',status:504});throw e;}
 if(r.ok&&r.headers.get('content-type')?.includes('text/event-stream'))return readAgentStream(r,{...options,signal:combined});
 let data;try{data=await r.json()}catch{throw Error('智能体接口不可用，请使用完整服务版');}
 if(!r.ok)throw Object.assign(Error(data.error||'智能体请求失败'),{status:r.status,code:data.code,retryAfter:data.retryAfter});
 return data;
}
const sleep=(ms,signal)=>new Promise((resolve,reject)=>{if(signal?.aborted)return reject(new DOMException('Aborted','AbortError'));const done=()=>{signal?.removeEventListener('abort',abort);resolve();},timer=setTimeout(done,ms),abort=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));};signal?.addEventListener('abort',abort,{once:true});});

export function inspectCanvas(project,root=document.querySelector('.aw-canvas-viewport'),{ids}={}){
 const issues=[],scenes=[],widgets=[],byId=new Map(project.nodes.map(n=>[n.id,n])),wanted=ids?.length?new Set(ids):null;
 if(!root)return {issues:[{code:'preview-unavailable',severity:'error',message:'预览画布尚未就绪，请等待画布加载后继续'}],metrics:{renderChecked:false},widgets};
 for(const el of root.querySelectorAll('[data-node-id]')){
  const node=byId.get(el.dataset.nodeId);if(!node?.visible||wanted&&!wanted.has(node.id))continue;
  for(const text of el.querySelectorAll('.aw-panel-title strong,.aw-number-caption,.aw-text'))if(text.clientWidth>0&&text.scrollWidth>text.clientWidth+4)issues.push({code:'text-overflow',severity:'warning',nodeId:node.id,message:node.name+' 的文字可能截断，请减少字数或字号'});
  const data=el.querySelector('[data-data-state]'),code=el.querySelector('[data-code-state]'),state=el.querySelector('.aw-scene-state');
  const item={nodeId:node.id,name:node.name,type:node.type,data:{state:data?.dataset.dataState||'unknown',rows:Number(data?.dataset.rowCount||0)}};
  for(const [key,attribute] of [['fields','dataFields'],['sample','dataSample']])try{item.data[key]=JSON.parse(data?.dataset[attribute]||'[]')}catch{}
  const error=el.querySelector('.aw-data-error');if(error)issues.push({severity:'warning',code:'data-runtime',nodeId:node.id,message:node.name+'：'+error.textContent.slice(0,180)});
  if(code){item.code={state:code.dataset.codeState,activation:code.dataset.codeActivation};if(code.dataset.codeState==='error')issues.push({severity:'error',code:'code-runtime',nodeId:node.id,message:node.name+'：'+(code.dataset.codeError||'代码运行失败').slice(0,1800)});}
  if(['scene','globe','model'].includes(node.type)&&!el.querySelector('.aw-spatial canvas')){item.pending=true;issues.push({code:'render-pending',severity:'error',nodeId:node.id,message:node.name+' 的三维画布尚未就绪，请等待实际渲染后检查'});}
  if(state){const failed=/失败|错误|丢失|无法/.test(state.textContent);item.pending=!failed;issues.push({severity:'error',code:failed?'scene-error':'render-pending',nodeId:node.id,message:node.name+'：'+state.textContent.trim().slice(0,160)});}
  if(code?.dataset.codeState==='building'){item.pending=true;issues.push({severity:'error',code:'render-pending',nodeId:node.id,message:node.name+' 的代码正在编译，请等待实际运行结果'});}
  for(const canvas of el.querySelectorAll('canvas')){
   if(canvas.dataset.sceneEnvironment){try{item.environment=JSON.parse(canvas.dataset.sceneEnvironment);if(node.props.sceneEnvironment?.sky&&item.environment.renderedSky!==node.props.sceneEnvironment.sky||item.environment.state==='error'){issues.push({code:item.environment.state==='error'?'scene-error':'render-pending',severity:'error',nodeId:node.id,message:node.name+' 的天空环境尚未正确加载'});item.pending=item.environment.state!=='error';}}catch{}}
   if(canvas.dataset.sceneObjectMaterials){try{item.sceneObjects=JSON.parse(canvas.dataset.sceneObjectMaterials);for(const config of node.props.sceneObjects||[]){if(!config.visible)continue;const actual=item.sceneObjects.find(o=>o.id===config.id);if(!actual?.loaded||!actual.textureReady||actual.error){issues.push({code:actual?.error?'scene-error':'render-pending',severity:'error',nodeId:node.id,message:node.name+' 的 '+config.name+' 模型或纹理尚未就绪'+(actual?.error?'：'+actual.error:'')});item.pending=!actual?.error;}else if(config.material.preset!=='original'&&(actual.preset!==config.material.preset||actual.color.toLowerCase()!==config.material.color.toLowerCase()))issues.push({code:'appearance-mismatch',severity:'error',nodeId:node.id,message:config.name+' 的实际模型材质与配置不一致'});}}catch{}}
   if(canvas.dataset.sceneAppearance){try{item.appearance=JSON.parse(canvas.dataset.sceneAppearance);if(node.type==='globe'&&item.appearance.source==='builtin'){const expected=node.props.surfaceColor||node.style.accent||'#092b3c';if(item.appearance.surfaceColor?.toLowerCase()!==expected.toLowerCase())issues.push({code:'appearance-mismatch',severity:'error',nodeId:node.id,message:node.name+' 的实际球面颜色与配置不一致，请等待渲染或修正实际材质，不得仅修改装饰强调色'});const expectedAccent=node.style.accent||themeById(project.theme).accent;if(item.appearance.accent?.toLowerCase()!==expectedAccent.toLowerCase())issues.push({code:'appearance-mismatch',severity:'error',nodeId:node.id,message:node.name+' 的实际轮廓颜色尚未同步'});}}catch{}}
   if(!canvas.width||!canvas.height)issues.push({code:'canvas-size',severity:'warning',nodeId:node.id,message:node.name+' 画布尚未准备好'});
   if(canvas.dataset.fps){const fps=Number(canvas.dataset.fps),drawCalls=Number(canvas.dataset.drawCalls||0),triangles=Number(canvas.dataset.triangles||0);scenes.push({nodeId:node.id,fps,drawCalls,triangles,frameCpuMs:Number(canvas.dataset.frameCpuMs||0)});if(fps>0&&fps<24)issues.push({code:'fps',severity:'warning',nodeId:node.id,message:node.name+' 实测帧率较低，建议降低阴影和模型复杂度'});}
  }
  widgets.push(item);
 }
 const expected=project.nodes.filter(n=>n.visible&&(!wanted||wanted.has(n.id)));
 for(const n of expected)if(!widgets.some(w=>w.nodeId===n.id))issues.push({code:'render-pending',severity:'error',nodeId:n.id,message:n.name+' 尚未挂载到实际画布'});
 return {issues,widgets,metrics:{sceneTelemetry:scenes,renderChecked:true,mounted:widgets.length,expected:expected.length,measuredAt:Date.now()}};
}
export async function inspectRuntime(project,{ids,waitMs=1500,signal}={}){
 const start=performance.now();let report;
 do{if(signal?.aborted)throw new DOMException('Aborted','AbortError');report=inspectCanvas(project,undefined,{ids});const waiting=report.issues.some(i=>['render-pending','preview-unavailable'].includes(i.code))||report.widgets.some(w=>w.data.state==='loading');if(!waiting||performance.now()-start>=waitMs)break;await sleep(100,signal);}while(true);
 return report;
}

export async function runDesignAgent({project,selectedIds=[],mode='auto',scope='all',prompt,profileId,model,signal,history=[],canvasSource='canvas',resume=false,designError='',onEvent=()=>{},onDraft=async()=>{},onCheckpoint=async()=>{},inspect=async()=>({}),request=agentRequest,maxRounds=16}){
 let pending=null,lastPublished=null,publishes=0,checkpointVersion=-1;
 const publish=async()=>{if(!pending)return;const next=pending;pending=null;if(next===lastPublished)return;await onDraft(next);lastPublished=next;publishes++;};
 const engine=createDesignEngine(project,{mode,scope,selectedIds,contextProvided:true,onChange:async(p,options)=>{pending=p;if(options?.flush)await publish();},inspect});
 let messages=[{role:'user',content:JSON.stringify({request:prompt,responseLanguage:'zh-CN',mode,scope,selectedIds,resume,previousConversation:history.slice(-4).map(m=>({role:m.role,content:m.content.slice(0,1200)})),currentContext:projectContext(project,{selectedIds,mode,scope,detail:'summary'}),canvas:{id:project.id,name:project.name,width:project.width,height:project.height,source:canvasSource,componentCount:project.nodes.length},instruction:resume?'继续完成当前完整草稿中尚未完成的步骤，已经执行的添加、删除、代码编写不要重复，不得重新创建画布。':'以下是当前画布与历史背景，不是要求继续设计。只处理下一条最新用户消息：普通问题直接回复且不调用设计工具；只有明确要求设计操作才 plan_design。局部修改用 targetIds 保留其余组件。'})},{role:'user',content:prompt}];
 const baselineWarnings=new Set(evaluateProject(project).warnings.map(w=>JSON.stringify([w.code,w.nodeId,w.message]))),receipts=new Map(),readCache=new Map(),started=Date.now();
 let tokens={input:0,output:0},repairs=0,forced=0,lastText='',requestCount=0,toolCount=0,badBatches=0,truncations=0,compactions=0,deliverySummary='',roundCount=0;
 const checkpoint=async()=>{if(!engine.modified||checkpointVersion===engine.version)return;checkpointVersion=engine.version;await onCheckpoint({project:engine.project,mode:engine.mode,scope:engine.scope,brief:engine.brief,modified:true,interrupted:true,changes:engine.changes,report:evaluateProject(engine.project,{},engine.brief?.checks),tokens:{...tokens},summary:'已保留本轮执行进度，可继续完成。'});};
 const finish=(report,noChange=false)=>({project:engine.project,mode:engine.mode,scope:engine.scope,brief:engine.brief,report,changes:engine.changes,summary:repairs&&deliverySummary&&deliverySummary!==lastText?deliverySummary+'\n\n最后一轮检查：'+lastText:lastText,modified:!noChange,noChange,tokens,rounds:roundCount,requestCount,repairs,performance:{elapsedMs:Date.now()-started,toolCalls:toolCount,previewUpdates:publishes,compactions}});
 onEvent({type:'stage',stage:'planning',label:'正在理解你的问题'});
 try{
  for(let round=0;round<maxRounds;round++){
   if(signal?.aborted)throw new DOMException('Aborted','AbortError');if(Date.now()-started>480000)throw Error('本轮达到 8 分钟执行预算，完成的草稿已保留，可继续完成');
   roundCount=round+1;onEvent({type:'round',round:roundCount,maxRounds});const first=JSON.parse(messages[0].content);first.currentContext=projectContext(engine.project,{selectedIds,mode:engine.mode,scope:engine.scope,brief:engine.brief,detail:'summary',version:engine.version});messages[0]={...messages[0],content:JSON.stringify(first)};
   const compacted=compactTranscript(messages);if(compacted!==messages){messages=compacted;compactions++;onEvent({type:'notice',message:'已整理较早的执行记录，源代码和完整草稿继续保留'});}
   const finalOnly=!!engine.brief&&!!engine.report?.passed&&!(repairs<2&&engine.report.warnings.some(w=>!baselineWarnings.has(JSON.stringify([w.code,w.nodeId,w.message]))&&['bounds','overlap','field','text-overflow','title','fps','asset','scene-error','unit-mismatch'].includes(w.code)));let response;for(let attempt=0;attempt<2;attempt++){try{requestCount++;response=await request('chat',{profileId,model,messages,stream:true,finalOnly,replyLanguage:replyLanguage(prompt)},signal,{onDelta:text=>{if(!engine.brief||finalOnly)onEvent({type:'text-delta',text});},onReset:()=>onEvent({type:'text-reset'})});break;}catch(e){onEvent({type:'text-reset'});if(signal?.aborted||attempt||![429,502,503,504].includes(e.status)||e.code&&['PROVIDER_AUTH','PROVIDER_MODEL','PROVIDER_RESPONSE_TOO_LARGE','REPLY_LANGUAGE'].includes(e.code))throw e;onEvent({type:'notice',message:'模型接口暂时繁忙，正在重试…'});await sleep(Math.min(5000,Math.max(1000,Number(e.retryAfter||1.5)*1000)),signal);}}
   requestCount+=Math.max(0,(response.providerRequests||1)-1);tokens.input+=response.usage?.input_tokens||0;tokens.output+=response.usage?.output_tokens||0;onEvent({type:'usage',tokens:{...tokens},model:response.model||model});
   if(['length','max_tokens'].includes(response.finishReason)){if(++truncations>2)throw Error('模型连续输出过长，草稿已保留。请缩小这一步的修改范围后继续。');onEvent({type:'notice',message:'模型输出被截断，正在要求拆分为更小的文件或修改'});messages.push({role:'user',content:'上轮输出被长度限制截断，工具未执行。请将代码拆成更小文件，减少单次输出后重试。'});continue;}
   const message=response.message;if(!message)throw Error('模型没有返回可执行结果');const calls=message.tool_calls||[];
   const invalid=calls.length>20||new Set(calls.map(c=>c.id)).size!==calls.length||calls.some(c=>!agentTools.some(t=>t.function.name===c.function?.name)||String(c.function?.arguments||'').length>80000);
   if(invalid){if(++badBatches>2)throw Error('模型连续返回无效工具调用，已保留草稿，可更换支持工具的模型后继续');messages.push({role:'user',content:'上轮包含未知工具、重复 ID 或超长参数，整批工具未执行。请使用已注册工具、唯一调用 ID，并拆分大型源码。'});continue;}
   for(const call of calls)if(!call.id)call.id='tool-'+crypto.randomUUID();
   messages.push({...message,...(!calls.length?{tool_calls:undefined}:{})});
   lastText=message.content||'';if(message.content){onEvent({type:'assistant',content:message.content});}
   if(calls.length){
    onEvent({type:'text-reset'});
    if(designError&&calls.some(c=>!readOnlyTools.has(c.function.name)))throw Object.assign(Error(designError),{code:'DESIGN_CONFLICT'});
    onEvent({type:'stage',stage:'executing',label:'执行设计器工具'});
    for(const call of calls){
     if(signal?.aborted)throw new DOMException('Aborted','AbortError');if(++toolCount>96)throw Error('本轮达到 96 次工具执行预算，完成的草稿已保留，可继续完成');
     const name=call.function.name,start=performance.now(),id=(round+1)+':'+call.id;let args,result;
     try{args=JSON.parse(call.function.arguments||'{}')}catch{args={};result={ok:false,error:'参数必须为合法 JSON，请修正后重试'};}
     onEvent({type:'tool-start',id,name,args:redactForModel(args)});
     const identity=callIdentity(call,args),readKey=engine.version+'|'+JSON.stringify(engine.brief)+'|'+identity,receiptKey=readOnlyTools.has(name)?readKey:call.id+'|'+identity,cacheable=readOnlyTools.has(name)&&!['evaluate_design','inspect_runtime'].includes(name);
     const dynamic=['evaluate_design','inspect_runtime'].includes(name);
     if(!result){if(!dynamic&&receipts.has(receiptKey))result={...receipts.get(receiptKey),replayed:true};else if(cacheable&&readCache.has(readKey))result={...readCache.get(readKey),cached:true};else{if(name==='evaluate_design')onEvent({type:'stage',stage:'evaluating',label:'核对变更与实际运行状态'});result=await engine.execute(name,args);}}
     if(name==='plan_design'&&result.ok)onEvent({type:'brief',brief:engine.brief});if(name==='evaluate_design'&&result.ok)onEvent({type:'evaluation',report:result});
     const safeResult=boundReceipt(redactForModel(result,0,name==='read_code_file'?16000:4000));if(result.ok){if(!dynamic)receipts.set(receiptKey,safeResult);if(cacheable)readCache.set(readKey,safeResult);}onEvent({type:'tool-result',id,name,ok:result.ok,result:safeResult,duration:Math.round(performance.now()-start)});messages.push({role:'tool',tool_call_id:call.id,content:JSON.stringify(safeResult)});
    }
    await publish();await checkpoint();continue;
   }
   if(!engine.brief&&!engine.modified&&lastText.trim()){onEvent({type:'stage',stage:'complete',label:'已回复，画布保持不变'});return {...finish(null,true),kind:'conversation'};}
   const verifiedNoop=engine.mode==='refine'&&engine.report?.passed&&engine.brief?.checks?.length>0;
   if(!engine.modified&&!engine.noops&&!verifiedNoop){if(++forced>1)throw Error('模型尚未执行实际设计修改，已有作品保持不变');messages.push({role:'user',content:'请实际使用工具完成要求，不能只提供建议。若目标已经满足，可执行对应修改工具确认无需变更。'});continue;}
   let report=engine.report;if(!report||Date.now()-report.checkedAt>2500){onEvent({type:'stage',stage:'evaluating',label:'检查交付质量'});report=await engine.execute('evaluate_design',{});onEvent({type:'evaluation',report});}
   if(!deliverySummary)deliverySummary=lastText;
   const actionable=report.errors.length||report.warnings.some(w=>!baselineWarnings.has(JSON.stringify([w.code,w.nodeId,w.message]))&&['bounds','overlap','field','text-overflow','title','fps','asset','scene-error','unit-mismatch'].includes(w.code));
   if(actionable&&repairs<2){onEvent({type:'text-reset'});repairs++;onEvent({type:'stage',stage:'repairing',label:'根据反馈修正 · '+repairs+'/2'});messages.push({role:'user',content:'请修复本次新增问题后再次 evaluate_design。尊重 targetIds、锁定对象与保留约束；渲染仍在加载时先 inspect_runtime，不要删除组件规避问题。最终说明汇总本轮全部已完成内容。'+JSON.stringify(report)});continue;}
   await publish();onEvent({type:'stage',stage:'complete',label:report.errors.length?'草稿已保留，仍有问题待修正':engine.modified?'检查完成，准备自动应用':'目标已经满足，无需修改'});return finish(report,!engine.modified);
  }
  throw Error('本轮达到模型调用预算，完成的草稿已保留，可继续完成');
 }catch(error){
  if(engine.modified){try{await publish()}catch{}let report=evaluateProject(engine.project,{},engine.brief?.checks);if(!signal?.aborted)try{report=await engine.execute('evaluate_design',{})}catch{}onEvent({type:'evaluation',report});error.partial={...finish(report),interrupted:true,summary:signal?.aborted?'已停止，完成的部分已保留':error.message};await onCheckpoint(error.partial);}
  throw error;
 }
}

export async function waitForCode({codeNodeId,hash,activation},signal){
 const start=performance.now();while(performance.now()-start<14000){if(signal?.aborted)throw new DOMException('Aborted','AbortError');const node=[...document.querySelectorAll('[data-node-id]')].find(el=>el.dataset.nodeId===codeNodeId),el=node?.querySelector('[data-code-state]');if(el?.dataset.codeHash===hash&&(!activation||el.dataset.codeActivation===activation)){if(el.dataset.codeState==='error')return {code:{state:'error',message:el.dataset.codeError}};if(el.dataset.codeState==='ready'){let stats={};try{stats=JSON.parse(el.dataset.codeStats||'{}')}catch{}return {code:{state:'ready',stats,diagnostics:[]}};}}await sleep(80,signal);}return {code:{state:'error',message:'等待本次代码实际运行超时，请减少构建复杂度后重试'}};
}
