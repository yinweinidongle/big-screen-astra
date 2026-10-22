<script setup>
import {sitePath} from '../paths.js';

import {computed,ref} from 'vue';
import {Sprout,Leaf,Droplets,Sun,Wind,ArrowUpRight,ChevronRight,MapPin,Expand,Plus,Minus,RotateCcw,Play,Pause,Layers,CloudSun,Radio,Check,CalendarDays,X,Target,ScanLine} from 'lucide-vue-next';
import SvgFlowRails from '../components/SvgFlowRails.vue';
import SceneViewport from './components/SceneViewport.vue';import MiniChart from './components/MiniChart.vue';import {useDashboard} from './useDashboard';import './shared.css';import './agriculture.css';
const {active,running,rotate,layer,view,zoom,reset,selected,period,toast,time,date,weekday,full,home,notify}=useDashboard();
const sections=['农场总览','作物监测','智慧灌溉','农事管理'];const zones=ref('全部地块');const irrigating=ref(false);const taskDone=ref(false);
const zoneData=computed(()=>zones.value==='全部地块'?['2,860','96.8','328.6','128']:zones.value==='A区 · 设施种植'?['680','98.2','96.4','42']:['2,180','96.3','232.2','86']);
const yieldValues=computed(()=>period.value==='今日'?[32,36,34,49,52,61,58,70,74,78,83,92]:[42,51,47,62,57,68,66,76,82,87,92,98]);
const cropTitle=computed(()=>['作物生长监测','作物长势分析','土壤墒情监测','农事任务进度'][active.value]);
function changeSection(i){active.value=i;layer.value=i===1?'crops':i===2?'infrastructure':'all';if(i===3)notify('农事计划已显示，可确认完成巡检任务')}
function irrigate(){irrigating.value=!irrigating.value;notify(irrigating.value?'A01 地块模拟灌溉已启动':'A01 地块模拟灌溉已停止')}
</script>
<template>
<div class="demo-app agri-app">
<header class="agri-header">
 <svg class="agri-header-art" viewBox="0 30 2172 620" preserveAspectRatio="none" aria-hidden="true">
  <defs>
   <linearGradient id="agri-tail-feather"><stop stop-color="white" stop-opacity="0"/><stop offset=".28" stop-color="white" stop-opacity=".2"/><stop offset=".65" stop-color="white" stop-opacity=".65"/><stop offset=".88" stop-color="white"/><stop offset=".95" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
   <linearGradient id="agri-background-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".75" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
   <mask id="agri-background-mask"><rect x="0" y="30" width="2172" height="620" fill="url(#agri-background-fade)"/></mask>
   <path id="agri-vein-rail" vector-effect="non-scaling-stroke" d="M-40 413C160 263 333 464 608 558S938 614 1090 608"/>
   <mask id="agri-vein-mask" maskUnits="userSpaceOnUse" x="-120" y="200" width="1350" height="450"><rect class="agri-vein-window" x="-360" y="200" width="340" height="450" fill="url(#agri-tail-feather)"/></mask>

  </defs>
  <image :href="sitePath('/assets/agriculture-header.png')" width="2172" height="724" opacity=".8" mask="url(#agri-background-mask)"/>
  <g class="agri-vein-light" mask="url(#agri-vein-mask)">
   <use class="agri-vein-halo" href="#agri-vein-rail"/><use class="agri-vein-core" href="#agri-vein-rail"/>
  </g>
  <g transform="translate(2172 0) scale(-1 1)">
   <g class="agri-vein-light" mask="url(#agri-vein-mask)"><use class="agri-vein-halo" href="#agri-vein-rail"/><use class="agri-vein-core" href="#agri-vein-rail"/></g>
  </g>
  <SvgFlowRails :paths="['M28 435C241 346 383 547 714 586','M2144 435C1931 346 1789 547 1458 586']" :nodes="[[608,558],[1564,558]]" color="#c5e8a6" :duration="7" :delay="-1.8" :secondary="true"/>
  <g class="agri-center-bloom" fill="none" stroke="#e2dea2" stroke-width=".7"><path d="M1034 631Q1086 620 1138 631M1050 640Q1086 631 1122 640" vector-effect="non-scaling-stroke"/><path d="M1086 620Q1076 608 1067 614Q1074 624 1086 620Q1098 624 1105 614Q1096 608 1086 620" fill="#d1dfad" fill-opacity=".25"/></g>
 </svg>
 <div class="agri-brand"><span><Sprout :size="23" :stroke-width="1.4"/></span><div><strong>禾境 <i>AGRIVERSE</i></strong><p>数字农业 · 生长有迹</p></div></div>
 <div class="agri-title"><span>PRECISION AGRICULTURE OBSERVATORY</span><h1>智慧农业生态管理中心</h1><p><i></i>以科技，耕耘每一寸生机<i></i></p></div>
 <div class="agri-header-right"><CloudSun :size="24" :stroke-width="1.3"/><div class="agri-weather">24°C<small>晴朗 · 宜农事</small></div><div class="agri-clock num">{{time}}<small>{{date}} · {{weekday}}</small></div><button class="icon-button" @click="full" aria-label="切换全屏"><Expand :size="16"/></button></div>
