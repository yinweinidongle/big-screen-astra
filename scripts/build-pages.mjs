import {spawnSync} from 'node:child_process';
import {rm,mkdir,writeFile} from 'node:fs/promises';

const base=process.env.PAGES_BASE_PATH || '/big-screen-astra/';
if(!/^\/(?:[a-zA-Z0-9._-]+\/)*$/.test(base))throw Error('PAGES_BASE_PATH must be / or /repository-name/');
await rm('dist/pages',{recursive:true,force:true});
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir','dist/pages','--base',base],{stdio:'inherit',env:{...process.env,VITE_STATIC_MODE:'true'}});
if(result.status!==0)process.exit(result.status||1);
await mkdir('dist/pages',{recursive:true});
await writeFile('dist/pages/.nojekyll','');
console.log(`GitHub Pages static build ready at dist/pages (base: ${base}).`);
