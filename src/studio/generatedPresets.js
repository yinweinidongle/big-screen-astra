import {sitePath} from '../paths.js';
import contours from './generatedContours.json' with {type:'json'};
const descriptions=[
 {id:'aurora',name:'极光折翼',en:'AURORA GLASS',tag:'通用 · 极光',color:'#a9f5d5',title:'绿色智慧生态运营中心',subtitle:'AURORA · INTELLIGENT ECOLOGY',effect:'trail',width:1.05,duration:9,tail:190,glow:2.5,titleColor:'#daf5e9'},
 {id:'gold',name:'曜金矩阵',en:'CHAMPAGNE MATRIX',tag:'城市 · 曜金',color:'#f4d39b',title:'智慧城市全域指挥中心',subtitle:'AUREUM · CITY COMMAND CENTER',effect:'comet',width:1.15,duration:7.5,tail:95,glow:3,titleColor:'#f3e5cd'},
 {id:'scarlet',name:'赤曜电路',en:'SCARLET CIRCUIT',tag:'工业 · 赤曜',color:'#ffb1a9',title:'工业智能协同指挥中心',subtitle:'SCARLET · INDUSTRIAL INTELLIGENCE',effect:'dash',width:1.1,duration:8,tail:100,glow:2,titleColor:'#f4dddb'},
 {id:'glacier',name:'冰川棱镜',en:'GLACIER PRISM',tag:'通用 · 棱镜',color:'#c0e7ff',title:'数字孪生智能决策中心',subtitle:'GLACIER · DIGITAL TWIN PLATFORM',effect:'dot',width:1.3,duration:8,tail:30,glow:3,titleColor:'#e0effb'},
 {id:'orbit',name:'星环引力',en:'CELESTIAL ORBIT',tag:'园区 · 星环',color:'#dfcaf8',title:'未来科技创新运营中心',subtitle:'ORBIT · INNOVATION OBSERVATORY',effect:'particles',width:1.15,duration:10,tail:130,glow:2.5,titleColor:'#ece1f6'},
 {id:'jade',name:'墨玉山河',en:'JADE LANDSCAPE',tag:'农业 · 墨玉',color:'#e9cf9b',title:'山水智慧生态管理中心',subtitle:'JADE · NATURE MEETS INTELLIGENCE',effect:'dot',width:1.1,duration:10,tail:45,glow:2,titleColor:'#ece8d8'}
];
export const generatedPresets=descriptions.map(p=>{
 const image=contours[p.id];
 return {id:p.id,name:p.name,en:p.en,tag:p.tag,color:p.color,fresh:true,thumbnail:sitePath(`/assets/header-${p.id}-thumb.jpg`),background:{url:sitePath(`/assets/header-${p.id}.png`),width:image.width,height:image.height,crop:{x:0,y:0,w:image.width,h:image.height}},title:p.title,subtitle:p.subtitle,settings:{titleColor:p.titleColor,titleY:p.id==='orbit'?108:112,fontSize:32,letterSpacing:6,bgColor:'#05121d'},lines:Object.entries(image.rails).map(([key,rail])=>({id:`${p.id}-${key}`,name:`${key.startsWith('base')?'底部光槽':'轮廓光轨'} · ${key.endsWith('left')?'左':'右'}`,points:rail.points.map(([x,y])=>({x,y})),color:p.color,width:key.startsWith('base')?.8:p.width,duration:key.startsWith('base')?11:p.duration,tail:p.tail,glow:key.startsWith('base')?1:p.glow,opacity:key.startsWith('base')?.55:.9,mirror:false,visible:true,kind:'line',effect:key.startsWith('base')?'barcode':p.effect,direction:'forward'}))};
});
