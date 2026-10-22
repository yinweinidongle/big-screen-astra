import 'ses';
import {createSceneProgram} from './scene-core.js';
lockdown({errorTaming:'unsafe',stackFiltering:'verbose'});
let program;
self.postMessage({type:'boot'});
self.onmessage=e=>{const {id,type,workspace,context,time,delta,event}=e.data;try{if(type==='build'){program=createSceneProgram(workspace,context,Compartment);self.postMessage({id,type:'built',json:program.json,stats:program.stats,logs:program.logs,dynamic:program.dynamic});}else if(type==='context'){program?.context(context);}else if(type==='tick'||type==='event'){const patch=type==='tick'?program.update(time,delta):program.event(event);self.postMessage({id,type:'patch',...patch});}}catch(error){self.postMessage({id,type:'error',message:error.message,stack:String(error.stack||'').split('\n').filter(s=>s.includes('astra-code/')).slice(0,4).join('\n')});}};
