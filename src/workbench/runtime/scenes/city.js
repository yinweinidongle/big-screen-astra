import {THREE,DetailBatch,vec,rng,metal,glow,instances,contactShadows,facadeMaterial,waterMaterial} from './detailKit.js';
export function buildDetailedCity(scene,props,theme){
 const root=new THREE.Group();root.name='metropolitan-digital-twin';scene.add(root);const clock={value:0},b=new DetailBatch(root),steel=metal('#526f84',.34,.68),concrete=metal('#253f51',.75,.2),road=metal('#0d1e2b',.82,.1),trim=glow('#85d4f2',.38),warm=glow('#e0bc7e',.45),glass=props.material==='white'?metal('#b6cfde',.6,.12):facadeMaterial('#2c566f',theme.accent,clock,{floor:1.5,window:.5,warm:.3});
 b.box(0,-.65,0,73,1,55,metal('#122a3c',.45,.5),true);b.box(0,-.12,0,71,.14,53,road);
 // A road hierarchy with river setbacks, sidewalks and a lit waterfront.
 for(const x of [-30,-20,-10,0,10,20,30]){b.box(x,.005,0,1.35,.05,51,road);for(const side of [-1,1])b.box(x+side*.84,.08,0,.16,.12,51,concrete);for(let z=-24;z<25;z+=2.6)b.box(x,.046,z,.035,.015,.7,trim);}
 for(const z of [-20,-10,10,20]){b.box(0,.015,z,69,.06,1.25,road);for(const side of [-1,1])b.box(0,.08,z+side*.8,69,.12,.15,concrete);for(let x=-33;x<34;x+=2.6)b.box(x,.055,z,.7,.015,.035,trim);}
 const riverZ=x=>Math.sin(x*.08)*5.3;
 const riverGeo=new THREE.PlaneGeometry(71,5.8,120,6),a=riverGeo.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)+riverZ(a.getX(i)));riverGeo.computeVertexNormals();const river=new THREE.Mesh(riverGeo,waterMaterial(clock));river.rotation.x=-Math.PI/2;river.position.y=.08;river.receiveShadow=true;root.add(river);
 for(const side of [-1,1]){const points=Array.from({length:70},(_,i)=>{const x=-35+i*70/69;return [x,.19,riverZ(x)+side*3.12];});b.pipe(points,.08,concrete);b.pipe(points.map(p=>[p[0],.24,p[2]+side*.12]),.022,trim);}
 const plots=[],shadows=[];let index=0;
 for(let ix=0;ix<40;ix++)for(let iz=0;iz<27;iz++){
  const x=-33.15+ix*1.7,z=-24.7+iz*1.9,s=index++;
  if(Math.abs(x-Math.round(x/10)*10)<1.6||Math.abs(z-Math.round(z/10)*10)<1.5||Math.abs(z-riverZ(x))<4.4||Math.hypot(x-6,z+9)<8||rng(s)<.02)continue;
  const h=2.3+rng(s+700)*7.5+(Math.abs(x)<18?1.6:0),w=1.0+rng(s+20)*.45,d=1.12+rng(s+40)*.5;
  plots.push({p:[x,h/2,z],s:[w,h,d],color:props.material==='white'?'#e0edf2':['#294b62','#355c73','#254a66','#456375'][s%4],h,x,z,w,d});shadows.push([x,.13,z,w*2.2,d*2.2]);
 }
 const towers=instances(root,new THREE.BoxGeometry(1,1,1),glass,plots,{cast:true,name:'city-buildings'});towers.userData.instances=plots.map((p,i)=>({name:'智慧楼宇 '+String(i+1).padStart(3,'0'),value:92+rng(i)*7.8,unit:'运行指数',region:['浦东新区','黄浦区','徐汇区','静安区','长宁区'][i%5],position:vec(p.x,p.h,p.z)}));
 const rooftop=[];plots.forEach((p,i)=>{b.box(p.x,p.h+.06,p.z,p.w*1.05,.12,p.d*1.05,steel);if(i%3===0)b.box(p.x,p.h+.25,p.z,p.w*.46,.32,p.d*.48,concrete);if(i%5===0)b.box(p.x,p.h*.35,p.z,p.w*1.18,.14,p.d*1.18,concrete);if(i%4===0)rooftop.push({p:[p.x,p.h+.48,p.z],s:[.07,.07,.07]});});
 instances(root,new THREE.SphereGeometry(1,6,4),glow('#b1efff',1),rooftop,{name:'rooftop-beacons'});contactShadows(root,shadows);
 const names=['上海中心','东方明珠','环球金融中心'],positions=[[6,-9,24,2.2],[-6,-8,18,1.8],[13,-7,18,2.2]];
 positions.forEach(([x,z,h,w],i)=>{const group=new THREE.Group();group.position.set(x,0,z);group.name=names[i];root.add(group);const lb=new DetailBatch(group),gmat=facadeMaterial(i===0?'#487b98':'#3a5d78',theme.accent,clock,{floor:1.7,window:.46,warm:.14});
  lb.box(0,.5,0,w*2.5,1,w*2.2,concrete,true);lb.box(0,1.2,0,w*2,1,w*1.8,gmat,true);contactShadows(group,[[0,.14,0,w*4,w*3.5]]);
  let body;
  if(i===0){const geo=new THREE.CylinderGeometry(w*.56,w*.95,h,16,32),a=geo.attributes.position;for(let j=0;j<a.count;j++){const y=a.getY(j),angle=(y/h+.5)*1.05,px=a.getX(j),pz=a.getZ(j);a.setXYZ(j,px*Math.cos(angle)-pz*Math.sin(angle),y,px*Math.sin(angle)+pz*Math.cos(angle));}geo.computeVertexNormals();body=new THREE.Mesh(geo,gmat);body.position.y=h/2;
   for(let j=0;j<8;j++){const pts=[];for(let k=0;k<=40;k++){const y=k/40*h,angle=j*Math.PI/4+y/h*1.05,r=w*(.95-.39*y/h)+.025;pts.push([Math.cos(angle)*r,y,Math.sin(angle)*r]);}lb.pipe(pts,.022,trim);}lb.cylinder(0,h+1,0,.07,2.2,trim,.025,8);lb.ring(0,h-1,0,w*.58,.06,warm);
  }else if(i===1){lb.cylinder(0,h*.44,0,.28,h*.87,steel,.2,12);for(const [y,r] of [[h*.25,1.9],[h*.66,1.3],[h*.89,.48]]){lb.add(new THREE.SphereGeometry(r,24,16),gmat,0,y,0);for(const dy of [-.25,.25])lb.ring(0,y+dy,0,Math.sqrt(r*r-dy*dy)+.02,.035,warm);}for(let j=0;j<3;j++){const angle=j/3*Math.PI*2;lb.beam(vec(Math.cos(angle)*1.7,.5,Math.sin(angle)*1.7),vec(Math.cos(angle)*.65,h*.34,Math.sin(angle)*.65),.25,.25,steel);}lb.cylinder(0,h*.98,0,.045,3.4,trim,.018,8);
  }else{const shape=new THREE.Shape();shape.moveTo(-w,1.5);shape.lineTo(w,1.5);shape.lineTo(w*.55,h);shape.lineTo(-w*.55,h);shape.closePath();const hole=new THREE.Path();hole.moveTo(-w*.32,h-2.7);hole.lineTo(-w*.32,h-.8);hole.lineTo(w*.32,h-.8);hole.lineTo(w*.32,h-2.7);hole.closePath();shape.holes.push(hole);const g=new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:false});g.translate(0,0,-w/2);body=new THREE.Mesh(g,gmat);for(const side of [-1,1])lb.beam(vec(side*w,1.5,w/2+.03),vec(side*w*.55,h,w/2+.03),.045,.045,trim);lb.box(0,h-.65,w/2+.03,w*1.16,.07,.07,warm);}
  if(body){body.userData.poi={name:names[i],value:98.6-i,unit:'运行指数',region:['浦东新区','黄浦区','徐汇区'][i]};body.castShadow=true;body.receiveShadow=true;group.add(body);}lb.flush('landmark-structure');
 });
 // Two bridges, a transit ribbon, riverfront landscaping and street furniture.
 for(const x of [-20,20]){const z=riverZ(x);b.box(x,.5,z,2.7,.3,8.2,steel,true);for(const side of [-1,1]){b.box(x+side*1.22,.92,z,.08,.6,8.2,trim);b.beam(vec(x+side*1.1,.65,z-3.7),vec(x+side*.5,3.2,z),.08,.08,steel);b.beam(vec(x+side*.5,3.2,z),vec(x+side*1.1,.65,z+3.7),.08,.08,steel);}}
 const poles=[],crowns=[],lamps=[];for(let i=0;i<54;i++){const x=-33+i*66/53,z=riverZ(x)+(i%2?3.9:-3.9);poles.push({p:[x,.72,z],s:[.035,1.2,.035]});lamps.push({p:[x,1.34,z],s:[.1,.05,.1]});if(i%2===0)crowns.push({p:[x,.8,z+(i%2?1:-1)],s:[.38,.6,.38],color:i%3?'#3e7477':'#527878'});}
 instances(root,new THREE.BoxGeometry(1,1,1),steel,poles,{name:'street-light-poles'});instances(root,new THREE.SphereGeometry(1,8,6),glow('#b7dff2',1.2),lamps,{name:'street-lights'});instances(root,new THREE.IcosahedronGeometry(1,1),metal('#38686d',.9,.05),crowns,{name:'waterfront-trees'});
 const trafficItems=Array.from({length:36},(_,i)=>({p:[-30,.3,-24+i%24*2],s:[.33,.18,.65],color:i%4?'#b7d4e5':'#70c9eb'})),traffic=instances(root,new THREE.BoxGeometry(1,1,1),metal('#a8cfe0',.3,.45),trafficItems,{name:'city-traffic'}),dummy=new THREE.Object3D();traffic.instanceMatrix.setUsage(THREE.DynamicDrawUsage);traffic.frustumCulled=false;
 b.flush('city-infrastructure');root.userData.features=['curtain-wall','tiered-rooftops','waterfront','landmark-architecture','bridges','traffic'];
 const labels=positions.map(([x,z,h],i)=>({id:'city-'+i,name:names[i],value:[98.6,96.4,99.2][i],unit:'运行指数',region:['浦东新区','黄浦区','徐汇区'][i],position:vec(x,h+2,z)}));
 return {root,labels,home:[63,51,65],target:[0,5,0],dynamicShadows:false,update(t,running){if(!running)return;clock.value=props.shader?t:0;for(let i=0;i<trafficItems.length;i++){const x=[-30,-10,10,30][i%4],z=((t*1.6+i*6.1)%48)-24;dummy.position.set(x,.28,z);dummy.scale.set(.32,.19,.65);dummy.rotation.set(0,0,0);dummy.updateMatrix();traffic.setMatrixAt(i,dummy.matrix);}traffic.instanceMatrix.needsUpdate=true;}};
}
