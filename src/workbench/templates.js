import {createNode,id} from './catalog.js';
export const templates=[
 {id:'city',name:'城市运行 · 全域感知',en:'CITY OBSERVATORY',tag:'冷蓝指挥舱',color:'#79c9ff',description:'全域城市沙盘 · 对称指挥布局 · 全息定位面板',scene:'city',header:'glacier',theme:'glacier'},
 {id:'industry',name:'工业智造 · 协同中枢',en:'INDUSTRIAL NEXUS',tag:'石墨生产控制台',color:'#f2b76c',description:'剖面生产车间 · 非对称控制台 · 精密仪表矩阵',scene:'industry',header:'gold',theme:'amber'},
 {id:'campus',name:'未来园区 · 空间运营',en:'CONNECTED CAMPUS',tag:'紫银空间看板',color:'#b7a4ed',description:'发光楼宇群 · 悬浮空间布局 · 柔光玻璃卡片',scene:'park',header:'orbit',theme:'violet'},
 {id:'agriculture',name:'禾境生态 · 精准农业',en:'VERDANT AGRICULTURE',tag:'翡翠生态全景',color:'#add6a5',description:'生态农场 · 全景横向布局 · 有机曲线面板',scene:'agriculture',header:'jade',theme:'jade'},
 {id:'global',name:'全球网络 · 指挥中心',en:'GLOBAL COMMAND',tag:'全球网络',color:'#8fc8e8',description:'智慧地球、全球节点与连接流向',scene:'globe',header:'glacier',theme:'glacier'},
 {id:'regions',name:'寰域 · 全域巡检调度',en:'REGIONAL INTELLIGENCE',tag:'立体行政区地图',color:'#7dcfff',description:'真实行政区矢量挤出 · 国家与省份 · 区域交互',scene:'regions',header:'glacier',theme:'glacier'},
 {id:'gis',name:'澜图 · 水域空间监测',en:'AQUATIC GEOSPATIAL',tag:'卫星 GIS',color:'#6ce5c0',description:'Leaflet 卫星影像 · OSM 街道 · 监测点交互',scene:'gis',header:'jade',theme:'midnight'},
 {id:'machine',name:'风擎 · 传动系统数字孪生',en:'MECHANICAL INTELLIGENCE',tag:'单体机械套件',color:'#b5c9e2',description:'精细风机传动套件 · 剖面拆解 · 动态工况',scene:'machine',header:'orbit',theme:'glacier'},
 {id:'blank',name:'从空白画布开始',en:'YOUR NEXT IDEA',tag:'自由创作',color:'#b5c1c4',description:'所有可能，从你的想法开始',scene:'none',theme:'midnight'}
];
const sectorSkin={city:'command',industry:'precision',agriculture:'botanical',campus:'orbital',regions:'command',gis:'command',machine:'precision'};
const points=(names,values,secondary)=>names.map((name,i)=>({name,value:values[i],...(secondary?{secondary:secondary[i]}:{})}));
export function makeProject(templateId='city'){
 const t=templates.find(t=>t.id===templateId)||templates[0],skin=sectorSkin[t.id]||'default';
 const project={schema:2,id:id(),name:t.name,templateId:t.id,templateRevision:3,width:1920,height:1080,theme:t.theme,background:{type:t.id==='agriculture'?'bokeh':t.id==='industry'?'grid':t.id==='campus'?'stars':'mesh',color:'',image:'',opacity:t.id==='industry'?.13:.25,density:36,speed:.25},filters:{glow:0,vignette:.15,brightness:1,contrast:1,saturation:1,hue:0,matrix:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0]},fit:'contain',grid:true,snap:true,nodes:[],assets:[],updatedAt:Date.now(),variables:{region:t.id==='city'?'全市':t.id==='agriculture'?'全农场':t.id==='industry'?'全工厂':'全园区',period:'今日'},access:{mode:'public'}};
 if(t.id==='blank')return project;
 const node=(type,x,y,w,h,props={},style={},rows)=>{const n=createNode(type,{x,y,w,h});Object.assign(n.props,{chartDesign:skin},props);n.name=props.title||n.name;Object.assign(n.style,{skin,radius:skin==='botanical'?22:skin==='orbital'?18:skin==='precision'?3:5,border:skin==='command'?'corners':'glass',bgOpacity:skin==='precision'?78:62,padding:24},style);if(rows)n.data.rows=rows;project.nodes.push(n);return n;};
 const naked={background:false,border:'none',skin:'default',padding:0};
 const text=(x,y,w,h,content,size=14,color='')=>node('text',x,y,w,h,{text:content}, {...naked,fontSize:size,color});
 const header=node('header',0,0,1920,146,{preset:t.header,text:t.id==='regions'?'寰域 · 全域巡检运营调度中心':t.id==='gis'?'澜图 · 智慧水域空间监测中心':t.id==='machine'?'风擎 · 传动系统数字孪生实验室':t.id==='city'?'智慧城市 · 全域运行指挥中心':t.id==='industry'?'NEXUS · 智能制造协同中枢':t.id==='campus'?'星屿 · 未来园区运营中心':t.id==='global'?'全球网络智能指挥中心':'禾境 · 智慧农业生态管理中心',subtitle:t.en,titleSize:t.id==='industry'?32:34},{...naked,skin});
 // Every template is a native, editable composition. No dashboard is flattened into an image.
 const metric=(x,y,w,h,title,value,unit,decimals=0,extra={})=>node('number',x,y,w,h,{title,value,unit,decimals,trend:.8,compact:h<110,...extra},{padding:['precision','command'].includes(skin)?16:18,bgOpacity:35});
 const scene=(x,y,w,h,camera,target,title,code,note)=>node(t.scene==='globe'?'globe':'scene',x,y,w,h,{variant:t.scene,showPOI:true,showHUD:true,sceneStyle:skin,sceneTitle:title,sceneCode:code,sceneNote:note,autoRotate:false,energy:true,camera,target,fov:36,ambient:t.id==='agriculture'?2.3:1.7,directional:t.id==='agriculture'?3.2:3.8},{...naked,skin});
 const link=(world,target)=>world.events=[{id:id(),on:'click',action:'filter',target:target.id,key:'name',value:'$region'}];
 const hours=['00:00','04:00','08:00','12:00','16:00','20:00','24:00'];
 if(t.id==='city'){
  text(52,145,650,24,'SHANGHAI / 上海    31.2304° N · 121.4737° E',13,'#83afcf');text(1408,145,462,24,'● 全域感知在线     /     城市运行平稳',13,'#83afcf');
  [['城市运行指数',98.6,'分',1],['在线感知设备',36892,'个',0],['今日服务人次',128680,'人',0],['事件处置效率',99.2,'%',1]].forEach((m,i)=>metric(48+i*462,188,438,120,...m,{prefix:'0'+(i+1),trend:[.8,2.6,3.2,.6][i]}));
  node('area',48,336,376,298,{title:'城市脉搏',subtitle:'服务响应 / 活跃感知 · 24 HOURS',seriesName:'今日',secondaryName:'昨日'}, {},points(hours,[128,154,246,218,292,258,306],[96,126,184,175,217,201,236]));
  const district=node('hbar',48,658,376,350,{title:'重点区域运行指数',subtitle:'DISTRICT PERFORMANCE',legend:false,chartPalette:'mono'}, {},points(['浦东新区','黄浦区','徐汇区','静安区','长宁区'],[98.6,97.4,95.8,94.6,92.3]));
  const world=scene(448,330,1024,504,[66,54,68],[0,5,0],'上海 · 城市数字底座','DIGITAL TWIN / 01','交通路网  ·  感知网络  ·  智慧楼宇');link(world,district);
  node('bar',448,858,1024,150,{title:'全域感知活跃度',subtitle:'',legend:false,grid:false,seriesName:'感知事件'}, {padding:18,bgOpacity:26},points(Array.from({length:24},(_,i)=>String(i).padStart(2,'0')),Array.from({length:24},(_,i)=>26+Math.round((Math.sin(i*.7)+1)*21+(i%5)*5))));
  node('donut',1496,336,376,298,{title:'城市感知网络',subtitle:'36,892 个感知节点',centerLabel:'感知类型',centerValue:'4',ringStyle:'segmented'}, {},points(['视频感知','环境监测','市政设施','公共安全'],[16428,8642,7822,4000]));
  node('table',1496,658,376,350,{title:'城市事件动态',subtitle:'EVENT STREAM / LIVE',rows:5,listName:'事件 / 区域',listValue:'处置状态'}, {},[{name:'市政设施巡检',status:'已处置',time:'14:32'},{name:'交通路口疏导',status:'处理中',time:'14:28'},{name:'滨江水质监测',status:'已处置',time:'14:26'},{name:'公共区域安防',status:'已处置',time:'14:23'},{name:'管网压力复核',status:'待复核',time:'14:21'},{name:'重点建筑消防',status:'已处置',time:'14:18'}]);
 }else if(t.id==='agriculture'){
  text(56,151,850,26,'VERDANT FIELD LAB    /    崇明生态示范区',14,'#a5c7a3');text(1440,151,420,26,'晴  24.6°C    ·    东南风 2 级',14,'#c9d3ae');
  metric(56,202,340,138,'作物健康指数',98.6,'%',1,{prefix:'HEALTH',trend:1.2});metric(56,360,340,138,'在管高标准农田',12680,'亩',0,{prefix:'FIELD',trend:2.6});metric(56,518,340,138,'精准灌溉效率',96.2,'%',1,{prefix:'WATER',trend:3.4});
  text(72,686,310,52,'●  36 个监测点在线\n土壤墒情适宜 · 作物长势优良',14,'#91b39a');
  scene(426,192,1438,548,[28,27,32],[0,.6,0],'禾境 · 生态数字农场','ECOSYSTEM / A-01','智慧温室 24.6°C     /     土壤湿度 72%     /     水质达标');
  node('radar',56,766,510,242,{title:'农田生态评价',subtitle:'土壤 · 水分 · 光照 · 生长',legend:false,radarMax:100}, {},points(['土壤肥力','水分平衡','光照条件','作物长势','生态活力'],[89,94,86,98,91]));
  node('area',590,766,684,242,{title:'水肥调度曲线',subtitle:'用水量 m³ / 灌溉计划 · 今日',seriesName:'实际用水',secondaryName:'计划用水'}, {},points(hours,[68,52,148,102,178,126,88],[82,64,160,128,188,144,98]));
  node('bar',1298,766,566,242,{title:'种植结构与收获预期',subtitle:'预估产量 · 吨',legend:false,seriesName:'预估产量'}, {},points(['有机水稻','精品果蔬','生态玉米','其他作物'],[286,194,148,82]));
 }else if(t.id==='industry'){
  text(48,145,880,24,'FACTORY 01    /    柔性智造示范工厂    /    SHIFT A · 08:00—20:00',13,'#b8aa96');text(1390,145,482,24,'● 产线运行中    PLC / MES / SCADA',13,'#e2ba83');
  scene(48,188,1190,562,[34,31,38],[0,1,0],'柔性制造 · 全流程数字车间','CELL 01 / ASSEMBLY','装配 → 视觉检测 → 精密加工 → AGV 物流');
  metric(1262,188,294,102,'今日完成产量',24860,'件',0,{prefix:'OUTPUT',trend:6.2});metric(1578,188,294,102,'产品一次合格率',99.4,'%',1,{prefix:'YIELD',trend:.4});metric(1262,310,294,102,'设备在线率',98.8,'%',1,{prefix:'ONLINE',trend:1.2});metric(1578,310,294,102,'当前产线节拍',24.8,'秒',1,{prefix:'TAKT',trend:-2.6});
  node('gauge',1262,436,294,314,{title:'设备综合效率',subtitle:'OEE / TARGET 95%',value:96.8,gaugeStyle:'instrument',legend:false}, {},[{name:'OEE',value:96.8}]);
  node('heatmap',1578,436,294,314,{title:'设备负荷矩阵',subtitle:'设备 × 生产时段',xCategories:['08','10','12','14','16','18'],yCategories:['CNC','装配','检测','物流'],legend:false}, {},Array.from({length:24},(_,i)=>({x:i%6,y:Math.floor(i/6),value:38+((i*17+31)%61)})));
  node('stack',48,774,566,234,{title:'产线班次产能',subtitle:'实际产出 / 待完成 · 件',seriesName:'已完成',secondaryName:'待完成',smooth:false}, {},points(['线体 A','线体 B','线体 C','线体 D','线体 E'],[4860,5120,4680,5360,4840],[620,280,540,180,460]));
  node('table',638,774,600,234,{title:'工单与设备实时工况',subtitle:'MACHINE STATUS / LIVE',rows:3,listName:'设备 / 工单',listValue:'当前工况'}, {},[{name:'CNC-01 精密加工中心',status:'运行中',time:'8,600 rpm'},{name:'ARM-06 自动装配单元',status:'运行中',time:'24.8 s'},{name:'AGV-03 物流机器人',status:'配送中',time:'电量 86%'},{name:'QC-02 视觉检测单元',status:'运行中',time:'99.4%'}]);
  node('sankey',1262,774,610,234,{title:'工厂能源流向',subtitle:'ENERGY FLOW / kWh',legend:false}, {},[{source:'总配电',target:'精密加工',value:486},{source:'总配电',target:'自动装配',value:328},{source:'总配电',target:'动力系统',value:186},{source:'精密加工',target:'有效作业',value:420},{source:'自动装配',target:'有效作业',value:302},{source:'动力系统',target:'公用设施',value:186}]);
 }else if(t.id==='campus'){
  text(48,149,850,25,'STAR ISLAND    /    上海 · 张江科技园',14,'#b6adcd');text(1440,149,432,25,'● 空间感知在线    /    LOW CARBON CAMPUS',13,'#b6adcd');
  metric(48,204,280,148,'在园实时人数',12860,'人',0,{prefix:'PEOPLE',trend:4.6});metric(48,376,280,148,'入驻科创企业',186,'家',0,{prefix:'COMPANY',trend:2.8});metric(48,548,280,148,'今日清洁发电',3280,'kWh',0,{prefix:'ENERGY',trend:8.6});
  text(64,732,248,56,'✦  低碳运行 365 天\n今日减排 1.86 吨 CO₂',14,'#b0a1ca');
  const world=scene(350,186,1138,622,[34,30,40],[0,2,0],'星屿 · 连通未来的空间','SPATIAL OS / CONNECTED','楼宇管理     /     空间运营     /     低碳能源');
  metric(1512,204,360,124,'智慧空间使用率',92.6,'%',1,{prefix:'OCCUPANCY',compact:true,trend:2.1});
  node('donut',1512,352,360,274,{title:'今日到访构成',subtitle:'VISITOR INSIGHTS',centerLabel:'今日到访',centerValue:'2,408',ringStyle:'soft'}, {},points(['企业访客','商务活动','公共服务'],[1428,620,360]));
  const buildings=node('hbar',1512,650,360,358,{title:'楼宇空间活力',subtitle:'BUILDING OCCUPANCY / %',legend:false}, {},points(['科创总部','研发中心','活力中心','共享实验室','人才公寓'],[96.2,92.8,88.6,86.4,81.3]));link(world,buildings);
  node('table',48,832,558,176,{title:'园区服务动态',subtitle:'',rows:2,listName:'服务事项',listValue:'进展'}, {},[{name:'科创总部 · 空间预约',status:'已确认',time:'14:32'},{name:'研发中心 · 会议服务',status:'服务中',time:'14:28'},{name:'北区停车场 · 车位引导',status:'运行正常',time:'14:26'}]);
  node('line',630,832,858,176,{title:'园区人流与空间热度',subtitle:'',seriesName:'实时人流',secondaryName:'昨日同期',grid:false}, {},points(hours,[126,84,468,342,526,386,174],[108,72,386,298,428,306,142]));
 }else if(t.id==='regions'){
  text(48,149,900,24,'NATIONAL OPERATIONS / 全域协同    ·    真实行政边界 / 演示业务数据',12,'#709abc');
  [['累计巡检里程',56797,'km'],['今日巡检任务',216,'件'],['在线巡检车辆',210,'辆']].forEach((m,i)=>metric(466+i*336,188,312,108,...m,0,{prefix:'0'+(i+1),compact:true}));
  const world=scene(432,316,1060,516,[0,61,53],[0,0,0],'中国 · 全域巡检网络','REGIONAL TWIN / CN','行政区矢量挤出 / 点击区域查看指标');Object.assign(world.props,{geoCountry:'china',geoRegion:'all',geoDepth:1.8,showHUD:false,energy:false,material:'metal'});
  node('donut',48,188,360,300,{title:'巡检事件分类',subtitle:'EVENT DISTRIBUTION',centerLabel:'事件总量',centerValue:'47,625'}, {},points(['设备异常','道路异常','设施维护','安全巡检'],[42,28,18,12]));
  node('area',48,512,360,282,{title:'巡检里程与事件',subtitle:'近 7 日 / km',seriesName:'里程',secondaryName:'事件'}, {},points(['周一','周二','周三','周四','周五','周六','周日'],[28,35,32,46,38,56,42],[18,24,21,32,27,38,34]));
  node('ranking',48,818,360,190,{title:'区域覆盖',rows:3}, {},points(['华东运营区','华南运营区','西南运营区'],[98.6,96.8,94.2]));
  node('bar',1516,188,356,270,{title:'巡检车型分析',subtitle:'FLEET COMPOSITION',legend:false}, {},points(['无人车','有人车','无人机','巡逻艇'],[95,97,324,56]));
  node('gauge',1516,482,356,238,{title:'任务完成率',subtitle:'MISSION COMPLETION',value:96.8}, {},[{name:'完成率',value:96.8}]);
  node('table',1516,744,356,264,{title:'车辆实时工况',rows:4,listName:'车辆 / 区域',listValue:'状态'}, {},[{name:'沪 AC6503 / 上海',status:'巡检中',time:'14:32'},{name:'京 AC6506 / 北京',status:'待命',time:'14:31'},{name:'川 AG2109 / 成都',status:'巡检中',time:'14:29'},{name:'粤 AB0328 / 深圳',status:'已归队',time:'14:26'}]);
  node('table',432,856,518,152,{title:'事件告警列表',rows:2}, {},[{name:'路面设施复核 / 华东',status:'已处理',time:'14:32'},{name:'设备离线提醒 / 华北',status:'待复核',time:'14:28'}]);
  node('table',974,856,518,152,{title:'车辆调度动态',rows:2}, {},[{name:'沪 AC6503 · 滨江巡检',status:'运行正常',time:'14:32'},{name:'粤 AB0328 · 港区调度',status:'已归队',time:'14:29'}]);
 }else if(t.id==='gis'){
  project.background={...project.background,type:'grid',opacity:.12};
  [['养殖水面',1200,'亩'],['在线监测点',68,'个'],['水质达标率',96.8,'%'],['预计年产量',860,'吨'],['今日投饵量',12.6,'吨'],['当日综合能耗',4820,'kWh']].forEach((m,i)=>metric(40+i*308,180,288,104,...m,i===2||i===4?1:0,{compact:true,prefix:'0'+(i+1)}));
  node('line',40,308,394,326,{title:'水质综合态势',subtitle:'溶解氧 mg/L / 目标曲线',seriesName:'实时溶解氧',secondaryName:'目标曲线'}, {},points(hours,[6.2,6.5,6.4,6.8,6.7,7.1,6.9],[5.4,5.6,5.9,6.2,6.5,6.4,6.6]));
  node('ranking',40,658,394,350,{title:'监测站点健康度',subtitle:'SENSOR HEALTH / DEMO',rows:5}, {},points(['水面监测站 A','增氧监测站 B','水质监测站 C','排水监测站 D','入海监测站 E'],[99.8,98.6,97.9,96.2,95.4]));
  node('map',458,308,986,482,{showTitle:false,mapEngine:'leaflet',tileLayer:'satellite',lat:21.193,lng:110.573,zoom:14.2,gisOverlays:true,sceneTitle:'湛江 · 养殖水域空间感知'},{...naked},[{name:'水面监测站 A',lat:21.194,lng:110.566,value:26.4,oxygen:6.8,status:'运行正常',radius:260},{name:'增氧监测站 B',lat:21.202,lng:110.578,value:26.2,oxygen:7.1,status:'运行正常',radius:220},{name:'排水监测站 C',lat:21.184,lng:110.581,value:27.1,oxygen:5.9,status:'待复核',radius:190}]);
  node('bar',458,814,568,194,{title:'产量与长势分析',subtitle:'预估产量 / 吨',legend:false}, {},points(['3 月','4 月','5 月','6 月','7 月','8 月'],[32,48,64,76,86,104]));
  node('donut',1050,814,394,194,{title:'投入品消耗结构',centerLabel:'万元',centerValue:'86.4',legend:false}, {},points(['饲料','电力','水处理','苗种'],[42,28,18,12]));
  node('donut',1468,308,404,280,{title:'设备运行状态',subtitle:'在线率 95.6%',centerLabel:'设备总数',centerValue:'68'}, {},points(['正常运行','待机设备','离线告警'],[54,11,3]));
  node('heatmap',1468,612,404,184,{title:'水域感知矩阵',legend:false,xCategories:['A','B','C','D'],yCategories:['水温','溶氧','酸碱']}, {},Array.from({length:12},(_,i)=>({x:i%4,y:Math.floor(i/4),value:60+i*3})));
  node('table',1468,820,404,188,{title:'业务演示事件',rows:3}, {},[{name:'水质巡检完成',status:'已处理',time:'14:26'},{name:'投饵计划优化',status:'已处理',time:'13:48'},{name:'溶解氧偏低提醒',status:'待复核',time:'11:20'}]);
 }else if(t.id==='machine'){
  project.background={...project.background,type:'plain',color:'#070d1a',opacity:.1};project.theme='glacier';
  text(48,149,960,24,'DRIVETRAIN / WT-G1029    ·    永磁直驱传动系统    ·    实时工况为演示数据',12,'#889aaf');
  const world=scene(390,188,1094,820,[-39,26,47],[-1,5,0],'G1029 · 传动总成','MECHANICAL TWIN / CUTAWAY','旋转观察 / 点击部件查看详情');Object.assign(world.props,{material:'metal',energy:false,showHUD:true,sceneStyle:'precision',machineCutaway:true,machineRunning:true,showPOI:false});
  [['有功功率',1563,'kW'],['主轴转速',18.6,'rpm'],['环境温度',18,'°C'],['轴承温度',42.8,'°C']].forEach((m,i)=>metric(48,188+i*152,318,128,...m,i===1||i===3?1:0,{prefix:['POWER','SPEED','AMBIENT','BEARING'][i],trend:[2.1,.4,-.2,.6][i]}));
  node('table',48,820,318,188,{title:'机组基础信息',rows:3,listName:'参数',listValue:'值'}, {},[{name:'机组编号',status:'G1029',time:'01'},{name:'额定功率',status:'2.5 MW',time:'02'},{name:'并网状态',status:'运行正常',time:'03'}]);
  metric(1508,188,364,112,'今日发电量',7.2,'MWh',1,{prefix:'ENERGY TODAY',compact:true});
  node('area',1508,324,364,270,{title:'发电功率趋势',subtitle:'24 HOURS / kW',seriesName:'实际功率',secondaryName:'理论功率'}, {},points(hours,[520,680,860,1210,1420,1563,1480],[580,720,940,1260,1520,1640,1580]));
  node('gauge',1508,618,364,232,{title:'发电机效率',subtitle:'GENERATOR EFFICIENCY',value:98.4}, {},[{name:'效率',value:98.4}]);
  node('table',1508,874,364,134,{title:'传动系统诊断',rows:2}, {},[{name:'振动监测',status:'1.2 mm/s',time:'正常'},{name:'润滑油压',status:'3.6 bar',time:'正常'}]);
 }else{
  [['全球节点可用率',99.9,'%',1],['在线网络节点',36892,'个',0],['今日数据流量',128680,'TB',0],['全球服务覆盖',186,'个',0]].forEach((m,i)=>metric(64+i*450,180,430,110,...m,{prefix:'0'+(i+1)}));
  node('area',64,332,405,276,{title:'网络流量趋势',subtitle:'GLOBAL TRAFFIC'}, {},points(hours,[128,186,164,278,243,326,292]));
  const regions=node('hbar',64,636,405,338,{title:'区域网络可用率'}, {},points(['亚太','欧洲','美洲','大洋洲'],[99.8,99.6,99.2,99.7]));link(scene(488,288,944,686,[25,12,34],[0,0,0],'全球智能网络','GLOBAL COMMAND','亚太 / 欧洲 / 美洲 / 大洋洲'),regions);
  node('donut',1451,332,405,276,{title:'网络资源分布',centerLabel:'服务节点'}, {},points(['亚太','欧洲','美洲','大洋洲'],[420,320,260,180]));node('ranking',1451,636,405,338,{title:'全球服务质量',rows:4}, {},points(['上海','新加坡','伦敦','纽约'],[99.8,99.6,99.2,99.1]));
 }
 text(52,1030,1390,24,'●  演示数据    /    THREE-DIMENSIONAL INTELLIGENCE    /    点击场景标签查看区域详情',12);node('clock',1550,1028,318,28,{showTitle:false},{...naked,fontSize:14});
 return project;
}
