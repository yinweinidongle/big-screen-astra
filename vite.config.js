import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
// Physical HTML entry points also support direct links on static-only hosting.
function demoEntries(){return {name:'demo-static-entries',apply:'build',async closeBundle(){
 const root=resolve('dist'),html=await readFile(resolve(root,'index.html'),'utf8');
 for(const [route,title,description] of [
  ['demo01','禾境 · 智慧农业生态管理中心','智慧农业数字孪生大屏：三维农场、作物监测、精准灌溉与农事管理。'],
  ['demo03','星屿 · 智慧园区运营中心','智慧园区数字孪生：园区运营、智慧能源、安防态势与实时三维场景。'],
  ['demo02','NEXUS · 智慧工业数字运营中心','智慧工业数字孪生大屏：三维车间、机械臂与产线仿真、设备效率与能源监测。']
 ]){await mkdir(resolve(root,route),{recursive:true});await writeFile(resolve(root,route,'index.html'),html.replace(/<title>.*?<\/title>/,`<title>${title}</title>`).replace(/(<meta name="description" content=")[^"]*/,`$1${description}`))}
}}}
export default defineConfig({plugins:[vue(),demoEntries()],build:{rollupOptions:{output:{manualChunks:{three:['three']}}}}});
