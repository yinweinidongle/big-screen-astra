import {ref,computed,watch,onBeforeUnmount} from 'vue';
import {makeConfig,validateConfig,presets} from './presets';
const KEY='header-studio:v1';
export function useStudio(){
 let initial=makeConfig(),recovered=false;
 try{const saved=localStorage.getItem(KEY);if(saved){initial=validateConfig(JSON.parse(saved));recovered=true}}catch{}
 const assets=new Map();function snapshot(value){const b={...value.background};if(b.url.startsWith('data:')){let id=[...assets.entries()].find(([,url])=>url===b.url)?.[0];if(!id){id='@image-'+crypto.randomUUID();assets.set(id,b.url)}b.url=id;}return JSON.stringify({...value,background:b})}
 const config=ref(initial),selectedId=ref(initial.lines[0]?.id||'title'),tool=ref('select'),playing=ref(true),snap=ref(true),showGrid=ref(true),showGuides=ref(true),mirrorDraw=ref(true),history=ref([snapshot(initial)]),cursor=ref(0),toast=ref(''),saveState=ref(recovered?'已恢复上次草稿':'本地自动保存'),storageAvailable=ref(true);let toastTimer,saveTimer;
 const selected=computed(()=>config.value.lines.find(l=>l.id===selectedId.value));const canUndo=computed(()=>cursor.value>0),canRedo=computed(()=>cursor.value<history.value.length-1);
 function message(t){toast.value=t;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.value='',3200)}
 function record(){const json=snapshot(config.value);if(history.value[cursor.value]===json)return;history.value=history.value.slice(0,cursor.value+1);history.value.push(json);if(history.value.length>60)history.value.shift();cursor.value=history.value.length-1;}
 function restore(){const restored=JSON.parse(history.value[cursor.value]);if(assets.has(restored.background.url))restored.background.url=assets.get(restored.background.url);config.value=restored;if(selectedId.value!=='title'&&!config.value.lines.some(l=>l.id===selectedId.value))selectedId.value=config.value.lines[0]?.id||'title';}
 function undo(){if(canUndo.value){cursor.value--;restore()}}function redo(){if(canRedo.value){cursor.value++;restore()}}
 function choosePreset(p){config.value=makeConfig(p);selectedId.value=config.value.lines[0]?.id||'title';record();message('已应用「'+p.name+'」，可撤销恢复')}
 function remove(){if(!selected.value)return;const i=config.value.lines.findIndex(l=>l.id===selectedId.value);config.value.lines.splice(i,1);selectedId.value=config.value.lines[Math.max(0,i-1)]?.id||'title';record();message('光轨已删除')}
 function duplicate(){if(!selected.value)return;const copy=JSON.parse(JSON.stringify(selected.value));copy.id='line-'+crypto.randomUUID();copy.name+=' 副本';copy.points=copy.points.map(p=>({x:p.x,y:Math.min(config.value.height,p.y+10)}));config.value.lines.push(copy);selectedId.value=copy.id;record()}
 watch(config,()=>{saveState.value='正在保存…';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(config.value));saveState.value='已保存到本机';storageAvailable.value=true}catch{saveState.value='草稿空间已满，请下载配置保存';storageAvailable.value=false}},500)},{deep:true});
 onBeforeUnmount(()=>{clearTimeout(toastTimer);clearTimeout(saveTimer);try{localStorage.setItem(KEY,JSON.stringify(config.value))}catch{}});
 return {config,selectedId,selected,tool,playing,snap,showGrid,showGuides,mirrorDraw,canUndo,canRedo,saveState,storageAvailable,toast,message,record,undo,redo,choosePreset,remove,duplicate};
}
