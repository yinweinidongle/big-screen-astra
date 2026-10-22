import {pathData,mirrored} from './geometry.js';

// Keep source anchors intact. Only the rendered interval is shortened, so moving
// a node away from a crossing immediately restores the original trajectory.
const TRIM_EPS=.04,FLATNESS=.12,CELL=64;
const trimMix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const trimCross=(a,b)=>a.x*b.y-a.y*b.x;
const trimSub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
const trimDistance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const trimNumber=n=>Math.round(n*100)/100;

function trimSplit(c,t){
 const a=trimMix(c[0],c[1],t),b=trimMix(c[1],c[2],t),d=trimMix(c[2],c[3],t),e=trimMix(a,b,t),f=trimMix(b,d,t),p=trimMix(e,f,t);
 return [[c[0],a,e,p],[p,f,d,c[3]]];
}
function trimCubics(points,kind){
 return points.slice(1).map((p,i)=>{
  const b=points[i];
  if(kind!=='curve'||points.length<3)return [b,p];
  const a=points[Math.max(0,i-1)],e=points[Math.min(points.length-1,i+2)];
  return [b,{x:b.x+(p.x-a.x)/6,y:b.y+(p.y-a.y)/6},{x:p.x-(e.x-b.x)/6,y:p.y-(e.y-b.y)/6},p];
 });
}
function trimRoute(points,line){
 const curves=trimCubics(points,line.kind),edges=[],anchors=[0];let length=0;
 function edge(a,b,segment,t0,t1){const size=trimDistance(a,b);if(size<1e-8)return;edges.push({a,b,segment,t0,t1,start:length,end:length+size,index:edges.length});length+=size;}
 function flatten(c,segment,t0=0,t1=1,depth=0){
  const chord=trimDistance(c[0],c[3]),polygon=trimDistance(c[0],c[1])+trimDistance(c[1],c[2])+trimDistance(c[2],c[3]);
  const bend=Math.max(Math.abs(trimCross(trimSub(c[1],c[0]),trimSub(c[3],c[0]))),Math.abs(trimCross(trimSub(c[2],c[0]),trimSub(c[3],c[0]))))/Math.max(chord,1e-8);
  if(depth>=12||(bend<=FLATNESS&&polygon-chord<=FLATNESS)){edge(c[0],c[3],segment,t0,t1);return;}
  const [a,b]=trimSplit(c,.5),mid=(t0+t1)/2;flatten(a,segment,t0,mid,depth+1);flatten(b,segment,mid,t1,depth+1);
 }
 curves.forEach((c,i)=>{if(c.length===2)edge(c[0],c[1],i,0,1);else flatten(c,i);anchors.push(length);});
 return {points,line,curves,edges,anchors,length,start:0,end:length};
}
function trimPosition(route,s){
 if(!route.edges.length)return {point:route.points[0],segment:0,t:0};
 const distance=Math.max(0,Math.min(route.length,s));
 let low=0,high=route.edges.length-1;while(low<high){const mid=(low+high)>>1;if(route.edges[mid].end<distance)low=mid+1;else high=mid;}
 const e=route.edges[low],t=e.t0+(e.t1-e.t0)*(distance-e.start)/(e.end-e.start),c=route.curves[e.segment];
 return {point:c.length===2?trimMix(c[0],c[1],t):trimSplit(c,t)[0][3],segment:e.segment,t};
}
function trimCellKeys(e){
 const keys=[];for(let x=Math.floor(Math.min(e.a.x,e.b.x)/CELL);x<=Math.floor(Math.max(e.a.x,e.b.x)/CELL);x++)for(let y=Math.floor(Math.min(e.a.y,e.b.y)/CELL);y<=Math.floor(Math.max(e.a.y,e.b.y)/CELL);y++)keys.push(x+':'+y);return keys;
}
function trimGrid(route){
 if(route.grid)return route.grid;
 const grid=new Map();for(const e of route.edges)for(const key of trimCellKeys(e)){if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e);}return route.grid=grid;
}
function trimContact(a,b){
 if(Math.max(a.a.x,a.b.x)<Math.min(b.a.x,b.b.x)-1e-7||Math.max(b.a.x,b.b.x)<Math.min(a.a.x,a.b.x)-1e-7||Math.max(a.a.y,a.b.y)<Math.min(b.a.y,b.b.y)-1e-7||Math.max(b.a.y,b.b.y)<Math.min(a.a.y,a.b.y)-1e-7)return null;
 const r=trimSub(a.b,a.a),s=trimSub(b.b,b.a),q=trimSub(b.a,a.a),den=trimCross(r,s),lr=a.end-a.start,ls=b.end-b.start;
 if(Math.abs(den)>1e-8*lr*ls){
  const t=trimCross(q,s)/den,u=trimCross(q,r)/den;
  if(t<-1e-7||t>1+1e-7||u<-1e-7||u>1+1e-7)return null;
  return {a:a.start+Math.max(0,Math.min(1,t))*lr,b:b.start+Math.max(0,Math.min(1,u))*ls,sine:Math.abs(den)/(lr*ls)};
 }
 if(Math.abs(trimCross(q,r))/lr>1e-5)return null;
 const dot=(v,w)=>v.x*w.x+v.y*w.y,t0=dot(q,r)/(lr*lr),t1=t0+dot(s,r)/(lr*lr),lo=Math.max(0,Math.min(t0,t1)),hi=Math.min(1,Math.max(t0,t1));
 if((hi-lo)*lr<TRIM_EPS)return null;
 const at=t=>{const p=trimMix(a.a,a.b,t);return b.start+dot(trimSub(p,b.a),s)/ls;};
 return {overlap:true,a:a.start+lo*lr,aEnd:a.start+hi*lr,b:at(lo),bEnd:at(hi)};
}
function trimContacts(a,b,self=false){
 const contacts=[],grid=trimGrid(b);
 const active=(edge,route)=>{const start=Math.max(edge.start,route.start),end=Math.min(edge.end,route.end);if(end-start<1e-8)return null;return {...edge,a:trimMix(edge.a,edge.b,(start-edge.start)/(edge.end-edge.start)),b:trimMix(edge.a,edge.b,(end-edge.start)/(edge.end-edge.start)),start,end};};
 for(const original of a.edges){
  const e=active(original,a);if(!e)continue;
  const seen=new Set();for(const key of trimCellKeys(e))for(const other of grid.get(key)||[]){
   if(seen.has(other.index))continue;seen.add(other.index);
   if((self&&other.index<=e.index)||other.end<b.start-TRIM_EPS||other.start>b.end+TRIM_EPS)continue;
   const retained=active(other,b);if(!retained)continue;const contact=trimContact(e,retained);if(!contact)continue;
   if(!contact.overlap){
    if(self&&other.index===e.index+1)continue;
    if(contact.a<=a.start+TRIM_EPS||contact.a>=a.end-TRIM_EPS||contact.b<=b.start+TRIM_EPS||contact.b>=b.end-TRIM_EPS)continue;
    // A tangential touch or a corner resting on another line is not an X.
    const before=trimSub(trimPosition(a,contact.a-.75).point,trimPosition(b,contact.b).point),after=trimSub(trimPosition(a,contact.a+.75).point,trimPosition(b,contact.b).point),tangent=trimSub(trimPosition(b,contact.b+.75).point,trimPosition(b,contact.b-.75).point);
    if(trimCross(before,tangent)*trimCross(after,tangent)>=-1e-12)continue;
   }
   contacts.push(contact);
  }
 }
 return contacts;
}
function trimSelf(route){
 const contacts=trimContacts(route,route,true);
 for(const c of contacts){if(c.overlap){route.end=Math.min(route.end,Math.max(0,c.a));}else route.end=Math.min(route.end,c.a);}
}
function trimMirrors(a,b){
 const contacts=trimContacts(a,b),candidates=contacts.filter(c=>!c.overlap);
 // Several consecutive collinear edges form one overlap. Meet at its midpoint,
 // rather than letting segment subdivision move the symmetric join off-centre.
 const overlaps=contacts.filter(c=>c.overlap).sort((x,y)=>x.a-y.a);
 for(let i=0;i<overlaps.length;){let end=overlaps[i].aEnd,j=i+1;while(j<overlaps.length&&overlaps[j].a<=end+TRIM_EPS){end=Math.max(end,overlaps[j].aEnd);j++;}
  const mid=(overlaps[i].a+end)/2,c=overlaps.slice(i,j).find(c=>mid>=c.a-TRIM_EPS&&mid<=c.aEnd+TRIM_EPS);if(c)candidates.push({a:mid,b:c.b+(c.bEnd-c.b)*(mid-c.a)/(c.aEnd-c.a)});i=j;
 }
 const first=candidates.filter(c=>c.a>=a.start&&c.a<=a.end&&c.b>=b.start&&c.b<=b.end).sort((x,y)=>Math.max(x.a,x.b)-Math.max(y.a,y.b))[0];
 if(first){a.end=Math.min(a.end,first.a);b.end=Math.min(b.end,first.b);}
}
function trimAgainst(route,obstacles,radiusFor){
 const contacts=obstacles.flatMap(other=>trimContacts(other,route).map(c=>({...c,other}))),overlaps=contacts.filter(c=>c.overlap).map(c=>({start:Math.min(c.b,c.bEnd),end:Math.max(c.b,c.bEnd)})).sort((a,b)=>a.start-b.start);
 // Remove duplicate leading runs, while keeping the branch that leaves them.
 for(const span of overlaps){if(span.end<=route.start+TRIM_EPS)continue;if(span.start<=route.start+TRIM_EPS)route.start=Math.min(route.end,span.end);else route.end=Math.min(route.end,span.start);}
 for(const c of contacts){
  if(c.overlap||c.b<=route.start+TRIM_EPS||c.b>=route.end-TRIM_EPS||c.a<c.other.start||c.a>c.other.end)continue;
  // Independently traced halves can overshoot their shared tip by a subpixel.
  // Join both tips instead of applying an enormous gap at this shallow angle.
  if(route.end-c.b<1.5&&c.other.end-c.a<1.5){route.end=c.b;c.other.end=c.a;continue;}
  const radii=radiusFor(route.line)+radiusFor(c.other.line)+.6,clearance=radii/Math.max(c.sine,.4);
  route.end=Math.max(route.start,Math.min(route.end,c.b-clearance));
 }
}
function trimResult(route){
 const {points,line,length,start,end}=route,trimmed=start>TRIM_EPS||end<length-TRIM_EPS;
 if(end-start<TRIM_EPS)return {d:'',points:[],trimmed:true,start:null,end:null};
 if(!trimmed)return {d:pathData(points,line.kind),points,trimmed:false,start:points[0],end:points.at(-1)};
 const from=trimPosition(route,start),to=trimPosition(route,end),n=trimNumber;let d=`M${n(from.point.x)} ${n(from.point.y)}`;
 for(let i=from.segment;i<=to.segment;i++){
  let c=route.curves[i],t0=i===from.segment?from.t:0,t1=i===to.segment?to.t:1;
  if(t1-t0<1e-8)continue;
  if(c.length===2){const p=trimMix(c[0],c[1],t1);d+=`L${n(p.x)} ${n(p.y)}`;}
  else{if(t1<1)c=trimSplit(c,t1)[0];if(t0>0)c=trimSplit(c,t0/t1)[1];d+=`C${n(c[1].x)} ${n(c[1].y)},${n(c[2].x)} ${n(c[2].y)},${n(c[3].x)} ${n(c[3].y)}`;}
 }
 const kept=[from.point,...points.filter((_,i)=>route.anchors[i]>start+TRIM_EPS&&route.anchors[i]<end-TRIM_EPS),to.point];
 return {d,points:kept,trimmed:true,start:from.point,end:to.point};
}

export function trimLinePaths(lines,radiusFor=l=>(l.width||1)/2){
 const obstacles=[],radii=new Map();
 const radiusOf=line=>{if(!radii.has(line))radii.set(line,radiusFor(line));return radii.get(line);};
 const layers=lines.filter(l=>l.visible!==false).map(line=>{
  const routes=(line.mirror?[line.points,mirrored(line.points)]:[line.points]).map(points=>trimRoute(points,line));
  routes.forEach(trimSelf);if(routes.length===2)trimMirrors(...routes);
  for(const route of routes)trimAgainst(route,obstacles,radiusOf);
  obstacles.push(...routes.filter(r=>r.end-r.start>TRIM_EPS));
  return {line,routes};
 });
 return layers.map(({line,routes})=>({line,paths:routes.map(trimResult)}));
}
