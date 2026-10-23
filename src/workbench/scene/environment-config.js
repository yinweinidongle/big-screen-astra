export const skyPresets=[
 {id:'none',name:'透明背景',subtitle:'沿用大屏背景'},
 {id:'sunny',name:'晴天',subtitle:'蓝天 · 自然日光',url:'/assets/scene/skies/sunny.webp'},
 {id:'overcast',name:'阴天',subtitle:'柔和天光 · 云层',url:'/assets/scene/skies/overcast.webp'},
 {id:'rainy',name:'雨天',subtitle:'低云 · 动态雨幕',url:'/assets/scene/skies/rainy.webp'},
];
export const texturePresets=[
 {id:'none',name:'无贴图'},
 {id:'concrete',name:'水泥地',url:'/assets/scene/textures/concrete.webp'},
 {id:'grass',name:'草地',url:'/assets/scene/textures/grass.webp',normal:'/assets/scene/textures/grass-normal.webp'},
 {id:'tile',name:'瓷砖',url:'/assets/scene/textures/tile.webp',normal:'/assets/scene/textures/tile-normal.webp'},
 {id:'wood',name:'木地板',url:'/assets/scene/textures/wood.webp',normal:'/assets/scene/textures/wood-normal.webp'},
 {id:'wall',name:'砖墙',url:'/assets/scene/textures/wall.webp',normal:'/assets/scene/textures/wall-normal.webp'},
];
const number=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
export function normalizeSceneEnvironment(value){const v=value&&typeof value==='object'?value:{};return {sky:skyPresets.some(s=>s.id===v.sky)?v.sky:'none',brightness:number(v.brightness,.2,2,1),rotation:number(v.rotation,-180,180,0),blur:number(v.blur,0,.6,0),fog:number(v.fog,0,.015,.0025),rain:number(v.rain,0,1,.5)};}
