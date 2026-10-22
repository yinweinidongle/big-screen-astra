export const WIDTH=1600;
export function pathData(points,kind='line'){
 if(!points?.length)return '';
 const n=v=>Math.round(v*100)/100;
 const start=`M${n(points[0].x)} ${n(points[0].y)}`;
 if(kind!=='curve'||points.length<3)return start+points.slice(1).map(p=>`L${n(p.x)} ${n(p.y)}`).join('');
 let d=start;
 for(let i=0;i<points.length-1;i++){
  const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],e=points[Math.min(i+2,points.length-1)];
  d+=`C${n(b.x+(c.x-a.x)/6)} ${n(b.y+(c.y-a.y)/6)},${n(c.x-(e.x-b.x)/6)} ${n(c.y-(e.y-b.y)/6)},${n(c.x)} ${n(c.y)}`;
 }
 return d;
}
export function mirrored(points){return points.map(p=>({x:WIDTH-p.x,y:p.y}));}
