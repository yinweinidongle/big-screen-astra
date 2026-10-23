import * as THREE from 'three';
import {loadRegions,projectRegions} from '../../scene/geography.js';
export {projectRegions} from '../../scene/geography.js';
export async function buildRegions(scene,p,theme){
 const regions=projectRegions(await loadRegions(p.geoCountry),p.geoRegion||'all'),root=new THREE.Group(),time={value:0},labels=[],surfaces=[],records=[];scene.add(root);
 const depth=Math.max(.3,Math.min(5,Number(p.geoDepth)||1.8)),accent=new THREE.Color(theme.accent);
 const side=new THREE.MeshStandardMaterial({color:'#103651',metalness:.65,roughness:.28,emissive:accent,emissiveIntensity:.12});
 const border=new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.9});
 for(let i=0;i<regions.length;i++){
  const r=regions[i],group=new THREE.Group();root.add(group);const top=new THREE.MeshStandardMaterial({color:new THREE.Color(p.material==='white'?'#d6e5ef':'#255d82').lerp(accent,.1+(i%5)*.055),metalness:.45,roughness:.4,emissive:accent,emissiveIntensity:p.material==='energy'?.45:.07,transparent:p.material==='glass',opacity:p.material==='glass'?.58:1,depthWrite:p.material!=='glass'});
  if(p.shader)top.onBeforeCompile=s=>{s.uniforms.geoTime=time;s.fragmentShader='uniform float geoTime;\n'+s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=vec3(.2,.6,.8)*pow(max(0.,1.-abs(mod(vViewPosition.y+geoTime*2.,28.)-14.)*.7),5.)*.35;');};
  for(const rings of r.polygons){
   const shape=new THREE.Shape(rings[0].map(v=>new THREE.Vector2(...v)));for(const hole of rings.slice(1))shape.holes.push(new THREE.Path(hole.map(v=>new THREE.Vector2(...v))));
   const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1,curveSegments:1}),mesh=new THREE.Mesh(g,[top,side]);mesh.rotation.x=-Math.PI/2;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.poi={name:r.name,value:96.2+(i%7)*.4,unit:'运行指数',region:r.name,description:'行政区矢量边界 · 指标为演示数据'};group.add(mesh);surfaces.push({mesh,top});
   for(const ring of rings)group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ring.map(([x,y])=>new THREE.Vector3(x,depth+.035,-y))),border));
  }
  const box=new THREE.Box3().setFromObject(group),pos=box.getCenter(new THREE.Vector3());pos.y=depth+1.4;
  records.push({name:r.name,group,defaultValue:96.2+(i%7)*.4});
  if(['上海','北京','四川','广东','浙江','新疆','湖北'].includes(r.name)||regions.length===1||['Tokyo','Osaka Prefecture','Hokkaido','Fukuoka Prefecture'].includes(r.name))labels.push({id:'geo-'+i,...surfaces.at(-1).mesh.userData.poi,position:pos});
 }
 const base=new THREE.Mesh(new THREE.CircleGeometry(39,100),new THREE.MeshStandardMaterial({color:'#051826',roughness:.65,metalness:.35,transparent:true,opacity:.8}));base.rotation.x=-Math.PI/2;base.position.y=-.8;root.add(base);
 const grid=new THREE.GridHelper(76,38,accent,accent);grid.material.transparent=true;grid.material.opacity=.07;grid.position.y=-.7;root.add(grid);
 for(const radius of [33,36,38]){const pts=Array.from({length:181},(_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/90)*radius,-.6,Math.sin(i*Math.PI/90)*radius));root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:radius===36?.22:.08})));}
 return {root,labels,setData(rows=[],fields={name:'name',value:'value'}){const byName=new Map(rows.map(r=>[String(r[fields.name]||r.region||''),r]));for(const record of records){const row=byName.get(record.name),value=Number(row?.[fields.value]),patch={value:Number.isFinite(value)?value:record.defaultValue,unit:String(row?.unit||'运行指数')};record.group.traverse(o=>{if(o.userData.poi)Object.assign(o.userData.poi,patch);});const label=labels.find(l=>l.name===record.name);if(label)Object.assign(label,patch);}},home:[0,61,53],target:[0,0,0],update(t){time.value=t;}};
}
