// One catalogue drives the picker, renderer, config validation and exports.
export const lineEffects=[
 {id:'comet',name:'彗星流光',family:'流光',description:'高亮光头沿轨迹匀速巡航',width:1.8,duration:5.5,tail:100,glow:5},
 {id:'trail',name:'渐隐拖尾',family:'流光',description:'柔和渐淡、自然收尖，匀速划过并平滑离场',width:1.7,duration:7.5,tail:250,glow:4},
 {id:'phantom',name:'多重幻影',family:'幻影',description:'三道错位残像与主光轨交叠',width:1.5,duration:6.5,tail:160,glow:4},
 {id:'dot',name:'单点巡航',family:'光点',description:'单颗发光圆点沿线移动',width:2,duration:5,tail:30,glow:7},
 {id:'particles',name:'粒子星流',family:'光点',description:'由小至大的粒子串组成星流',width:1.8,duration:5.5,tail:180,glow:5},
 {id:'beads',name:'串珠轨迹',family:'光点',description:'等距光珠连续流动，节奏均匀',width:1.5,duration:8,tail:100,glow:3},
 {id:'dash',name:'数据脉冲',family:'脉冲',description:'规则短光段持续传送数据',width:1.8,duration:7,tail:100,glow:3},
 {id:'barcode',name:'信号编码',family:'脉冲',description:'长短不一的光段组成编码序列',width:1.6,duration:7,tail:100,glow:2},
 {id:'scan',name:'扫描光带',family:'流光',description:'宽幅柔光带掠过，中心线锐利',width:2.1,duration:7,tail:180,glow:12},
 {id:'dual',name:'双向汇流',family:'脉冲',description:'两端光流相向汇聚于轨迹中点',width:2,duration:5,tail:130,glow:6},
 {id:'ripple',name:'节点涟漪',family:'光点',description:'节点光环呼吸扩散，搭配巡航点',width:1.8,duration:6,tail:100,glow:4},
 {id:'neon',name:'霓虹光谱',family:'幻影',description:'连续光轨在多种霓虹颜色间流转',width:2.3,duration:9,tail:100,glow:8},
 {id:'spark',name:'电弧闪烁',family:'幻影',description:'快速闪动电流与间歇高光交织',width:1.6,duration:4,tail:100,glow:5},
 {id:'pulse',name:'呼吸微光',family:'脉冲',description:'整条光轨缓缓明暗呼吸',width:1.8,duration:4.5,tail:100,glow:5},
 {id:'static',name:'静态轮廓',family:'静态',description:'纯净连续线条，保持稳定发光',width:1.3,duration:5.5,tail:100,glow:3}
];
export const effectIds=lineEffects.map(e=>e.id);
export const tailEffects=['comet','trail','phantom','particles','scan','dual'];
export function effectSegments(line){
 const t=Math.min(400,Math.max(15,line.tail||100));
 const s=(length,width=1,opacity=1,extra={})=>({length,width,opacity,motion:'travel',...extra});
 const head=(size=1.3,extra={})=>s(2,size,1,{white:true,...extra});
 switch(line.effect){
  case 'trail':{let previous=0;const layers=Array.from({length:28},(_,i)=>{const target=.9*Math.pow((i+1)/28,1.7),opacity=(target-previous)/(1-previous);previous=target;return s(t*(1-i/28),.3+Math.pow(i/28,.8),opacity,{travel:1000+t});});return [...layers,s(.7,1.1,.65,{white:true,travel:1000+t})];}
  case 'phantom':return [s(t*.65,.8,.16,{phase:100,shift:-4}),s(t*.8,1,.25,{phase:55,shift:3}),s(t,1,.55),head()];
  case 'dot':return [s(.15,4.8,1),s(.1,1.7,.9,{white:true})];
  case 'particles':return Array.from({length:8},(_,i)=>s(.1,1+i*.4,.15+i*.11,{phase:(7-i)*t/7,white:i===7}));
  case 'beads':return [s(.15,2.3,.8,{dash:'.15 39.85'})];
  case 'dash':return [s(18,1,.9,{dash:'18 22'})];
  case 'barcode':return [s(1,1,.85,{dash:'3 8 18 8 3 8 3 8 23 18',travel:1000})];
  case 'scan':return [s(t,10,.06),s(t*.8,6,.12),s(t*.6,3,.25),s(t*.28,1.3,.95),head(1.4)];
  case 'dual':return [s(t,1.1,.8,{motion:'converge'}),head(1.4,{motion:'converge'}),s(t,1.1,.8,{motion:'converge',backward:true}),head(1.4,{motion:'converge',backward:true})];
  case 'ripple':return [s(0,1,.35,{motion:'still'}),s(.1,3.4,1)];
  case 'neon':return [s(0,1,1,{motion:'still'})];
  case 'spark':return [s(0,.6,.3,{motion:'flicker'}),s(12,1.3,1,{motion:'spark',dash:'8 42 16 84 3 47'})];
  case 'pulse':return [s(0,1,1,{motion:'breathe'})];
  case 'static':return [s(0,1,.9,{motion:'still'})];
  default:return [s(t,1,.7),head()];
 }
}
export function segmentDash(s){return s.dash||(s.length>0?`${s.length} ${1000-s.length}`:undefined);}
export function segmentStyle(line,s){
 const phase=s.phase||0,start=(s.backward?s.length-1000:s.length)+phase,end=(s.motion==='converge'?s.length-500:(s.backward?s.length:s.length-(s.travel||1000)))+phase;
 return {'--duration':line.duration+'s','--offset-start':start+'px','--offset-end':end+'px',animationDirection:line.direction==='reverse'?'reverse':'normal'};
}
export function rippleNodes(points){return points.length>2?points.slice(1,-1):[points[0],points[points.length-1]];}
export function lineRadius(line){
 const radius=Math.max(...effectSegments(line).map(s=>(Math.abs(s.shift||0)+s.width/2)*line.width));
 return Math.max(radius,line.effect==='ripple'?20+line.width*.325:0)+Math.min((line.glow||0)*.5,4);
}
