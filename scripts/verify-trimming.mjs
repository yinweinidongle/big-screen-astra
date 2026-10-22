import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {trimLinePaths} from '../src/studio/pathTrimming.js';
import {pathData} from '../src/studio/geometry.js';
import {lineRadius} from '../src/studio/lineEffects.js';
import {presets} from '../src/studio/presets.js';

const line=(id,points,extra={})=>({id,points:points.map(([x,y])=>({x,y})),width:2,glow:2,tail:100,effect:'static',visible:true,kind:'line',...extra});
const resolve=lines=>trimLinePaths(lines,lineRadius);
const main=line('main',[[0,100],[300,100]]),cross=line('cross',[[150,0],[150,200]]);
const original=structuredClone([main,cross]),result=resolve([main,cross]);
assert.equal(result[0].paths[0].d,pathData(main.points),'Keep the main contour');
assert(result[1].paths[0].end.y<100,'Cut the surplus beyond the crossing');
assert(result[1].paths[0].end.y>90,'Keep a small, deliberate clearance');
assert.deepEqual([main,cross],original,'Clipping must not edit saved anchors');

const moved={...cross,points:[{x:350,y:0},{x:350,y:200}]};
assert.equal(resolve([main,moved])[1].paths[0].d,pathData(moved.points),'Moving away restores the complete path');
assert.equal(resolve([{...main,visible:false},cross])[0].paths[0].trimmed,false,'Hidden lines do not clip visible ones');
for(const other of [line('parallel',[[0,120],[300,120]]),line('touch',[[150,0],[150,100]]),line('corner',[[100,50],[150,100],[200,50]])])assert.equal(resolve([main,other])[1].paths[0].trimmed,false,'Parallel paths, T joins and tangential touches stay intact');

const mirror=line('mirror',[[0,60],[500,60],[1100,60]],{mirror:true}),pair=resolve([mirror])[0].paths;
assert.deepEqual(pair.map(p=>p.end),[{x:800,y:60},{x:800,y:60}],'Overlapping mirror halves meet on the centreline');
const mirrorCross=resolve([line('mirror-cross',[[0,0],[1100,220]],{mirror:true})])[0].paths;
assert(Math.abs(mirrorCross[0].end.x-800)<.01);assert.deepEqual(mirrorCross[0].end,mirrorCross[1].end);
const joined=resolve([line('a',[[0,90],[800,100]]),line('b',[[1600,90],[799,100]])]);
assert(Math.hypot(joined[0].paths[0].end.x-joined[1].paths[0].end.x,joined[0].paths[0].end.y-joined[1].paths[0].end.y)<1e-6,'Subpixel overshoots join without a large gap');

assert.equal(resolve([main,{...main,id:'duplicate'}])[1].paths[0].d,'','Draw coincident strokes only once');
const branch=resolve([main,line('branch',[[0,100],[120,100],[180,170]])])[1].paths[0];
assert.deepEqual(branch.start,{x:120,y:100});assert.deepEqual(branch.end,{x:180,y:170});
const overlappingEnd=resolve([main,line('end',[[150,0],[150,100],[250,100]])])[1].paths[0];
assert.deepEqual(overlappingEnd.end,{x:150,y:100},'Remove the duplicated trailing run');
const loop=resolve([line('loop',[[0,0],[200,200],[0,200],[200,0]])])[0].paths[0];
assert.deepEqual(loop.end,{x:100,y:100},'Remove self-crossing loops');
const curve=resolve([main,line('curve',[[50,10],[150,90],[240,180]],{kind:'curve'})])[1].paths[0];
assert(curve.trimmed);assert(curve.d.includes('C'),'Retain exact cubic curves after clipping');assert(curve.end.y<100);
const phantom=resolve([main,{...cross,effect:'phantom'}])[1].paths[0];
assert(phantom.end.y<result[1].paths[0].end.y,'Include phantom offsets in the clearance');

// An independent straight-segment check covers many crossings and layer orders.
function assertNoCrossings(layers){
 const routes=layers.flatMap(l=>l.paths.filter(p=>p.d).map(p=>p.points));
 const cross=(a,b)=>a.x*b.y-a.y*b.x,sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
 for(let i=0;i<routes.length;i++)for(let j=i;j<routes.length;j++)for(let a=1;a<routes[i].length;a++)for(let b=(i===j?a+2:1);b<routes[j].length;b++){
  const p=routes[i][a-1],q=routes[j][b-1],r=sub(routes[i][a],p),s=sub(routes[j][b],q),den=cross(r,s);if(Math.abs(den)<1e-7)continue;
  const t=cross(sub(q,p),s)/den,u=cross(sub(q,p),r)/den;
  assert(!(t>1e-5&&t<1-1e-5&&u>1e-5&&u<1-1e-5),'Visible paths still form an X');
 }
}
let seed=42;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const stress=Array.from({length:80},(_,i)=>line('stress-'+i,Array.from({length:6},()=>[random()*1600,random()*260]),{mirror:i%3===0}));
const start=performance.now();const stressResult=resolve(stress);const elapsed=performance.now()-start;assertNoCrossings(stressResult);
for(const preset of presets){const layers=resolve(preset.lines);assert(layers.every(l=>l.paths.every(p=>!p.d.includes('NaN'))));if(preset.fresh)for(const {line,paths} of layers)assert(Math.hypot(paths[0].end.x-line.points.at(-1).x,paths[0].end.y-line.points.at(-1).y)<2,'Preserve the traced background contour');}
console.log(`Auto-trim: crossings, mirrors, overlaps, branches, self-loops, curves, edit restoration and 80-line stress check passed (${elapsed.toFixed(1)} ms).`);
