import {createApp} from 'vue';
const path=window.location.pathname.replace(/\/+$/,'')||'/';
async function mount(){
 let component;
 if(path==='/demo01'){
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
mount().catch(()=>{document.getElementById('app').textContent='页面加载失败，请检查网络后刷新。';});
