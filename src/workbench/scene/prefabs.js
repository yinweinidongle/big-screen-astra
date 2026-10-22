import {THREE,DetailBatch,metal,glow,vec} from '../runtime/scenes/detailKit.js';

export function createPrefab(kind){
 const root=new THREE.Group(),b=new DetailBatch(root);
 const body=metal('#9db7cc',.3,.6),dark=metal('#263947',.5,.65),glass=metal('#4884a8',.18,.7),trim=glow('#9ae1ee',.5),green=metal('#487b60',.7,.1),amber=metal('#d7a360',.3,.6);
 let animate=()=>{},dynamic=false;
 const box=(x,y,z,w,h,d,m=body,rounded=false)=>b.box(x,y,z,w,h,d,m,rounded);
 if(kind==='tower'){
  box(0,.2,0,5.2,.4,4.5,dark);box(0,4,0,4,7.2,3.6,glass);box(0,7.8,0,4.5,.45,4.1,body);box(0,8.15,0,2.4,.4,2,body);box(.8,8.45,0,.7,.25,.8,dark);
  for(let y=1;y<7.8;y+=.7){box(0,y,1.84,4.05,.06,.06,trim);box(0,y,-1.84,4.05,.06,.06,body);box(2.03,y,0,.06,.06,3.7,body);box(-2.03,y,0,.06,.06,3.7,body);}
  for(let x=-1.6;x<2;x+=.8){box(x,4,1.87,.045,7,.04,body);box(x,4,-1.87,.045,7,.04,body);}box(0,.9,1.95,.9,1.4,.2,dark);
 }else if(kind==='warehouse'){
  box(0,.15,0,8,.3,5.5,dark);box(0,1.8,0,7.6,3.1,5,body);box(0,3.5,0,8,.22,5.5,dark);box(0,3.8,0,2,.5,1.5,body);
  for(let x=-3.5;x<4;x+=.6){box(x,3.65,0,.035,.08,5.25,trim);}for(let x of [-2,2]){box(x,1.3,2.56,2,2.3,.12,dark);for(let y=.4;y<2.5;y+=.3)box(x,y,2.64,1.9,.035,.02,body);box(x,2.7,2.65,2.2,.1,.12,amber);}
 }else if(kind==='solar'){
  for(let x of [-1.7,1.7])for(let z of [-1.4,1.4]){box(x,.12,z,2.8,.24,2.4,dark);b.beam(vec(x,.2,z),vec(x,1.5,z+.5),.12,.12,body);const panel=(dx,dy,dz,w,h,d,m)=>b.box(x+dx,1.45+dy*Math.cos(-.2)-dz*Math.sin(-.2),z+dy*Math.sin(-.2)+dz*Math.cos(-.2),w,h,d,m,false,[-.2,0,0]);panel(0,0,0,2.7,.12,2.2,glass);for(let i=-1;i<=1;i++)panel(i*.8,.08,0,.035,.02,2.1,trim);for(let i=-2;i<=2;i++)panel(0,.09,i*.4,2.6,.02,.025,body);}
 }else if(kind==='turbine'){
  b.cylinder(0,.2,0,1,.4,body);b.cylinder(0,4,0,.24,7.6,body,.12);box(0,7.85,0,.65,.6,1.5,body,true);
  const rotor=new THREE.Group();rotor.position.set(0,7.85,1);root.add(rotor);const blades=new DetailBatch(rotor);blades.add(new THREE.SphereGeometry(.23,12,8),dark);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;blades.beam(vec(Math.sin(a)*.15,Math.cos(a)*.15,0),vec(Math.sin(a)*2.8,Math.cos(a)*2.8,0),.2,.08,body);}blades.flush('turbine-rotor');animate=t=>rotor.rotation.z=-t*.65;dynamic=true;
 }else if(kind==='charger'){
  box(0,.12,0,2.8,.24,1.9,dark);box(0,1.65,0,1.35,2.9,.8,body,true);box(0,2.1,.43,.8,.65,.03,glass);box(0,1.4,.45,.8,.1,.04,trim);box(0,3.2,0,1.5,.2,.95,trim,true);
  for(const x of [-.8,.8]){b.pipe([[x,2.5,.2],[x*1.5,1.7,.35],[x*1.4,.65,.35],[x,.8,.2]],.045,dark);box(x,2.35,.15,.16,.45,.16,dark,true);}
 }else if(kind==='robot'){
  box(0,.2,0,3,.4,2.7,dark);b.cylinder(0,.8,0,.7,1.2,amber);b.cylinder(0,1.5,0,.5,.4,body);b.beam(vec(0,1.5,0),vec(0,3.5,-.7),.48,.5,amber);b.add(new THREE.SphereGeometry(.4,12,10),dark,0,3.5,-.7);b.beam(vec(0,3.5,-.7),vec(1.6,4.5,.2),.38,.4,amber);b.add(new THREE.SphereGeometry(.3,12,10),dark,1.6,4.5,.2);b.beam(vec(1.6,4.5,.2),vec(2,4,.8),.24,.25,body);for(const x of [1.7,2.3])box(x,3.7,.8,.12,.5,.3,dark);b.pipe([[0,1.1,.3],[-.4,2,.4],[-.4,3.5,-.2],[1.5,4.7,.4]],.06,dark);
 }else if(kind==='pump'){
  box(0,.15,0,4.5,.3,2.7,dark);box(-.8,.7,0,1.7,.3,1.6,body);b.add(new THREE.CylinderGeometry(.65,.65,1.8,16),body,-.8,1.25,0,[0,0,Math.PI/2]);b.add(new THREE.CylinderGeometry(.8,.8,.55,16),dark,.5,1.2,0,[0,0,Math.PI/2]);b.pipe([[.5,1.2,0],[1.4,1.2,0],[1.6,2.1,0],[1.6,2.7,0]],.22,body);b.ring(1.6,2,0,.35,.07,amber);for(let x=-1.6;x<.1;x+=.2)box(x,1.8,0,.05,.12,.8,dark);box(-1,1.2,.8,.7,.7,.1,trim);
 }else if(kind==='camera'){
  b.cylinder(0,.12,0,.55,.24,dark);b.cylinder(0,3,0,.11,5.8,body);b.beam(vec(0,5.7,0),vec(1,5.7,0),.15,.15,body);box(1.2,5.6,.15,.65,.5,1.3,body,true);box(1.2,5.6,.82,.45,.3,.05,dark);b.add(new THREE.CylinderGeometry(.12,.12,.08,16),glass,1.2,5.6,.88,[Math.PI/2,0,0]);box(1.2,5.9,.1,.85,.08,1.6,dark,true);
 }else if(kind==='tree'){
  box(0,.2,0,3,.4,3,body,true);box(0,.43,0,2.6,.08,2.6,dark);b.cylinder(0,1.8,0,.18,2.8,amber,.12);for(const [x,y,z,r] of [[0,3.7,0,1.25],[-.7,3.1,.3,.85],[.65,3.15,.15,.9],[.1,4.4,-.2,.85]])b.add(new THREE.IcosahedronGeometry(r,1),green,x,y,z);
 }else if(kind==='container'){
  box(0,1.45,0,6,2.9,2.8,amber);for(let x=-2.8;x<=2.8;x+=.35){box(x,1.45,1.43,.06,2.65,.07,dark);box(x,1.45,-1.43,.06,2.65,.07,dark);}for(const z of [-.65,.65]){box(3.06,1.45,z,.06,2.65,1.25,body);box(3.13,1.45,z,.08,2.4,.06,dark);}for(const y of [.08,2.85])box(0,y,0,6.15,.15,2.9,dark);
 }else if(kind==='label'){
  b.cylinder(0,.65,0,.045,1.3,trim);b.add(new THREE.OctahedronGeometry(.3),trim,0,1.45,0);b.ring(0,.08,0,.55,.035,trim);
 }
 b.flush('preset-'+kind);root.name=kind;
 // A material can be shared by multiple merged parts but belongs to this prefab.
 const used=new Set();root.traverse(o=>{if(o.material)used.add(o.material);});for(const m of [body,dark,glass,trim,green,amber])if(!used.has(m))m.dispose();
 return {root,update:animate,dynamic};
}
