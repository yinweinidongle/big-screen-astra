import assert from 'node:assert/strict';
import {readEventStream,readAgentStream} from '../src/workbench/agent/stream.js';import {consumeCompletionStream,completionResponse} from '../server/agent-stream.js';import {modelCompletion} from '../server/agent.js';
const encoder=new TextEncoder(),sse=(data,event)=>`${event?'event: '+event+'\r\n':''}data: ${typeof data==='string'?data:JSON.stringify(data)}\r\n\r\n`;
function response(text,chunk=7){const data=encoder.encode(text);let offset=0;return new Response(new ReadableStream({pull(c){if(offset>=data.length){c.close();return;}c.enqueue(data.slice(offset,offset+=chunk));}}),{headers:{'Content-Type':'text/event-stream'}});}
let text='';await readEventStream(response(': heartbeat\r\n\r\n'+sse({text:'流式回复🌏'}),1).body,({data})=>text+=JSON.parse(data).text);assert.equal(text,'流式回复🌏');
const openai=[{choices:[{index:0,delta:{content:'已'}}]},{choices:[{index:0,delta:{content:'完成。'}}]},{choices:[{index:0,delta:{},finish_reason:'stop'}]},{choices:[],usage:{prompt_tokens:13,completion_tokens:4}}];let deltas=[];const result=await consumeCompletionStream(response(openai.map(x=>sse(x)).join('')+sse('[DONE]')),{onDelta:v=>deltas.push(v)});assert.deepEqual(deltas,['已','完成。']);assert.equal(result.message.content,'已完成。');assert.equal(result.usage.input_tokens,13);
let resets=0;
const toolEvents=[
 {choices:[{delta:{tool_calls:[
  {index:0,id:'a',function:{name:'get_widget',arguments:'{"id":'}},
  {index:1,id:'b',function:{name:'query_widgets',arguments:'{"query":'}}
 ]}}]},
 {choices:[{delta:{tool_calls:[
  {index:0,function:{arguments:'"header"}'}},
  {index:1,function:{arguments:'"标题"}'},extra_content:{google:{thought_signature:'opaque'}}}
 ]},finish_reason:'tool_calls'}]}
];
const tools=await consumeCompletionStream(response(toolEvents.map(x=>sse(x)).join('')+sse('[DONE]')),{onReset:()=>resets++});assert.equal(resets,1);assert.equal(JSON.parse(tools.message.tool_calls[0].function.arguments).id,'header');assert.equal(tools.message.tool_calls[1].extra_content.google.thought_signature,'opaque');
const anthropic=[{type:'message_start',message:{usage:{input_tokens:12,output_tokens:0}}},{type:'content_block_start',index:0,content_block:{type:'text',text:''}},{type:'content_block_delta',index:0,delta:{type:'text_delta',text:'你好'}},{type:'content_block_start',index:1,content_block:{type:'tool_use',id:'a',name:'get_widget',input:{}}},{type:'content_block_delta',index:1,delta:{type:'input_json_delta',partial_json:'{"id":"x"}'}},{type:'message_delta',delta:{stop_reason:'tool_use'},usage:{output_tokens:9}},{type:'message_stop'}];const a=await consumeCompletionStream(response(anthropic.map(x=>sse(x,x.type)).join('')),{anthropic:true});assert.equal(a.message.content,'你好');assert.equal(a.usage.output_tokens,9);assert.equal(a.message.tool_calls[0].function.arguments,'{"id":"x"}');
await assert.rejects(consumeCompletionStream(response(sse({choices:[{delta:{content:'半段'}}]}))),e=>e.code==='STREAM_INCOMPLETE');await assert.rejects(consumeCompletionStream(response(sse({error:{message:'PRIVATE PROVIDER MESSAGE'}}))),e=>e.code==='PROVIDER_STREAM_ERROR'&&!e.message.includes('PRIVATE'));await assert.rejects(readAgentStream(response(sse({text:'半段'},'delta'))),e=>e.code==='STREAM_INCOMPLETE');
let aborted=false;const controller=new AbortController(),pending=new ReadableStream({pull(){return new Promise(()=>{});},cancel(){aborted=true;}});const reading=readEventStream(pending,()=>{},{signal:controller.signal});controller.abort();await assert.rejects(reading,e=>e.name==='AbortError');assert(aborted);
const clientDeltas=[];const browserResponse=completionResponse(async({onDelta})=>{onDelta('第一段');onDelta('第二段');return result;},'test',new AbortController().signal);const client=await readAgentStream(browserResponse,{onDelta:v=>clientDeltas.push(v)});assert.equal(client.message.content,'已完成。');assert.equal(client.model,'test');assert.equal(clientDeltas.length,2);
const save=globalThis.fetch;let sent;globalThis.fetch=async(url,options)=>{sent=JSON.parse(options.body);return response(openai.map(x=>sse(x)).join('')+sse('[DONE]'));};try{const r=await modelCompletion({id:'openrouter',key:'TEST_ONLY',model:'test',baseUrl:'https://example.com'},[{role:'user',content:'hi'}],undefined,{finalOnly:true,onDelta:()=>{}});assert.equal(sent.stream,true);assert.equal(sent.tool_choice,'none');assert.equal(r.message.content,'已完成。');}finally{globalThis.fetch=save;}
console.log('Agent streaming: byte-split UTF-8/CRLF, heartbeat, real deltas, parallel tool argument assembly, Anthropic events, provider error redaction, truncated streams, abort propagation, final-only mode and server/browser transport passed.');