</header>
<nav class="agri-nav" aria-label="农业主题"><div><i class="live-led"></i> 生态运行良好 <span>生长季 · 第 128 天</span></div><div class="agri-tabs"><button v-for="(tab,i) in sections" :class="{active:active===i}" @click="changeSection(i)"><component :is="[Sprout,Leaf,Droplets,CalendarDays][i]" :size="14"/>{{tab}}</button></div><span class="agri-online"><Radio :size="13"/> 感知网络已连接</span></nav>
<main class="agri-layout">
 <aside class="agri-side">
  <section class="agri-panel farm-overview"><div class="agri-panel-title"><h2><Sprout :size="15"/>农场概况</h2><span>01 / OVERVIEW</span></div><div class="farm-name"><div><small>长三角生态农业示范基地</small><h3>崇明 · 未来农场</h3><p><MapPin :size="11"/>上海市崇明区 · 东平镇</p></div><div class="farm-emblem"><Leaf :size="30" :stroke-width="1.2"/></div></div><div class="farm-overview-stats"><div><span>种植地块</span><strong class="num">32<small>块</small></strong></div><div><span>作物品种</span><strong class="num">12<small>种</small></strong></div><div><span>绿色认证</span><strong class="num">100<small>%</small></strong></div></div><div class="agri-mini-status"><i class="live-led"></i>全周期数字化管理已覆盖<Check :size="12"/></div></section>
  <section class="agri-panel crop-panel"><div class="agri-panel-title"><h2><Leaf :size="15"/>{{cropTitle}}</h2><span>02 / GROWTH</span></div><div class="crop-health"><div class="agri-ring"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="45" fill="none" stroke="#233e2e" stroke-width="5"/><circle cx="55" cy="55" r="45" fill="none" stroke="#b4ce8c" stroke-width="5" stroke-dasharray="265 283" transform="rotate(-90 55 55)"/><circle cx="55" cy="55" r="36" fill="none" stroke="#547548" stroke-width=".6" stroke-dasharray="1 5"/></svg><div><strong class="num">{{active===2?'72.4':'96.8'}}<small>%</small></strong><span>{{active===2?'土壤含水率':'健康作物占比'}}</span></div></div><div class="crop-health-copy"><span class="agri-badge">{{active===2?'墒情适宜':'长势优良'}}</span><p>较上周提升</p><strong class="num">2.6<small>%</small><ArrowUpRight :size="14"/></strong></div></div><div class="crop-bars"><div v-for="(c,i) in [{name:'优良',value:86.4,color:'#b6ce8c'},{name:'正常',value:10.4,color:'#699c81'},{name:'待关注',value:3.2,color:'#c4a969'}]"><span><i :style="{background:c.color}"></i>{{c.name}}</span><div><b :style="{width:c.value+'%',background:c.color}"></b></div><strong class="num">{{c.value}}<small>%</small></strong></div></div></section>
  <section class="agri-panel water-panel"><div class="agri-panel-title"><h2><Droplets :size="15"/>智慧水肥管理</h2><span>03 / IRRIGATION</span></div><div class="water-total"><div><small>今日精准灌溉用水</small><strong class="num">{{irrigating?'1,249.6':'1,248.2'}}<span>m³</span></strong></div><span>↓ 18.6%<small>较传统灌溉</small></span></div><div class="water-rows"><div><span>水资源利用率</span><b class="num">92.6%</b><i style="--progress:92.6%"></i></div><div><span>肥料精准配比</span><b class="num">98.2%</b><i style="--progress:98.2%"></i></div></div><button class="agri-action" :class="{activated:irrigating}" @click="irrigate"><Droplets :size="13"/><span>{{irrigating?'A01 灌溉中 · 点击停止':'启动 A01 智能灌溉'}}</span><component :is="irrigating?Pause:ChevronRight" :size="13"/></button></section>
 </aside>
 <section class="agri-center">
  <div class="agri-kpis"><div v-for="(k,i) in [{name:'智慧种植面积',unit:'亩'},{name:'作物健康指数',unit:'%'},{name:'预计本季产量',unit:'吨'},{name:'在线感知设备',unit:'台'}]"><span>{{k.name}}</span><strong class="num">{{zoneData[i]}}<small>{{k.unit}}</small></strong><p><i class="live-led"></i>{{['全域动态感知','优于区域均值','同比增长 12.8%','设备在线率 99.2%'][i]}}</p></div></div>
  <div class="agri-stage"><div class="agri-stage-heading"><div><span class="agri-dot-grid">⠿</span><b>农场数字孪生</b><small>DIGITAL FARMLAND</small></div><select v-model="zones" aria-label="选择农业区域"><option>全部地块</option><option>A区 · 设施种植</option><option>B区 · 大田种植</option></select></div><div class="agri-coordinate">31°37′ N &nbsp; 121°29′ E <span>实时场景 · 崇明基地</span></div>
   <SceneViewport kind="agriculture" :rotate="rotate" :running="running" :layer="layer" :view="view" :zoom="zoom" :reset="reset" @select="selected=$event"/>
   <div class="agri-stage-tools"><button class="icon-button" @click="zoom++" aria-label="放大场景"><Plus :size="16"/></button><button class="icon-button" @click="zoom--" aria-label="缩小场景"><Minus :size="16"/></button><button class="icon-button" @click="home" aria-label="重置视角"><RotateCcw :size="15"/></button></div>
   <div v-if="selected" class="scene-detail"><div><strong>{{selected.name}}</strong><button @click="selected=null" aria-label="关闭详情"><X :size="16"/></button></div><p>{{selected.detail}}</p></div>
   <div class="agri-stage-bottom"><div class="scene-controls"><button :class="{active:rotate}" @click="rotate=!rotate"><RotateCcw :size="12"/>环绕视角</button><button :class="{active:view==='top'}" @click="view=view==='top'?'perspective':'top'"><ScanLine :size="12"/>俯瞰</button><button @click="running=!running"><component :is="running?Pause:Play" :size="12"/>{{running?'暂停':'运行'}}</button></div><span>拖动旋转 · 滚轮缩放</span></div>
  </div>
  <section class="agri-panel agri-yield"><div class="agri-panel-title"><h2>生长趋势与产能预测 <span class="agri-badge">AI 洞察</span></h2><div class="agri-period"><button v-for="p in ['今日','本周']" :class="{active:period===p}" @click="period=p">{{p}}</button></div></div><div class="agri-yield-content"><div class="yield-insight"><span>本季预计增产</span><strong class="num">12.8<small>%</small><ArrowUpRight :size="18"/></strong><p>光温条件适宜，作物生长<br/>高于历史同期水平。</p></div><div class="yield-chart"><MiniChart :values="yieldValues" :compare="true" :labels="['06:00','09:00','12:00','15:00','18:00','21:00']"/></div></div></section>
 </section>
 <aside class="agri-side agri-right">
  <section class="agri-panel environment-card"><div class="agri-panel-title"><h2><Sun :size="15"/>田间微气候</h2><span>04 / CLIMATE</span></div><div class="climate-grid"><div v-for="c in [{name:'空气温度',value:'24.6',unit:'°C',icon:Sun,note:'适宜 18–28°C'},{name:'空气湿度',value:'68.2',unit:'%',icon:Droplets,note:'适宜 60–80%'},{name:'光照强度',value:'28,640',unit:'lux',icon:CloudSun,note:'光照充足'},{name:'风速',value:'2.4',unit:'m/s',icon:Wind,note:'东南风 · 微风'}]"><component :is="c.icon" :size="16" :stroke-width="1.3"/><span>{{c.name}}</span><strong class="num">{{c.value}}<small>{{c.unit}}</small></strong><p><i></i>{{c.note}}</p></div></div></section>
  <section class="agri-panel soil-card"><div class="agri-panel-title"><h2><Layers :size="15"/>土壤生命力</h2><span>05 / SOIL</span></div><div class="soil-score"><div><span>土壤综合健康评分</span><strong class="num">92<small>/100</small></strong></div><div class="soil-orbits"><span></span><span></span><Sprout :size="27" :stroke-width="1.3"/></div></div><div class="soil-nutrients"><div v-for="n in [{name:'氮 N',value:'128',w:76},{name:'磷 P',value:'42',w:58},{name:'钾 K',value:'186',w:87}]"><span>{{n.name}}</span><div><i :style="{width:n.w+'%'}"></i></div><strong class="num">{{n.value}}<small>mg/kg</small></strong></div></div><div class="soil-ph"><span>土壤酸碱度</span><b class="num">pH 6.8</b><span class="agri-badge">适宜</span></div></section>
  <section class="agri-panel farm-plans"><div class="agri-panel-title"><h2><CalendarDays :size="15"/>今日农事计划</h2><span class="num">{{taskDone?'03':'02'}} / 03</span></div><div class="farm-plan"><span class="plan-icon done"><Check :size="12"/></span><div><strong>晨间土壤与墒情巡检</strong><p>08:00 · 全域 32 个地块</p></div><span>已完成</span></div><div class="farm-plan"><span class="plan-icon done"><Check :size="12"/></span><div><strong>温室精准水肥补给</strong><p>10:30 · A01–A06 温室</p></div><span>已完成</span></div><button class="farm-plan" @click="taskDone=true;notify('巡检任务已确认完成')"><span class="plan-icon" :class="{done:taskDone}"><component :is="taskDone?Check:Target" :size="12"/></span><div><strong>无人机作物长势巡检</strong><p>15:00 · B区大田种植区</p></div><span>{{taskDone?'已完成':'确认完成'}}</span></button><div class="plan-footer"><i class="live-led"></i>{{taskDone?'今日农事计划已全部完成':'今日农事按计划有序进行'}}</div></section>
 </aside>
</main>
<footer class="demo-footer"><div><i class="live-led"></i>生态感知网络正常<span>·</span>最近同步 {{time}}</div><nav aria-label="切换大屏"><a :href="sitePath('/')">智慧城市</a><a :href="sitePath('/demo01')" class="current">智慧农业</a><a :href="sitePath('/demo02')">智慧工业 ↗</a><a :href="sitePath('/demo03/')">智慧园区 ↗</a></nav><div><span class="demo-note">演示数据</span>AGRIVERSE · DIGITAL NATURE</div></footer><div class="demo-toast" v-if="toast" role="status">{{toast}}</div>
</div>
</template>
