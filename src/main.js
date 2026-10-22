import {routePath} from './paths.js';
import {createApp} from 'vue';
const path=routePath();
async function mount(){
 let component;
 if(path==='/'||path==='/studio'){
  document.title='Astra Studio · 可视化大屏工作台';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#f6f7f9');
  document.querySelector('meta[name="description"]')?.setAttribute('content','自由设计数据大屏。组件、数据、三维场景与交互，尽在 Astra Studio。');
  component=(await import('./workbench/Workbench.vue')).default;
 }else if(path.startsWith('/templates/')){
  document.querySelector('meta[name="description"]')?.setAttribute('content','四种行业，四种视觉语言。全屏预览城市、农业、工业和园区大屏，一键进入可视化编辑器。');
  component=(await import('./workbench/TemplateShowcase.vue')).default;
 }else if(path.startsWith('/view/')||path==='/player'){
  document.title='Astra View · 数据大屏';
  component=(await import('./workbench/Viewer.vue')).default;
 }else if(path==='/header-studio'){
  document.title='Header Studio · 可视化大屏标题设计器';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#f5f6f8');
  document.querySelector('meta[name="description"]')?.setAttribute('content','可视化设计大屏 Header：精选背景、SVG 流光绘制、实时预览和 Vue 组件导出。');
  component=(await import('./studio/Studio.vue')).default;
 }else if(path==='/demo01'){
  document.title='禾境 · 智慧农业生态管理中心';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#091810');
  document.querySelector('meta[name="description"]')?.setAttribute('content','智慧农业生态管理中心，实时三维农场、作物监测、精准灌溉与农事管理演示。');
  component=(await import('./demos/Agriculture.vue')).default;
 }else if(path==='/demo02'){
  document.title='NEXUS · 智慧工业数字运营中心';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#10151b');
  document.querySelector('meta[name="description"]')?.setAttribute('content','智慧工业数字运营中心，三维生产车间、机械臂与输送线仿真、设备效率与能源监测演示。');
  component=(await import('./demos/Industry.vue')).default;
 }else if(path==='/demo03'){
  document.title='星屿 · 智慧园区运营中心';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#070a1c');
  component=(await import('./demos/Park.vue')).default;
 }else{
  await import('./style.css');
  component=(await import('./App.vue')).default;
 }
 createApp(component).mount('#app');
}
mount().catch(error=>{console.error('Application startup failed',error);document.getElementById('app').textContent='页面加载失败，请检查网络后刷新。';});
