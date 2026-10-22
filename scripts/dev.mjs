import {mkdirSync} from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
mkdirSync('dist/client',{recursive:true});
const node=process.execPath,wrangler='node_modules/wrangler/bin/wrangler.js';const migration=spawnSync(node,[wrangler,'d1','migrations','apply','DB','--local','--config','wrangler.local.json'],{stdio:'inherit'});if(migration.status)process.exit(migration.status);
const children=[spawn(node,[wrangler,'dev','--local','--config','wrangler.local.json','--port','8787','--inspector-port','0','--var','LOCAL_DEV:true'],{stdio:'inherit'}),spawn(node,['node_modules/vite/bin/vite.js','--host','0.0.0.0','--force'],{stdio:'inherit'})];let stopping=false;function stop(){if(stopping)return;stopping=true;children.forEach(c=>c.kill('SIGTERM'));setTimeout(()=>process.exit(),100).unref();}process.on('SIGINT',stop);process.on('SIGTERM',stop);children.forEach(c=>c.on('exit',code=>{if(!stopping){stop();process.exitCode=code||0;}}));
