const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// All coordinates are local to the unscaled scene surface.
export function poiConnection(source,panel){
 if(!source||!panel||![source.x,source.y,panel.x,panel.y,panel.width,panel.height].every(Number.isFinite))return null;
 const right=panel.x>source.x,edge=right?panel.x:panel.x+panel.width;
 if(source.x>=panel.x&&source.x<=panel.x+panel.width&&source.y>=panel.y&&source.y<=panel.y+panel.height)return null;
 if(source.x>=panel.x&&source.x<=panel.x+panel.width){
  const below=source.y>panel.y+panel.height,direction=below?-1:1;
  const start={x:source.x,y:source.y+direction*(Number.isFinite(source.height)?source.height:0)/2},end={x:clamp(source.x,panel.x+24,panel.x+panel.width-24),y:below?panel.y+panel.height:panel.y};
  const bend=Math.min(42,Math.abs(start.y-end.y)*.45);
  return {start,end,path:`M ${start.x} ${start.y} C ${start.x} ${start.y+direction*bend}, ${end.x} ${end.y-direction*bend}, ${end.x} ${end.y}`};
 }
 const end={x:edge,y:clamp(panel.y+82,panel.y+24,panel.y+panel.height-24)},direction=right?1:-1;
 const start={x:source.x+direction*(Number.isFinite(source.width)?source.width:0)/2,y:source.y};
 if(Math.abs(end.x-start.x)<8)return null;
 const bend=Math.min(42,Math.abs(end.x-start.x)*.45);
 return {start,end,path:`M ${start.x} ${start.y} C ${start.x+direction*bend} ${start.y}, ${end.x-direction*bend} ${end.y}, ${end.x} ${end.y}`};
}
