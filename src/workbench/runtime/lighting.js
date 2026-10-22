import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export function createStudioEnvironment(renderer,quality){const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);try{return pmrem.fromScene(room,.04,.1,100,{size:quality==='high'?256:quality==='performance'?64:128});}finally{room.dispose();pmrem.dispose();}}
export function lightWorld(scene,renderer,props,theme,environment){
 const farm=props.variant==='agriculture',city=props.variant==='city',park=props.variant==='park';scene.environment=environment?.texture||null;scene.environmentIntensity=props.reflectionIntensity??.6;scene.fog=new THREE.FogExp2(theme.bg,city?.0038:.0025);renderer.toneMappingExposure=props.exposure??1.12;
 const ambient=new THREE.AmbientLight(farm?'#e2ecd3':'#b4ccdf',props.ambient*.3),key=new THREE.DirectionalLight(farm?'#ffe8bc':park?'#dce9ff':'#e6f2ff',props.directional);key.position.set(farm?-12:-18,city?52:32,city?34:22);
 const hemi=new THREE.HemisphereLight(farm?'#cfe8db':'#b6d8ef',farm?'#23382a':'#0a1427',.8),rim=new THREE.DirectionalLight(farm?'#83cbb5':park?'#9c82f1':'#66b4dc',farm?.65:1.0);rim.position.set(18,12,-24);scene.add(ambient,key,hemi,rim);
 renderer.shadowMap.enabled=props.shadows!==false&&props.quality!=='performance';renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;key.castShadow=renderer.shadowMap.enabled;key.shadow.mapSize.setScalar(props.quality==='high'?2048:1024);const span=city?46:24;Object.assign(key.shadow.camera,{left:-span,right:span,top:span,bottom:-span,near:1,far:city?155:100});key.shadow.camera.updateProjectionMatrix();key.shadow.bias=-.00018;key.shadow.normalBias=.045;key.shadow.radius=2;
 return {ambient,key};
}
