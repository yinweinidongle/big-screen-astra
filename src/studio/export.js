import {sitePath} from '../paths.js';
import rendererSource from './HeaderRenderer.vue?raw';
import geometrySource from './geometry.js?raw';
import trimmingSource from './pathTrimming.js?raw';
import effectsSource from './lineEffects.js?raw';
export function componentSource(config,assetImport=null){
 const json=JSON.stringify(config,null,2).replaceAll('<','\\u003c');
 const moduleSource=`<script>\n${assetImport?`import headerBackground from './${assetImport}';\n`:''}const defaultConfig=${json};\n${assetImport?'defaultConfig.background.url=headerBackground;\n':''}</script>\n`;
 const trimming=trimmingSource.replace("import {pathData,mirrored} from './geometry.js';",geometrySource.replaceAll('export ','')).replaceAll('export ','');
 return moduleSource+rendererSource.replace("import {trimLinePaths} from './pathTrimming';",trimming).replace("import {effectSegments,segmentDash,segmentStyle,rippleNodes,lineRadius} from './lineEffects';",effectsSource.replaceAll('export ','')).replace('config:{type:Object,required:true}','config:{type:Object,default:()=>defaultConfig}');
}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
const encoder=new TextEncoder();
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
// Uncompressed ZIP keeps exports dependency-free and preserves original image bytes.
export function makeZip(files){
 const local=[],central=[];let offset=0,centralSize=0;
 for(const f of files){const name=encoder.encode(f.name),body=typeof f.content==='string'?encoder.encode(f.content):f.content,crc=crc32(body),head=new Uint8Array(30+name.length),h=new DataView(head.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint32(14,crc,true);h.setUint32(18,body.length,true);h.setUint32(22,body.length,true);h.setUint16(26,name.length,true);head.set(name,30);local.push(head,body);
 const entry=new Uint8Array(46+name.length),c=new DataView(entry.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint32(16,crc,true);c.setUint32(20,body.length,true);c.setUint32(24,body.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);entry.set(name,46);central.push(entry);centralSize+=entry.length;offset+=head.length+body.length;
 }
 const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);return new Blob([...local,...central,end],{type:'application/zip'});
}
export async function resolveBackground(config){const r=await fetch(sitePath(config.background.url));if(!r.ok)throw Error('背景素材未能加载，请检查网络后重试');const blob=await r.blob();const bytes=new Uint8Array(await blob.arrayBuffer());const ext=blob.type==='image/jpeg'?'jpg':blob.type==='image/webp'?'webp':'png';return {bytes,ext,blob};}
export async function buildPackage(config){const bg=await resolveBackground(config),name='header-background.'+bg.ext;return makeZip([{name:'DashboardHeader.vue',content:componentSource({...config,background:{...config.background,url:name}},name)},{name,content:bg.bytes},{name:'header.config.json',content:JSON.stringify(config,null,2)},{name:'README.md',content:'# Dashboard Header\n\nVue 3.5+。将 DashboardHeader.vue 和 header-background.'+bg.ext+' 放到同一目录。\n\n```vue\n<script setup>\nimport DashboardHeader from "./DashboardHeader.vue";\n</script>\n<template><div style="width:100%;height:'+config.height+'px"><DashboardHeader /></div></template>\n```\n\n组件只依赖 Vue，自带 SVG 动画、交点自动裁剪和响应式 viewBox。裁剪不改变原始节点，更新 config 后自动重算。通过 :playing="false" 暂停；可通过 config prop 覆盖完整配置。\nheader.config.json 可重新导入 Header Studio 继续编辑。\n'}]);}
export async function standaloneSource(config){const {blob}=await resolveBackground(config);const data=await new Promise((res,rej)=>{const reader=new FileReader();reader.onload=()=>res(reader.result);reader.onerror=rej;reader.readAsDataURL(blob)});return componentSource({...config,background:{...config.background,url:data}});}
