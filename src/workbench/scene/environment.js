import * as THREE from 'three';
import {sitePath} from '../../paths.js';
import {skyPresets,normalizeSceneEnvironment} from './environment-config.js';

export class SceneEnvironment{
 constructor(scene,renderer,{fallback,changed=()=>{},status=()=>{},loadTexture,makeEnvironment}={}){this.scene=scene;this.renderer=renderer;this.fallback=fallback;this.changed=changed;this.status=status;this.cache=new Map();this.config=normalizeSceneEnvironment();this.time={value:0};this.generation=0;this.dead=false;this.activeSky='none';this.state='ready';this.loadTexture=loadTexture||(url=>new THREE.TextureLoader().loadAsync(url));this.makeEnvironment=makeEnvironment||(texture=>{const pmrem=new THREE.PMREMGenerator(this.renderer);try{return pmrem.fromEquirectangular(texture);}finally{pmrem.dispose();}});}
 async sync(value,{quality='balanced',reflectionIntensity=.6,bg='#0a1427'}={}){
  this.config=normalizeSceneEnvironment(value);this.quality=quality;this.reflectionIntensity=reflectionIntensity;this.bg=bg;this.apply();
  const id=this.config.sky;if(this.desiredSky!==id){this.desiredSky=id;this.generation++;this.requested='';}
  if(id==='none'){this.generation++;this.requested='';this.activeSky='none';this.scene.background=null;this.scene.environment=this.fallback||null;this.state='ready';this.status('ready','');this.changed();return;}
  if(this.cache.has(id)){this.activate(id);return;}
  if(this.requested===id)return;
  this.requested=id;const generation=++this.generation;this.state='loading';this.status('loading','正在加载天空环境');this.changed();
  let texture,target;
  try{
   texture=await this.loadTexture(sitePath(skyPresets.find(s=>s.id===id).url));
   if(this.dead||generation!==this.generation||id!==this.config.sky){texture.dispose();return;}
   texture.mapping=THREE.EquirectangularReflectionMapping;texture.colorSpace=THREE.SRGBColorSpace;
   target=this.makeEnvironment(texture);
   this.cache.set(id,{texture,target});this.requested='';this.activate(id);
  }catch{texture?.dispose();target?.dispose();if(!this.dead&&generation===this.generation){this.requested='';this.state='error';this.status('error','天空加载失败，请重新选择天空');this.changed();}}
 }
 activate(id){const e=this.cache.get(id);if(!e||this.dead)return;this.activeSky=id;this.scene.background=e.texture;this.scene.environment=e.target.texture;this.apply();this.state='ready';this.status('ready','');this.changed();}
 apply(){
  const c=this.config;this.scene.backgroundIntensity=c.brightness;this.scene.backgroundBlurriness=c.blur;this.scene.backgroundRotation.y=THREE.MathUtils.degToRad(c.rotation);this.scene.environmentRotation.y=THREE.MathUtils.degToRad(c.rotation);this.scene.environmentIntensity=this.reflectionIntensity;
  this.scene.fog=new THREE.FogExp2(c.sky==='none'?this.bg:c.sky==='sunny'?'#b6cedb':c.sky==='rainy'?'#596b78':'#a7b5be',c.fog);
  if(c.sky==='rainy'&&c.rain>0){const count=Math.round((this.quality==='performance'?250:this.quality==='high'?1000:600)*c.rain);if(this.rainCount!==count){this.removeRain();this.rainCount=count;const positions=new Float32Array(count*6);for(let i=0;i<count;i++){const x=Math.sin(i*127.1)*43758.5%1*65,y=(i*7.73)%70,z=Math.sin(i*311.7)*23421.4%1*65;positions.set([x,y,z,x-.12,y-.9,z],i*6);}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:this.time},vertexShader:'uniform float time;varying float fade;void main(){vec3 p=position;p.y=mod(p.y-time*20.0,70.0)-3.0;vec4 mv=modelViewMatrix*vec4(p,1.0);fade=clamp(1.0-length(mv.xyz)/160.0,0.0,1.0);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float fade;void main(){gl_FragColor=vec4(0.67,0.8,0.9,fade*0.42);}'});this.rain=new THREE.LineSegments(geometry,material);this.rain.name='environment-rain';this.rain.frustumCulled=false;this.rain.raycast=()=>{};this.scene.add(this.rain);}}
  else this.removeRain();this.changed();
 }
 telemetry(){return {...this.config,renderedSky:this.activeSky,state:this.state,rainCount:this.rainCount||0};}
 update(time){this.time.value=time;}
 removeRain(){if(this.rain){this.rain.removeFromParent();this.rain.geometry.dispose();this.rain.material.dispose();this.rain=null;}this.rainCount=0;}
 reset(){this.removeRain();this.generation++;this.requested='';this.desiredSky='';this.activeSky='none';this.scene.background=null;this.scene.environment=this.fallback||null;}
 dispose(){this.dead=true;this.reset();for(const {texture,target}of this.cache.values()){texture.dispose();target.dispose();}this.cache.clear();}
}
