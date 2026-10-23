// Incremental SSE decoding shared by the browser and Worker; UTF-8 and CRLF may span chunks.
export async function readEventStream(body,onEvent,{signal,maxBytes=2*1024*1024}={}){
 if(!body)throw Object.assign(Error('流式响应为空'),{code:'STREAM_INCOMPLETE'});
 const reader=body.getReader(),decoder=new TextDecoder();let buffer='',bytes=0,completed=false;
 const dispatch=async raw=>{const lines=raw.split(/\r\n|\n|\r/),data=lines.filter(l=>l.startsWith('data:')).map(l=>l.slice(5).replace(/^ /,'')).join('\n');if(!data)return;const event=lines.find(l=>l.startsWith('event:'))?.slice(6).trim()||'message';if(await onEvent({event,data})===false)return false;};
 const drain=async()=>{let match;while((match=/\r\n\r\n|\n\n|\r\r/.exec(buffer))){const frame=buffer.slice(0,match.index);buffer=buffer.slice(match.index+match[0].length);if(await dispatch(frame)===false)return false;}return true;};
 const abort=()=>reader.cancel().catch(()=>{});signal?.addEventListener('abort',abort,{once:true});
 try{while(true){if(signal?.aborted)throw new DOMException('Aborted','AbortError');const {value,done}=await reader.read();if(signal?.aborted)throw new DOMException('Aborted','AbortError');if(done){buffer+=decoder.decode();if(await drain()===false){completed=true;break;}if(buffer.trim())await dispatch(buffer);completed=true;break;}bytes+=value.byteLength;if(bytes>maxBytes)throw Object.assign(Error('模型响应过大，请减少单次输出'),{code:'PROVIDER_RESPONSE_TOO_LARGE',status:502});buffer+=decoder.decode(value,{stream:true});if(await drain()===false){completed=true;await reader.cancel();break;}}
 }finally{signal?.removeEventListener('abort',abort);if(!completed)await reader.cancel().catch(()=>{});reader.releaseLock();}
}
export async function readAgentStream(response,{onDelta=()=>{},onReset=()=>{},signal}={}){
 let result,done=false;await readEventStream(response.body,({event,data})=>{let value;try{value=JSON.parse(data);}catch{throw Object.assign(Error('流式回复格式无效'),{code:'STREAM_INVALID'});}if(event==='delta')onDelta(value.text||'');if(event==='reset')onReset();if(event==='error')throw Object.assign(Error(value.error||'模型连接中断'),{code:value.code||'STREAM_ERROR',status:value.status||502});if(event==='done'){result=value;done=true;return false;}},{signal});
 if(!done||!result?.message)throw Object.assign(Error('回复连接中断，已完成的草稿已保留，可继续完成'),{code:'STREAM_INCOMPLETE',status:502});return result;
}
