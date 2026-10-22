import {createDesignEngine,projectContext,redactForModel} from './engine.js';
import {agentTools} from './contracts.js';
export async function agentRequest(path,body,signal){const r=await fetch('/api/agent/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{}),signal});let data;try{data=await r.json()}catch{throw Error('智能体接口不可用，请使用已部署 Worker 的完整服务版');}if(!r.ok){const e=new Error(data.error||'智能体请求失败');e.status=r.status;e.code=data.code;throw e;}return data;}
export function inspectCanvas(project,root=document.querySelector('.aw-canvas-viewport')){
 const issues=[],scenes=[],byId=new Map(project.nodes.map(n=>[n.id,n]));
 for(const el of root?.querySelectorAll('[data-node-id]')||[]){const node=byId.get(el.dataset.nodeId);if(!node?.visible)continue;
 for(const text of el.querySelectorAll('.aw-panel-title strong,.aw-number-caption,.aw-text'))if(text.clientWidth>0&&text.scrollWidth>text.clientWidth+4)issues.push({code:'text-overflow',severity:'warning',nodeId:node.id,message:node.name+' 的文字可能截断，请减少字数或字号'});
 const error=el.querySelector('.aw-data-error');if(error)issues.push({severity:'warning',code:'data-runtime',nodeId:node.id,message:node.name+'：'+error.textContent.slice(0,160)});
 const state=el.querySelector('.aw-scene-state');if(state){const failed=state.textContent.includes('失败')||state.textContent.includes('错误');issues.push({severity:failed?'error':'warning',code:failed?'scene-error':'scene-loading',nodeId:node.id,message:node.name+'：'+state.textContent.trim().slice(0,160)});}
 for(const canvas of el.querySelectorAll('canvas')){if(!canvas.width||!canvas.height)issues.push({code:'canvas-size',severity:'warning',nodeId:node.id,message:node.name+' 画布尚未准备好'});if(canvas.dataset.fps){const fps=Number(canvas.dataset.fps),drawCalls=Number(canvas.dataset.drawCalls||0),triangles=Number(canvas.dataset.triangles||0);scenes.push({nodeId:node.id,fps,drawCalls,triangles});if(fps>0&&fps<24)issues.push({code:'fps',severity:'warning',nodeId:node.id,message:node.name+' 实测帧率较低，建议降低阴影和模型复杂度'});}}
 }
 return {issues,metrics:{sceneTelemetry:scenes,renderChecked:!!root,measuredAt:Date.now()}};
}
const sleep=(ms,signal)=>new Promise((resolve,reject)=>{if(signal?.aborted)return reject(new DOMException('Aborted','AbortError'));const done=()=>{signal?.removeEventListener('abort',abort);resolve();},timer=setTimeout(done,ms),abort=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));};signal?.addEventListener('abort',abort,{once:true});});
export async function runDesignAgent({project,selectedIds,mode='refine',scope='all',prompt,profileId,model,signal,history=[],onEvent=()=>{},onDraft=async()=>{},inspect=async()=>({}),request=agentRequest,maxRounds=16}){
 const engine=createDesignEngine(project,{mode,scope,selectedIds,onChange:async p=>{await onDraft(p);},inspect});const messages=[{role:'user',content:JSON.stringify({request:prompt,mode,scope,selectedIds,previousConversation:history.slice(-4).map(m=>({role:m.role,content:m.content.slice(0,1500)})),canvas:{id:project.id,name:project.name,width:project.width,height:project.height},instruction:'先调用 get_project_context 获取实际组件 ID 与能力清单'})}];
 let tokens={input:0,output:0},repairs=0,forced=0,lastText='',requestCount=0;const receipts=new Map(),started=Date.now();
 onEvent({type:'stage',stage:'planning',label:'理解需求与设计规划'});
 try{for(let round=0;round<maxRounds;round++){
 if(signal?.aborted)throw new DOMException('Aborted','AbortError');if(Date.now()-started>480000)throw Error('本轮已达到 8 分钟执行预算，已保留完成的草稿');
 onEvent({type:'round',round:round+1,maxRounds});let response;
 for(let attempt=0;attempt<2;attempt++){try{requestCount++;response=await request('chat',{profileId,model,messages},signal);break;}catch(e){if(signal?.aborted||attempt||![429,502,503,504].includes(e.status))throw e;onEvent({type:'notice',message:'模型接口暂时繁忙，正在重试这一轮…'});await sleep(1500,signal);}}
 tokens.input+=response.usage?.input_tokens||0;tokens.output+=response.usage?.output_tokens||0;onEvent({type:'usage',tokens:{...tokens},model:response.model||model});
 const message=response.message;if(!message)throw Error('模型没有返回可执行结果');const calls=message.tool_calls||[];messages.push({...message,...(!calls.length?{tool_calls:undefined}:{})});if(message.content){lastText=message.content;onEvent({type:'assistant',content:message.content});}
 if(calls.length){if(calls.length>20)throw Error('模型单轮工具调用过多');onEvent({type:'stage',stage:'executing',label:'执行设计器工具'});
 for(const call of calls){if(signal?.aborted)throw new DOMException('Aborted','AbortError');const name=call.function?.name;if(!agentTools.some(t=>t.function.name===name))throw Error('模型调用了未注册工具');const start=performance.now();let args,result;
 try{args=JSON.parse(call.function.arguments||'{}');}catch{args={};result={ok:false,error:'参数必须为合法 JSON，请修正后重试'};}
 const id=call.id||'tool-'+crypto.randomUUID();if(!call.id)call.id=id;
 onEvent({type:'tool-start',id,name,args:redactForModel(args)});
 if(receipts.has(id))result=receipts.get(id);else{if(name==='evaluate_design')onEvent({type:'stage',stage:'evaluating',label:'评估布局、数据与运行状态'});result=result||await engine.execute(name,args);receipts.set(id,result);}
 if(name==='plan_design'&&result.ok)onEvent({type:'brief',brief:engine.brief});if(name==='evaluate_design'&&result.ok)onEvent({type:'evaluation',report:result});
 onEvent({type:'tool-result',id,name,ok:result.ok,result:redactForModel(result),duration:Math.round(performance.now()-start)});messages.push({role:'tool',tool_call_id:id,content:JSON.stringify(redactForModel(result))});
 }
 continue;
 }
 if(!engine.modified){if(++forced>1)throw Error('模型没有执行有效设计修改。可换一个支持工具调用的模型后重试。');messages.push({role:'user',content:'请实际执行设计器工具，完成用户要求；不能仅提供设计建议。'});continue;}
 let report=engine.report;
 if(!report){onEvent({type:'stage',stage:'evaluating',label:'检查草稿交付质量'});report=await engine.execute('evaluate_design',{});onEvent({type:'evaluation',report});}
 const actionable=report.errors.length||report.warnings.some(w=>['bounds','overlap','field','text-overflow','title','fps','asset','scene-error','unit-mismatch'].includes(w.code));
 if(actionable&&repairs<2){repairs++;onEvent({type:'stage',stage:'repairing',label:'依据评估反馈修正 · '+repairs+'/2'});messages.push({role:'user',content:'交付检查发现以下问题，请只修复这些问题并再次 evaluate_design。必须尊重编辑范围和锁定对象。'+JSON.stringify(report)});continue;}
 onEvent({type:'stage',stage:'complete',label:report.errors.length?'草稿已保留，仍有问题待修正':'设计已完成，可以预览应用'});
 return {project:engine.project,brief:engine.brief,report,summary:lastText,modified:true,tokens,rounds:round+1,requestCount,repairs};
 }
 throw Error('已达到本轮工具调用上限，已保留完成的草稿；可继续提出局部修改');
 }catch(error){if(engine.modified){await onDraft(engine.project);const report=await engine.execute('evaluate_design',{});onEvent({type:'evaluation',report});error.partial={project:engine.project,brief:engine.brief,report,modified:true,tokens,summary:signal?.aborted?'已停止，完成的部分已保留':error.message};}throw error;}
}
