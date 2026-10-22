import {resolveHeaderConfig} from '../header.js';

const equal=(a,b)=>a===b||JSON.stringify(a)===JSON.stringify(b);
const nodeInfo=n=>({id:n.id,type:n.type,name:n.name});
const groups={layout:['x','y','w','h','rotation','visible','group'],content:['name','props'],style:['style'],data:['data'],interactions:['events']};
const semantic=(key,value)=>{if(key!=='props'||!value?.codeWorkspace)return value;const {activation,checkpoints,...workspace}=value.codeWorkspace;return {...value,codeWorkspace:workspace};};

export function designChanges(before,after){
 const old=new Map(before.nodes.map(n=>[n.id,n])),next=new Map(after.nodes.map(n=>[n.id,n]));
 const added=[],updated=[],removed=[];
 for(const n of after.nodes){const previous=old.get(n.id);if(!previous){added.push(nodeInfo(n));continue;}if(previous===n)continue;
  const fields=Object.entries(groups).filter(([,keys])=>keys.some(k=>!equal(semantic(k,previous[k]),semantic(k,n[k])))).map(([name])=>name);
  if(fields.length)updated.push({...nodeInfo(n),fields});
 }
 for(const n of before.nodes)if(!next.has(n.id))removed.push(nodeInfo(n));
 const settings=['name','width','height','theme','fit','background','filters','variables','assets'].filter(k=>!equal(before[k],after[k]));
 return {changed:before.id!==after.id||!!(added.length+updated.length+removed.length+settings.length),createdProject:before.id!==after.id,added,updated,removed,settings,retained:after.nodes.length-added.length-updated.length,counts:{added:added.length,updated:updated.length,removed:removed.length,total:after.nodes.length}};
}

export function checkAcceptance(project,checks=[]){
 const errors=[],headers=project.nodes.filter(n=>n.type==='header');
 for(const c of checks){const n=c.id?project.nodes.find(n=>n.id===c.id):c.kind==='title'&&headers.length===1?headers[0]:undefined;let actual;
  if(c.kind==='count')actual=project.nodes.length;
  else if(c.kind==='exists')actual=!!n;
  else if(c.kind==='title')actual=n?.type==='header'?resolveHeaderConfig(n).title:n?.props.title;
  else if(c.kind==='prop')actual=n?.type==='header'&&['title','text'].includes(c.key)?resolveHeaderConfig(n).title:n?.props[c.key];
  if(!equal(actual,c.value))errors.push({code:'acceptance',...(c.id?{nodeId:c.id}:{}),message:(n?.name||c.id||'画布')+' 未满足验收条件 '+c.kind+(c.key?'.'+c.key:'')+'：期望 '+JSON.stringify(c.value)+'，实际 '+JSON.stringify(actual)});
 }
 return errors;
}
