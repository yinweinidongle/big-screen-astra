export function bounds(nodes){if(!nodes.length)return null;const x=Math.min(...nodes.map(n=>n.x)),y=Math.min(...nodes.map(n=>n.y));return {x,y,w:Math.max(...nodes.map(n=>n.x+n.w))-x,h:Math.max(...nodes.map(n=>n.y+n.h))-y};}
export function snapPosition(rect,others,width,height,grid=true,threshold=7){
 const guides=[],xs=[0,width/2,width],ys=[0,height/2,height];
 for(const n of others){if(!n.visible)continue;xs.push(n.x,n.x+n.w/2,n.x+n.w);ys.push(n.y,n.y+n.h/2,n.y+n.h);}
 let x=grid?Math.round(rect.x/20)*20:rect.x,y=grid?Math.round(rect.y/20)*20:rect.y,dx=threshold+1,dy=threshold+1;
 for(const edge of [0,rect.w/2,rect.w])for(const target of xs){const diff=Math.abs(rect.x+edge-target);if(diff<dx&&diff<threshold){dx=diff;x=target-edge;guides[0]={axis:'x',position:target};}}
 for(const edge of [0,rect.h/2,rect.h])for(const target of ys){const diff=Math.abs(rect.y+edge-target);if(diff<dy&&diff<threshold){dy=diff;y=target-edge;guides[1]={axis:'y',position:target};}}
 return {x,y,guides:guides.filter(Boolean)};
}
export function alignNodes(nodes,mode,canvas){if(nodes.length<1)return;const b=nodes.length===1?{x:0,y:0,w:canvas.width,h:canvas.height}:bounds(nodes);for(const n of nodes){if(mode==='left')n.x=b.x;if(mode==='center')n.x=b.x+(b.w-n.w)/2;if(mode==='right')n.x=b.x+b.w-n.w;if(mode==='top')n.y=b.y;if(mode==='middle')n.y=b.y+(b.h-n.h)/2;if(mode==='bottom')n.y=b.y+b.h-n.h;}}
export function distributeNodes(nodes,axis){if(nodes.length<3)return;const sorted=[...nodes].sort((a,b)=>a[axis]-b[axis]),size=axis==='x'?'w':'h',first=sorted[0][axis],last=sorted.at(-1)[axis]+sorted.at(-1)[size],gap=(last-first-sorted.reduce((s,n)=>s+n[size],0))/(sorted.length-1);let p=first;for(const n of sorted){n[axis]=p;p+=n[size]+gap;}}
export function scaleSelection(nodes,original,next){const sx=next.w/original.w,sy=next.h/original.h;for(const n of nodes){n.x=next.x+(n.x-original.x)*sx;n.y=next.y+(n.y-original.y)*sy;n.w=Math.max(20,n.w*sx);n.h=Math.max(20,n.h*sy);}}
export function fitScale(w,h,availableW,availableH,mode='contain'){if(mode==='stretch')return {x:availableW/w,y:availableH/h};const s=mode==='cover'?Math.max(availableW/w,availableH/h):mode==='width'?availableW/w:Math.min(availableW/w,availableH/h);return {x:s,y:s};}
