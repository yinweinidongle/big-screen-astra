import {mkdir,writeFile} from 'node:fs/promises';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createPrefab} from '../src/workbench/scene/prefabs.js';
import {disposeObject} from '../src/workbench/runtime/world.js';
// GLTFExporter consumes browser FileReader; these procedural models have no images.
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(value=>{this.result='data:application/octet-stream;base64,'+Buffer.from(value).toString('base64');this.onloadend?.();});}};
await mkdir('public/assets/models',{recursive:true});
for(const kind of ['pump','robot','charger']){const {root}=createPrefab(kind);root.updateMatrixWorld(true);const glb=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});await writeFile(`public/assets/models/${kind}.glb`,Buffer.from(glb));disposeObject(root);console.log(`${kind}.glb: ${glb.byteLength} bytes`);}
