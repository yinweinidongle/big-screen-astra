import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
// Physical HTML entry points also support direct links on static-only hosting.
function demoEntries(){let root;return {name:'demo-static-entries',apply:'build',configResolved(config){root=resolve(config.build.outDir);},async closeBundle(){
 const html=await readFile(resolve(root,'index.html'),'utf8');
 for(const [route,title,description] of [
  ['templates/city','城市运行 · 全域感知','冷蓝全息城市指挥舱，可编辑行业模板。'],
  ['templates/agriculture','禾境生态 · 精准农业','翡翠生态全景农场，可编辑行业模板。'],
  ['templates/industry','工业智造 · 协同中枢','石墨生产控制台，可编辑行业模板。'],
  ['templates/campus','未来园区 · 空间运营','紫银玻璃园区空间看板，可编辑行业模板。'],
  ['templates/regions','寰域 · 全域巡检调度','立体行政区矢量地图，国家、省份与区域交互。'],
  ['templates/gis','澜图 · 水域空间监测','Leaflet 卫星影像、OpenStreetMap 街道与监测点交互。'],
  ['templates/machine','风擎 · 传动系统数字孪生','精细机械总成、剖面拆解与运行监测。'],
  ['studio','Astra Studio · 可视化大屏工作台','自由设计可配置数据大屏。'],
  ['city','上海 · 智慧城市运行中心','原版智慧城市数字孪生演示大屏。'],
  ['player','Astra View · 数据大屏','Astra 交互大屏预览。'],
  ['header-studio','Header Studio · 可视化大屏标题设计器','精选背景与 SVG 光轨编辑，实时预览并下载 Vue 组件。'],
  ['demo01','禾境 · 智慧农业生态管理中心','智慧农业数字孪生大屏：三维农场、作物监测、精准灌溉与农事管理。'],
  ['demo03','星屿 · 智慧园区运营中心','智慧园区数字孪生：园区运营、智慧能源、安防态势与实时三维场景。'],
  ['demo02','NEXUS · 智慧工业数字运营中心','智慧工业数字孪生大屏：三维车间、机械臂与产线仿真、设备效率与能源监测。']
 ]){await mkdir(resolve(root,route),{recursive:true});await writeFile(resolve(root,route,'index.html'),html.replace(/<title>.*?<\/title>/,`<title>${title}</title>`).replace(/(<meta name="description" content=")[^"]*/,`$1${description}`))}
}}}
export default defineConfig({plugins:[vue(),demoEntries()],server:{proxy:{'/api':{target:'http://127.0.0.1:8787',changeOrigin:true,ws:true}}},build:{outDir:'dist/client',rollupOptions:{output:{manualChunks:{three:['three']}}}}});
