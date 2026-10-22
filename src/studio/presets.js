import {sitePath} from '../paths.js';
import {effectIds} from './lineEffects.js';
import {generatedPresets} from './generatedPresets.js';
const rail=(id,name,points,color,extra={})=>({id,name,points:points.map(([x,y])=>({x,y})),color,width:1.8,duration:5.5,tail:100,glow:5,opacity:.95,mirror:true,visible:true,kind:'line',effect:'comet',direction:'forward',...extra});
export const presets=[...generatedPresets,
 {id:'city',name:'深海指挥舱',en:'DEEP BLUE',tag:'城市 · 冷蓝',color:'#80e6ff',background:{url:sitePath('/assets/header-command-frame.png'),width:1774,height:887,crop:{x:0,y:328,w:1774,h:276}},title:'智慧城市运行中心',subtitle:'SHANGHAI · CITY INTELLIGENCE CENTER',lines:[rail('city-main','主轮廓光轨',[[0,139],[395,139],[475,224],[800,224]],'#a3edff'),rail('city-detail','内侧辅助光轨',[[0,122],[382,122],[462,207],[682,207]],'#508fb5',{width:.9,tail:65,opacity:.7,glow:2,duration:7})]},
 {id:'park',name:'星屿光学',en:'VIOLET ORBIT',tag:'园区 · 星紫',color:'#b9a4ff',background:{url:sitePath('/assets/park-header.png'),width:1419,height:1108,crop:{x:0,y:380,w:1419,h:330}},title:'智慧园区运营中心',subtitle:'STAR ISLE · CONNECTED CAMPUS',lines:[rail('park-main','光学弧线',[[0,32],[214,58],[400,146],[654,213]],'#cfb9ff',{kind:'curve',duration:6.5,width:1.7}),rail('park-base','底部光轨',[[0,213],[400,213],[650,213]],'#718fef',{width:.8,tail:60,duration:8,opacity:.6})]},
 {id:'farm',name:'禾境生态',en:'VERDANT GOLD',tag:'农业 · 翡翠',color:'#dce7a0',background:{url:sitePath('/assets/agriculture-header.png'),width:2172,height:724,crop:{x:0,y:220,w:2172,h:400}},title:'智慧农业生态管理中心',subtitle:'AGRIVERSE · GROWING A BETTER FUTURE',lines:[rail('farm-main','生态弧光',[[0,124],[140,145],[340,196],[610,229],[780,231]],'#e8edb3',{kind:'curve',duration:7,width:1.9}),rail('farm-detail','叶脉辅助线',[[0,110],[148,128],[350,175],[610,210]],'#83bc9c',{kind:'curve',width:.8,opacity:.55,duration:9,tail:70})]},
 {id:'industry',name:'钛金工场',en:'TITANIUM AMBER',tag:'工业 · 琥珀',color:'#edb369',background:{url:sitePath('/assets/industry-header.png'),width:2172,height:724,crop:{x:0,y:105,w:2172,h:505}},title:'智慧工业数字运营中心',subtitle:'NEXUS · INDUSTRIAL INTELLIGENCE',lines:[rail('ind-main','机械边缘光轨',[[0,202],[270,202],[314,229],[482,229],[524,258]],'#ffd69c',{duration:5,width:1.7}),rail('ind-detail','金属细节光轨',[[0,212],[259,212],[303,239],[460,239]],'#a97540',{width:.9,duration:6.5,opacity:.75,tail:60})]},
 {id:'ice',name:'极地银翼',en:'ARCTIC SILVER',tag:'通用 · 冰银',color:'#cbeafa',background:{url:sitePath('/assets/header-command-frame.png'),width:1774,height:887,crop:{x:0,y:328,w:1774,h:276},filter:'saturate(.25) brightness(1.2)'},title:'数字孪生指挥中心',subtitle:'DIGITAL TWIN · OPERATIONS CENTER',lines:[rail('ice-main','银翼光轨',[[0,139],[395,139],[475,224],[800,224]],'#e5f8ff',{duration:7,width:1.4,glow:3})]},
 {id:'rose',name:'绯光边界',en:'ROSE HORIZON',tag:'通用 · 玫瑰',color:'#efb8e4',background:{url:sitePath('/assets/park-header.png'),width:1419,height:1108,crop:{x:0,y:380,w:1419,h:330},filter:'hue-rotate(55deg) saturate(.8)'},title:'未来科技创新中心',subtitle:'HORIZON · TOMORROW STARTS HERE',lines:[rail('rose-main','绯光曲线',[[0,32],[214,58],[400,146],[654,213]],'#ffc0e6',{kind:'curve',duration:6,width:1.6})]}
];
export function makeConfig(preset=presets[0]){return structuredClone({version:1,width:1600,height:260,presetId:preset.id,background:{...preset.background,opacity:.9},title:preset.title,subtitle:preset.subtitle,titleColor:'#e0f1fa',accent:preset.color,fontSize:34,letterSpacing:7,titleX:800,titleY:112,subtitleSize:10,subtitleSpacing:4,bgColor:'#06121e',lines:preset.lines,...preset.settings});}
export function validateConfig(raw){
 if(!raw||typeof raw!=='object'||raw.version!==1||!Array.isArray(raw.lines)||raw.lines.length>80)throw Error('配置格式不正确，请导入由本编辑器导出的 JSON');
 const c=makeConfig(presets.find(p=>p.id===raw.presetId)||presets[0]);if(raw.presetId==='custom')c.presetId='custom';
 const num=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
 for(const [key,min,max] of [['height',120,600],['fontSize',16,80],['letterSpacing',0,24],['titleX',0,1600],['titleY',0,600],['subtitleSize',6,24],['subtitleSpacing',0,12]])if(num(raw[key],min,max))c[key]=raw[key];
 for(const key of ['title','subtitle'])if(typeof raw[key]==='string')c[key]=raw[key].slice(0,160);
 for(const key of ['titleColor','accent','bgColor'])if(color(raw[key]))c[key]=raw[key];
 if(raw.background&&typeof raw.background.url==='string'){
  const b=raw.background;if(!(/^\/assets\/[a-z0-9-]+\.png$/i.test(b.url)||/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(b.url)))throw Error('背景地址不受支持，请在编辑器内上传图片');
  if(!num(b.width,1,12000)||!num(b.height,1,12000)||!b.crop||!['x','y','w','h'].every(k=>num(b.crop[k],k==='w'||k==='h'?1:0,12000)))throw Error('背景裁切参数不正确');
  c.background={url:b.url,width:b.width,height:b.height,crop:{...b.crop},opacity:num(b.opacity,0,1)?b.opacity:.9};if(typeof b.filter==='string'&&presets.some(p=>p.background.filter===b.filter))c.background.filter=b.filter;
 }
 const ids=new Set();c.lines=raw.lines.map((l,i)=>{
  if(!l||!Array.isArray(l.points)||l.points.length<2||l.points.length>200||!l.points.every(p=>num(p.x,0,1600)&&num(p.y,0,600)))throw Error('线条节点数据不正确');
  const id=typeof l.id==='string'&&/^[a-z0-9_-]{1,80}$/i.test(l.id)&&!ids.has(l.id)?l.id:'import-'+i;ids.add(id);
  return {id,name:typeof l.name==='string'?l.name.slice(0,40):'光轨 '+(i+1),points:l.points.map(p=>({x:p.x,y:p.y})),color:color(l.color)?l.color:c.accent,width:num(l.width,.3,8)?l.width:1.8,duration:num(l.duration,1,20)?l.duration:5.5,tail:num(l.tail,15,400)?l.tail:100,glow:num(l.glow,0,20)?l.glow:5,opacity:num(l.opacity,.1,1)?l.opacity:1,mirror:!!l.mirror,visible:l.visible!==false,kind:l.kind==='curve'?'curve':'line',effect:effectIds.includes(l.effect)?l.effect:'comet',direction:l.direction==='reverse'?'reverse':'forward'};
 });return c;
}
