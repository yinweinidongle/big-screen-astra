// Keep complete assistant/tool groups, including provider signatures. Never
// truncate source inside a signed call or separate a call from its receipts.
export function compactTranscript(messages,{maxChars=100000,maxMessages=72}={}){
 const size=list=>JSON.stringify(list).length;
 if(messages.length<=maxMessages&&size(messages)<=maxChars)return messages;
 const groups=[];for(const m of messages.slice(1)){if(m.role==='tool'&&groups.length)groups.at(-1).push(m);else groups.push([m]);}
 const removed=[];let kept=groups.slice();
 while(kept.length>1&&(kept.flat().length+2>maxMessages||size([messages[0],...kept.flat()])>maxChars))removed.push(...kept.shift());
 if(!removed.length)return messages;
 const actions=removed.filter(m=>m.role==='tool').slice(-24).map(m=>{let r={};try{r=JSON.parse(m.content)}catch{}return {toolCallId:m.tool_call_id,ok:r.ok,id:r.id,added:r.added?.map?.(v=>({id:v.id,name:v.name})),updated:r.updated,removed:r.removed,error:r.error?.slice(0,180)};});
 return [messages[0],{role:'user',content:JSON.stringify({executionMemory:actions,instruction:'较早的工具记录已压缩。操作已经执行，源代码和数据仍保存在当前完整草稿；不要重做添加、删除或重建操作。需要精确信息时重新查询组件或按行读取源码。'})},...kept.flat()];
}

export function callIdentity(call,args){return JSON.stringify([call.function?.name,args]);}

// Keep a valid JSON receipt instead of slicing serialized data mid-object.
// Full data/source remains queryable in the document; caches keep this view.
export function boundReceipt(value,maxChars=32000){
 if(JSON.stringify(value).length<=maxChars)return value;
 function reduce(v,limit,depth=0){if(depth>12)return '[省略深层内容]';if(typeof v==='string')return v.length>limit*100?v.slice(0,limit*100)+' [已省略，请缩小查询范围]':v;if(Array.isArray(v))return v.slice(0,limit).map(x=>reduce(x,limit,depth+1));if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).slice(0,40).map(([k,x])=>[k,reduce(x,limit,depth+1)]));return v;}
 for(const limit of [20,8,3,1]){const result={...reduce(value,limit),truncated:true,note:'回执已精简；完整数据和源文件仍保留。请按 ID 查询单个组件，或缩小文件行范围。'};if(JSON.stringify(result).length<=maxChars)return result;}
 return {ok:value.ok,truncated:true,note:'结果超过单次上下文预算，请缩小查询范围；操作结果仍保存在完整草稿中。'};
}
