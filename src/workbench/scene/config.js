export const scenePresets = [
  {id:'tower',name:'科创办公楼',category:'建筑',subtitle:'玻璃幕墙 · 屋顶设备',color:'#8ebae1'},
  {id:'warehouse',name:'标准厂房',category:'建筑',subtitle:'金属屋面 · 装卸入口',color:'#b5c2d1'},
  {id:'solar',name:'光伏阵列',category:'能源',subtitle:'双排组件 · 倾斜支架',color:'#5c91d2'},
  {id:'turbine',name:'风力机组',category:'能源',subtitle:'三叶转子 · 发电设施',color:'#d2e1ed'},
  {id:'charger',name:'充电桩',category:'能源',subtitle:'双枪终端 · 状态灯',color:'#74d5c3'},
  {id:'robot',name:'工业机械臂',category:'设备',subtitle:'多节关节 · 精密夹爪',color:'#e8b16b'},
  {id:'pump',name:'水泵机组',category:'设备',subtitle:'电机 · 管路 · 阀门',color:'#7bb7c4'},
  {id:'camera',name:'安防摄像头',category:'设备',subtitle:'立杆 · 摄像机 · 光学镜头',color:'#9db2d4'},
  {id:'tree',name:'景观乔木',category:'环境',subtitle:'层次树冠 · 种植池',color:'#6cab8d'},
  {id:'container',name:'物流集装箱',category:'设备',subtitle:'箱体压筋 · 门锁细节',color:'#b79075'},
];
export const modelPresets=[{id:'pump',name:'循环水泵',fitSize:4.5,url:'/assets/models/pump.glb'},{id:'robot',name:'精密机械臂',fitSize:5,url:'/assets/models/robot.glb'},{id:'charger',name:'智慧充电桩',fitSize:3.4,url:'/assets/models/charger.glb'}];
export const materialPresets = [
  {id:'original',name:'原始材质',color:'#b8c7d8',metalness:.5,roughness:.35,opacity:1,emissive:0},
  {id:'porcelain',name:'月白陶瓷',color:'#dce6ec',metalness:.15,roughness:.3,opacity:1,emissive:0},
  {id:'titanium',name:'拉丝钛金',color:'#a8b8c9',metalness:.9,roughness:.26,opacity:1,emissive:0},
  {id:'graphite',name:'石墨金属',color:'#354252',metalness:.8,roughness:.4,opacity:1,emissive:0},
  {id:'glass',name:'冰蓝玻璃',color:'#87c7e7',metalness:.35,roughness:.12,opacity:.48,emissive:.04},
  {id:'jade',name:'翡翠涂层',color:'#5da998',metalness:.55,roughness:.3,opacity:1,emissive:.03},
  {id:'amber',name:'琥珀合金',color:'#d8a36b',metalness:.75,roughness:.28,opacity:1,emissive:.03},
  {id:'hologram',name:'全息能量',color:'#7ddfe9',metalness:.2,roughness:.3,opacity:.72,emissive:.65},
];
const text=(v,f='',n=120)=>String(v??f).slice(0,n);
const num=(v,min,max,f)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):f;
const vec=(v,def,min,max)=>def.map((f,i)=>num(v?.[i],min,max,f));
const color=(v,f)=>/^#[\da-f]{6}$/i.test(v||'')?v:f;
export function makeSceneObject(preset='tower',extra={}){
  const p=scenePresets.find(p=>p.id===preset)||scenePresets[0];
  return normalizeSceneObjects([{id:crypto.randomUUID(),kind:preset==='label'?'label':preset==='glb'?'model':'preset',preset:p.id,name:preset==='label'?'空间标签':preset==='glb'?'GLB 模型':p.name,...extra}])[0];
}
export function normalizeSceneObjects(value){
 if(!Array.isArray(value))return [];
 const ids=new Set();
 return value.slice(0,64).filter(v=>v&&typeof v==='object').map(v=>{
  let id=typeof v.id==='string'?v.id.slice(0,100):'';if(!id||ids.has(id))id=crypto.randomUUID();ids.add(id);
  const preset=scenePresets.some(p=>p.id===v.preset)?v.preset:'tower',kind=['preset','model','label'].includes(v.kind)?v.kind:'preset';
  const m=v.material||{},material=materialPresets.find(p=>p.id===m.preset)||materialPresets[0],l=v.label||{};
  let url=text(v.url,'',2048);if(url&&!/^(https?:\/\/|\/assets\/)/i.test(url)&&!url.startsWith('/api/'))url='';
  let link=text(l.link,'',2048);if(!/^https?:\/\//i.test(link))link='';
  const name=text(v.name,kind==='label'?'空间标签':scenePresets.find(p=>p.id===preset).name,60);
  return {id,kind,preset,name,url,assetId:text(v.assetId,'',100),draco:v.draco===true,fitSize:num(v.fitSize,.1,80,8),
   position:vec(v.position,[0,0,0],-200,200),rotation:vec(v.rotation,[0,0,0],-360,360),scale:vec(v.scale,[1,1,1],.02,40),visible:v.visible!==false,locked:v.locked===true,
   material:{preset:material.id,color:color(m.color,material.color),metalness:num(m.metalness,0,1,material.metalness),roughness:num(m.roughness,0,1,material.roughness),opacity:num(m.opacity,.05,1,material.opacity),emissive:num(m.emissive,0,3,material.emissive)},
   animation:{type:['none','rotate','float','pulse'].includes(v.animation?.type)?v.animation.type:'none',speed:num(v.animation?.speed,.1,4,1),clips:v.animation?.clips!==false},
   label:{enabled:l.enabled!==false,title:text(l.title,name,60),description:text(l.description,'在这里填写设备说明或空间介绍。',500),status:['normal','warning','offline'].includes(l.status)?l.status:'normal',color:color(l.color,'#8cc9e8'),offset:vec(l.offset,[0,.7,0],-100,100),style:['glass','solid'].includes(l.style)?l.style:'glass',link,linkText:text(l.linkText,'查看详情',24),
    rows:(Array.isArray(l.rows)?l.rows:[{label:'运行状态',value:'正常',unit:''},{label:'所属区域',value:'示范区域',unit:''}]).slice(0,8).map(r=>({label:text(r?.label,'指标',30),value:text(r?.value,'—',100),unit:text(r?.unit,'',16)}))}
  };
 });
}
export function cloneSceneObject(object){const copy=JSON.parse(JSON.stringify(object));copy.id=crypto.randomUUID();copy.name+=' 副本';copy.position[0]+=2;copy.position[2]+=2;return copy;}
