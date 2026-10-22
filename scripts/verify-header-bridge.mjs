import assert from 'node:assert/strict';
import {writeFile,rm} from 'node:fs/promises';
import {createServer} from 'vite';
import {createSSRApp,createRenderer,h,nextTick} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {makeConfig,presets,validateConfig} from '../src/studio/presets.js';
import {createNode,themeById} from '../src/workbench/catalog.js';
import {makeProject} from '../src/workbench/templates.js';
import {applyHeaderConfig,resolveHeaderConfig,headerPreset} from '../src/workbench/header.js';
import {validateProject,projectForExport} from '../src/workbench/schema.js';
import {useStudio} from '../src/studio/useStudio.js';

const node=createNode('header');node.props.text='原有大屏标题';node.props.subtitle='EXISTING';node.props.titleSize=42;node.style.color='#aabbcc';node.style.fontFamily='monospace';node.style.fontWeight=700;
const legacy=resolveHeaderConfig(node);assert.equal(legacy.title,node.props.text);assert.equal(legacy.fontSize,42);assert.equal(legacy.titleColor,'#aabbcc');assert.equal(legacy.fontWeight,700);
const config=makeConfig(presets[4]);Object.assign(config,{title:'完整联动 <设计>',fontSize:46,fontFamily:'serif',fontWeight:300,titleGradient:true,titleGradientTo:'#66ffbb',textGlow:4,bgOpacity:0,fit:'contain',subtitleOffset:47,subtitleOpacity:.4});
config.background.opacity=.35;config.lines[0].points[0].y=52;config.lines[0].effect='phantom';
applyHeaderConfig(node,config);assert.equal(node.props.text,config.title);assert.deepEqual(resolveHeaderConfig(node),config);config.title='外部草稿变化';assert.notEqual(resolveHeaderConfig(node).title,config.title,'Apply must detach draft references');
const project=makeProject('blank');project.nodes=[node];assert.deepEqual(validateProject(projectForExport(project)).nodes[0].props.headerConfig,node.props.headerConfig,'Project import/export must preserve complete composition');
const switched=headerPreset(node.props.headerConfig,presets[1]);assert.equal(switched.title,node.props.headerConfig.title);assert.equal(switched.subtitle,node.props.headerConfig.subtitle);assert.deepEqual(switched.lines,presets[1].lines);
const pages=makeConfig();pages.background.url='/big-screen-astra'+pages.background.url;assert.equal(validateConfig(pages).background.url,makeConfig().background.url,'Old Pages paths must migrate to portable assets');
for(const url of ['javascript:alert(1)','//evil.test/assets/a.png','https://evil.test/a.png','/../assets/a.png'])assert.throws(()=>validateConfig({...makeConfig(),background:{...makeConfig().background,url}}));
const malformed=structuredClone(project);malformed.nodes[0].props.headerConfig.lines[0].points[0].x=Infinity;assert.throws(()=>validateProject(malformed));
const writes=[];globalThis.localStorage={getItem:()=>JSON.stringify(makeConfig(presets[2])),setItem:(...args)=>writes.push(args)};
let studio;const renderer=createRenderer({createElement:()=>({}),insert(){},remove(){},createText:()=>({}),createComment:()=>({}),setText(){},setElementText(){},parentNode(){},nextSibling(){},patchProp(){}});
const app=renderer.createApp({setup(){studio=useStudio({initialConfig:node.props.headerConfig,persist:false,preserveContent:true});return()=>h('div');}});app.mount({});
assert.equal(studio.config.value.title,node.props.headerConfig.title,'Embedded editor must ignore standalone draft');studio.config.value.title='未提交输入';assert(studio.canUndo.value);studio.undo();assert.equal(studio.config.value.title,node.props.headerConfig.title);studio.redo();assert.equal(studio.config.value.title,'未提交输入');studio.choosePreset(presets[3]);assert.equal(studio.config.value.title,'未提交输入');await nextTick();app.unmount();assert.equal(writes.length,0,'Embedded editor must not overwrite standalone localStorage draft');
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
const exportedFile=new URL('../src/__verify_header_bridge.vue',import.meta.url);
try{
 const {componentSource}=await server.ssrLoadModule('/src/studio/export.js');
 const Widget=(await server.ssrLoadModule('/src/workbench/components/WidgetView.vue')).default;
 const Renderer=(await server.ssrLoadModule('/src/studio/HeaderRenderer.vue')).default;
 const c=node.props.headerConfig,source=componentSource(c);assert(!source.includes("from '../paths.js'"),'Downloaded Vue component must be independent of Astra source');
 await writeFile(exportedFile,source);const Exported=(await server.ssrLoadModule('/src/__verify_header_bridge.vue')).default;
 const outputs=await Promise.all([renderToString(createSSRApp(Widget,{node,rows:[],theme:themeById('midnight'),playing:false})),renderToString(createSSRApp(Renderer,{config:c,playing:false})),renderToString(createSSRApp(Exported,{playing:false}))]);
 const paths=html=>[...html.matchAll(/<path[^>]*\sd="([^"]*)"/g)].map(m=>m[1]);for(const html of outputs){assert.deepEqual(paths(html),paths(outputs[0]));assert(html.includes('font-family="serif"'));assert(html.includes('font-size="46"'));assert(html.includes('font-weight="300"'));assert(html.includes('data-effect="phantom"'));assert(html.includes('xMidYMid meet'));assert(html.includes('drop-shadow'));assert(html.includes('完整联动 &lt;设计&gt;'));assert(html.includes('stop-color="#66ffbb"'));assert(!html.includes('aw-dashboard-title'));}
 console.log('Header bridge: legacy migration, complete project round-trip, safe portable assets, isolated drafts, pending-input undo, content-preserving presets, and widget/designer/export render parity passed.');
}finally{await rm(exportedFile,{force:true});await server.close();delete globalThis.localStorage;}
