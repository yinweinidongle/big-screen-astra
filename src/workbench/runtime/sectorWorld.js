import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Small batched overlays retain the original scenes' instanced/merged geometry.
export function addSectorWorld(model,kind,props,theme){
 const group=new THREE.Group();group.name='sector-presentation';model.root.add(group);const color=theme.accent,tracks=[],markers=[];
 const material=new THREE.LineBasicMaterial({color,transparent:true,opacity:kind==='agriculture'?.18:.32,depthWrite:false});
 const line=points=>{const mesh=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),material);mesh.raycast=()=>{};group.add(mesh);return mesh;};
 const v=(x,y,z)=>new THREE.Vector3(x,y,z);
 const curve=(a,b,lift=9)=>{const middle=a.clone().add(b).multiplyScalar(.5);middle.y+=lift;const path=new THREE.QuadraticBezierCurve3(a,middle,b);line(path.getPoints(72));tracks.push(path);};
 if(kind==='city'){
  for(const z of [-17,-9,9,17])line([v(-31,.2,z),v(31,.2,z)]);
  for(const x of [-25,-15,15,25])line([v(x,.2,-22),v(x,.2,22)]);
  curve(v(-22,2,14),v(6,24,-8),12);curve(v(6,24,-8),v(24,3,10),10);curve(v(-6,19,-8),v(-24,3,-16),8);
  for(const z of [-17,17])for(const x of [-25,25]){const r=new THREE.Mesh(new THREE.RingGeometry(1.25,1.34,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.set(x,.22,z);r.raycast=()=>{};group.add(r);}
 }else if(kind==='agriculture'){
  for(let j=0;j<5;j++){const pts=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2,rx=18+j*1.1,rz=13.4+j*.7;pts.push(v(Math.cos(a)*rx,.05-j*.1,Math.sin(a)*rz+Math.sin(a*4)*.3));}line(pts);}
  curve(v(11,2,5),v(-10,.8,5),3.5);curve(v(11,2,5),v(2,1,-6),4);
 }else if(kind==='industry'){
  const segments=[];for(const x of [-18.5,18.5])for(const z of [-14.5,14.5]){segments.push(v(x,.2,z),v(x,5,z),v(x,5,z),v(x-Math.sign(x)*2.2,5,z),v(x,5,z),v(x,5,z-Math.sign(z)*2.2));}
  const rig=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segments),material);group.add(rig);
  for(const z of [-4,5]){const p=new THREE.LineCurve3(v(-13,1.3,z),v(13,1.3,z));tracks.push(p);}
 }else if(kind==='park'){
  for(const [a,b] of [[[5,10.5,-4],[-6,7.5,-4]],[[-6,7.5,-4],[-6,4.5,5]],[[-6,4.5,5],[6,5.5,5]],[[6,5.5,5],[5,10.5,-4]]])curve(v(...a),v(...b),4);
  for(const r of [21,22.5]){const pts=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;pts.push(v(Math.cos(a)*r,-.5,Math.sin(a)*r*.76));}const orbit=line(pts);orbit.material=material.clone();orbit.material.opacity=.2;}
 }
 const dotGeo=new THREE.SphereGeometry(kind==='city'?.16:.1,8,6),dotMat=new THREE.MeshBasicMaterial({color:kind==='agriculture'?'#e8e5ad':color});
 tracks.forEach((path,i)=>{const dot=new THREE.Mesh(dotGeo,dotMat);dot.raycast=()=>{};group.add(dot);markers.push({dot,path,offset:i*.23});});
 const flowTime={value:0};
 const flowMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{flowTime,tint:{value:new THREE.Color(kind==='agriculture'?'#d9edb4':color)}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 v;uniform float flowTime;uniform vec3 tint;void main(){float u=fract(v.x-flowTime*.13);float head=exp(-pow((u-.72)*54.,2.));float tail=pow(clamp(1.-(.72-u)*3.2,0.,1.),2.)*step(u,.72);float edge=pow(max(0.,sin(v.y*3.14159)),.6);gl_FragColor=vec4(mix(tint,vec3(1.),head*.8)*(1.+head),edge*(.035+tail*.25+head*.8));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const tubes=tracks.map(path=>new THREE.TubeGeometry(path,72,kind==='industry'?.04:.032,5,false));if(tubes.length){const mesh=new THREE.Mesh(mergeGeometries(tubes,false),flowMaterial);tubes.forEach(g=>g.dispose());mesh.raycast=()=>{};group.add(mesh);}
 let survey;
 if(kind==='city'||kind==='industry'){
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},tint:{value:new THREE.Color(color)}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:kind==='city'?'varying vec2 v;uniform float time;uniform vec3 tint;void main(){float r=length((v-.5)*vec2(1.35,1.));float b=pow(max(0.,1.-abs(r-mod(time*.045,.9))*90.),2.);gl_FragColor=vec4(tint,b*.28);}':'varying vec2 v;uniform float time;uniform vec3 tint;void main(){float b=pow(max(0.,1.-abs(v.x-mod(time*.045,1.))*80.),2.);float d=step(.5,fract(v.y*34.));gl_FragColor=vec4(tint,b*.22+d*.008);}'});
  survey=new THREE.Mesh(new THREE.PlaneGeometry(kind==='city'?76:38,kind==='city'?58:29),mat);survey.rotation.x=-Math.PI/2;survey.position.y=kind==='city'?.08:.22;survey.raycast=()=>{};group.add(survey);
 }
 const update=model.update.bind(model);model.update=(t,running)=>{update(t,running);group.visible=props.energy;if(!running)return;flowTime.value=props.shader?t:0;markers.forEach(({dot,path,offset})=>dot.position.copy(path.getPoint((t*(kind==='industry'?.12:.08)+offset)%1)));if(survey)survey.material.uniforms.time.value=props.shader?t:0;};
 return model;
}
