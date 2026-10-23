import {readEventStream} from '../src/workbench/agent/stream.js';
const failure=(message,code='PROVIDER_STREAM')=>Object.assign(Error(message),{status:502,code});
export async function consumeCompletionStream(response,{anthropic=false,onDelta=()=>{},onReset=()=>{},signal}={}){
 const message={role:'assistant',content:'',tool_calls:[]},calls=new Map(),blocks=new Map(),reasoning=new Map();let finishReason,ended=false,sawTools=false;const usage={input_tokens:0,output_tokens:0};
 const text=value=>{if(typeof value==='string'&&value){message.content+=value;if(!sawTools)onDelta(value);}};
 const tool=()=>{if(!sawTools){sawTools=true;onReset();}};
 await readEventStream(response.body,({event,data})=>{
  if(data==='[DONE]'){ended=true;return false;}let d;try{d=JSON.parse(data);}catch{throw failure('模型流式数据格式无效');}if(d.error||event==='error')throw failure('模型流式连接中断，请稍后继续','PROVIDER_STREAM_ERROR');
  if(anthropic){
   if(d.type==='message_start'){usage.input_tokens=d.message?.usage?.input_tokens||0;usage.output_tokens=d.message?.usage?.output_tokens||0;}
   if(d.type==='content_block_start'){const b=d.content_block;blocks.set(d.index,b);if(b.type==='text')text(b.text);if(b.type==='tool_use'){tool();calls.set(d.index,{id:b.id,type:'function',function:{name:b.name,arguments:''},initial:b.input});}}
   if(d.type==='content_block_delta'){const v=d.delta;if(v?.type==='text_delta')text(v.text);if(v?.type==='input_json_delta'){const c=calls.get(d.index);if(!c)throw failure('工具参数缺少对应调用');c.function.arguments+=v.partial_json||'';}}
   if(d.type==='message_delta'){finishReason=d.delta?.stop_reason||finishReason;usage.input_tokens=d.usage?.input_tokens??usage.input_tokens;usage.output_tokens=d.usage?.output_tokens??usage.output_tokens;}
   if(d.type==='message_stop'){ended=true;return false;}
  }else{
   const choice=d.choices?.find(c=>c.index===0)||d.choices?.[0],delta=choice?.delta||{};text(delta.content);finishReason=choice?.finish_reason||finishReason;
   for(const c of delta.tool_calls||[]){tool();if(!Number.isInteger(c.index)||c.index<0||c.index>19)throw failure('模型工具序号无效');const old=calls.get(c.index)||{id:'',type:'function',function:{name:'',arguments:''}};if(c.id)old.id=c.id;if(c.function?.name)old.function.name+=c.function.name;if(c.function?.arguments)old.function.arguments+=c.function.arguments;if(c.extra_content)old.extra_content=c.extra_content;calls.set(c.index,old);}
   for(const r of delta.reasoning_details||[])if(r.type==='reasoning.encrypted'){const key=r.id??r.index??0,old=reasoning.get(key);reasoning.set(key,old?{...old,...r,data:(old.data||'')+(r.data||'')}:r);}
   usage.input_tokens=d.usage?.prompt_tokens??usage.input_tokens;usage.output_tokens=d.usage?.completion_tokens??usage.output_tokens;
  }
  if(calls.size>20||[...calls.values()].some(c=>c.function.arguments.length>80000))throw failure('模型工具参数过大','PROVIDER_RESPONSE_TOO_LARGE');
 },{signal});
 if(!ended||!finishReason)throw failure('模型连接提前结束，草稿已保留','STREAM_INCOMPLETE');
 message.tool_calls=[...calls.entries()].sort((a,b)=>a[0]-b[0]).map(([,c])=>{if(!c.id||!c.function.name)throw failure('模型工具调用不完整');const {initial,...result}=c;if(anthropic&&!result.function.arguments)result.function.arguments=JSON.stringify(initial||{});return result;});
 if(reasoning.size)message.reasoning_details=[...reasoning.values()];return {message,usage,finishReason};
}
export function completionResponse(run,model,signal){
 const encoder=new TextEncoder(),cancel=new AbortController(),combined=AbortSignal.any([signal,cancel.signal]);let closed=false;
 const body=new ReadableStream({start(controller){const emit=(event,data)=>{if(!closed&&!combined.aborted)controller.enqueue(encoder.encode('event: '+event+'\ndata: '+JSON.stringify(data)+'\n\n'));};
 const heartbeat=setInterval(()=>{if(!closed&&!combined.aborted)controller.enqueue(encoder.encode(': keep-alive\n\n'));},12000);
 (async()=>{try{const result=await run({onDelta:text=>emit('delta',{text}),onReset:()=>emit('reset',{}),signal:combined});emit('done',{...result,model});}catch(e){if(!cancel.signal.aborted)emit('error',{error:e.status?e.message:'模型连接中断，草稿已保留，可继续完成',code:e.code||'PROVIDER_STREAM',status:e.status||502});}finally{clearInterval(heartbeat);if(!closed){closed=true;controller.close();}}})();},cancel(){closed=true;cancel.abort();}});
 return new Response(body,{headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store, no-transform','X-Accel-Buffering':'no','X-Content-Type-Options':'nosniff'}});
}
