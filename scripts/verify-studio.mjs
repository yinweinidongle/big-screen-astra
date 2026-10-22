import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {parse,compileScript,compileTemplate} from '@vue/compiler-sfc';
import {writeFile,mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {makeConfig,validateConfig,presets} from '../src/studio/presets.js';
import contours from '../src/studio/generatedContours.json' with {type:'json'};
import {effectIds,lineEffects,effectSegments,segmentDash,segmentStyle} from '../src/studio/lineEffects.js';
import {createSSRApp} from 'vue';
import {renderToString} from 'vue/server-renderer';
import {pathData,mirrored} from '../src/studio/geometry.js';
import {trimLinePaths} from '../src/studio/pathTrimming.js';
import {lineRadius} from '../src/studio/lineEffects.js';
const server=await createServer({server:{middlewareMode:true},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
try{
 const {componentSource,makeZip}=await server.ssrLoadModule('/src/studio/export.js');
 for(const preset of presets){
  const config=makeConfig(preset);assert.deepEqual(validateConfig(config),config,`${preset.id}: import differs from exported config`);
  const source=componentSource(config,'header-background.png'),{descriptor,errors}=parse(source);assert.equal(errors.length,0);const compiled=compileScript(descriptor,{id:'test-header'});const template=compileTemplate({source:descriptor.template.content,filename:'DashboardHeader.vue',id:'test-header',compilerOptions:{bindingMetadata:compiled.bindings}});assert.equal(template.errors.length,0);assert(source.includes("import headerBackground from './header-background.png'"));assert(!source.includes("from './geometry'"));
 }
 for(const preset of presets.filter(p=>p.fresh)){
  const bytes=await readFile(new URL('../public'+preset.background.url,import.meta.url));assert.equal(bytes.readUInt32BE(16),preset.background.width);assert.equal(bytes.readUInt32BE(20),preset.background.height);
  assert(preset.thumbnail);assert((await readFile(new URL('../public'+preset.thumbnail,import.meta.url))).length<60000);
  for(const [i,rail] of Object.values(contours[preset.id].rails).entries()){
   assert(rail.maxDeviation<=.56,`${preset.id}: contour simplification drift`);assert(rail.meanRimBrightness>200,`${preset.id}: trace left luminous edge`);assert(rail.points.length>=2&&rail.points.length<=200);assert.equal(preset.lines[i].mirror,false);
  }
 }
 const trail={effect:'trail',width:1.7,tail:250,duration:7.5};const tail=effectSegments(trail);assert(tail.length>=20);for(const segment of tail){const style=segmentStyle(trail,segment);assert.equal(parseFloat(style['--offset-start'])-parseFloat(style['--offset-end']),1250,'Tail must completely leave before looping');}assert(tail[0].opacity<.01,'Trailing end must fade out');
 const Renderer=(await server.ssrLoadModule('/src/studio/HeaderRenderer.vue')).default;
 const crossingConfig=makeConfig();const base=crossingConfig.lines[0];crossingConfig.lines=[{...base,id:'main',mirror:false,effect:'static',points:[{x:0,y:160},{x:1600,y:160}]},{...base,id:'crossing',mirror:false,effect:'phantom',kind:'curve',points:[{x:100,y:20},{x:500,y:100},{x:900,y:250}]}];
 const resolved=trimLinePaths(crossingConfig.lines,lineRadius);assert(resolved[1].paths[0].trimmed);
 const exportedFile=new URL('../src/studio/__verify_export.vue',import.meta.url);try{
  const generated=componentSource(crossingConfig);assert(!generated.includes("from './pathTrimming'"));assert(!generated.includes("from './geometry.js'"));await writeFile(exportedFile,generated);
  const Exported=(await server.ssrLoadModule('/src/studio/__verify_export.vue')).default;
  const live=await renderToString(createSSRApp(Renderer,{config:crossingConfig,playing:false})),delivered=await renderToString(createSSRApp(Exported,{playing:false}));
  const paths=html=>[...html.matchAll(/<path[^>]*\sd="([^"]*)"/g)].map(m=>m[1]);assert.deepEqual(paths(live),paths(delivered),'Downloaded component must render the same clipped trajectories');assert(paths(live).includes(resolved[1].paths[0].d));
 }finally{await rm(exportedFile,{force:true})}
 assert(effectIds.length>=10);assert.equal(new Set(effectIds).size,effectIds.length);
 const signatures=new Set();
 for(const effect of lineEffects){
  const config=makeConfig();Object.assign(config.lines[0],{effect:effect.id,width:effect.width,tail:effect.tail,duration:effect.duration,glow:effect.glow});
  assert.equal(validateConfig(config).lines[0].effect,effect.id,`${effect.id}: config import dropped effect`);
  const segments=effectSegments(config.lines[0]);assert(segments.length>0&&segments.length<=32);signatures.add(JSON.stringify(segments));
  for(const segment of segments){const style=segmentStyle(config.lines[0],segment);assert(Number.isFinite(parseFloat(style['--offset-start'])));assert(Number.isFinite(parseFloat(style['--offset-end'])));assert(segment.width>0);assert(segment.opacity>0&&segment.opacity<=1);const dash=segmentDash(segment);if(dash)assert(dash.split(' ').every(n=>Number(n)>=0));}
  const source=componentSource(config);const {descriptor,errors}=parse(source);assert.equal(errors.length,0);const compiled=compileScript(descriptor,{id:'effect-'+effect.id});const template=compileTemplate({source:descriptor.template.content,filename:'DashboardHeader.vue',id:'effect-'+effect.id,compilerOptions:{bindingMetadata:compiled.bindings}});assert.equal(template.errors.length,0);assert(!source.includes("from './lineEffects'"));
  const html=await renderToString(createSSRApp(Renderer,{config,playing:false}));assert(html.includes(`data-effect="${effect.id}"`));assert(!html.includes('NaN'));if(effect.id==='ripple')assert(html.includes('header-node-ripple'));
 }
 assert(signatures.size>=12,'Effect presets do not have enough distinct visual structures');
 const legacy=makeConfig();for(const id of ['comet','pulse','dash','static']){legacy.lines[0].effect=id;assert.equal(validateConfig(legacy).lines[0].effect,id)}
 const config=makeConfig();config.title='中文标题 </script> & "quoted"';const source=componentSource(config);const {descriptor,errors}=parse(source);assert.equal(errors.length,0);compileScript(descriptor,{id:'test-escape'});
 assert.throws(()=>validateConfig({...makeConfig(),lines:[{points:[{x:Infinity,y:0},{x:0,y:0}]}]}));assert.throws(()=>validateConfig({...makeConfig(),background:{url:'javascript:alert(1)'}}));
 const pts=[{x:0,y:10},{x:300,y:40},{x:700,y:10}];assert.equal(pathData(pts),'M0 10L300 40L700 10');assert(pathData(pts,'curve').includes('C'));assert.deepEqual(mirrored(mirrored(pts)),pts);
 const root=await mkdtemp(join(tmpdir(),'header-studio-'));try{const zip=makeZip([{name:'组件.vue',content:source},{name:'binary.bin',content:new Uint8Array([0,1,2,255])}]);const file=join(root,'export.zip');await writeFile(file,new Uint8Array(await zip.arrayBuffer()));const output=execFileSync('unzip',['-t',file],{encoding:'utf8'});assert(output.includes('No errors'));}finally{await rm(root,{recursive:true,force:true})}
 console.log('Header Studio: '+presets.length+' background presets, '+effectIds.length+' effect round-trips and SSR renders, distinct visual structures, legacy compatibility, exported Vue compilation, geometry and ZIP integrity passed.');
}finally{await server.close()}
