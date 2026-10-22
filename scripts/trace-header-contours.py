"""Read generated pixels, trace their luminous rims, and emit editable SVG anchors.

No image content is modified. Guides are measured in the 2048px review image;
left and right wings are sampled independently in the original 2172px files.
"""
from PIL import Image
import numpy as np
import json
from pathlib import Path

GUIDES={
 'aurora':{'rim':[[0,273],[90,223],[170,195],[230,192],[290,210],[345,255],[400,341],[450,420],[520,483],[620,527],[760,555],[900,570],[1024,574]]},
 'gold':{'rim':[[0,87],[136,231],[259,231],[558,501],[820,501]]},
 'scarlet':{'rim':[[0,84],[179,232],[446,291],[494,369],[655,431]],'base':[[0,523],[201,523],[224,543],[872,541]]},
 'glacier':{'rim':[[38,59],[82,139],[229,311],[421,380],[586,542]]},
 'orbit':{'rim':[[167,334],[174,358],[198,383],[260,410],[350,433],[500,454],[700,471],[880,480],[1024,482]]},
 'jade':{'rim':[[0,328],[37,317],[70,293],[104,253],[138,232],[159,233],[177,248],[194,286],[214,333],[243,366],[288,394],[329,432],[363,449],[395,447],[424,439],[449,444],[475,464],[504,490],[545,508],[600,517]]}
}
WEIGHTS={'aurora':[.2,.65,.15],'gold':[.45,.45,.1],'scarlet':[.45,.45,.1],'glacier':[.25,.4,.35],'orbit':[.45,.25,.3],'jade':[.65,.25,.1]}

def simplify(pts,epsilon=.55):
 if len(pts)<3:return pts
 a,b=pts[0],pts[-1];d=b-a;den=np.linalg.norm(d)
 dist=np.abs(d[0]*(pts-a)[:,1]-d[1]*(pts-a)[:,0])/den if den else np.linalg.norm(pts-a,axis=1)
 index=int(np.argmax(dist))
 if dist[index]>epsilon:return np.vstack([simplify(pts[:index+1],epsilon)[:-1],simplify(pts[index:],epsilon)])
 return np.vstack([a,b])

def trace(rgb,guides,weights,right=False):
 h,w,_=rgb.shape;sx=w/2048;sy=h/(2048/3)
 guide=np.array(guides,dtype=float)*[sx,sy]
 xs=np.unique(np.r_[np.arange(round(guide[0,0]),round(guide[-1,0])+1,3),np.round(guide[:,0]),round(guide[-1,0])]).astype(int)
 points=[];strength=[];columns=[];parents=[];offsets=np.arange(-22,23);previous=None
 for xx in xs:
  x=w-1-xx if right else xx
  approx=float(np.interp(xx,guide[:,0],guide[:,1]));ys=np.clip(np.round(approx).astype(int)+offsets,0,h-1)
  col=rgb[ys,max(0,x-1):min(w,x+2)].mean(axis=1)@weights
  score=col-.015*offsets**2
  if previous is not None:
   delta=offsets[:,None]-offsets[None,:]
   transitions=previous[None,:]-1.8*delta**2
   transitions[np.abs(delta)>6]=-1e9
   parent=np.argmax(transitions,axis=1);score+=transitions[np.arange(len(offsets)),parent];parents.append(parent)
  columns.append((x,ys,col));previous=score
 index=int(np.argmax(previous));indices=[index]
 for parent in reversed(parents):index=int(parent[index]);indices.append(index)
 indices.reverse()
 for (x,ys,col),k in zip(columns,indices):
  near=col[max(0,k-1):min(len(col),k+2)];near_y=ys[max(0,k-1):min(len(col),k+2)];weights_y=np.maximum(0,near-near.min()+.01)
  y=float((near_y*weights_y).sum()/weights_y.sum());points.append([x/w*1600,y/h*260]);strength.append(float(col[k]))
 simple=simplify(np.array(points));a=simple[:-1];b=simple[1:];d=b-a;raw=np.array(points);diff=raw[:,None,:]-a[None,:,:];t=np.clip((diff*d[None,:,:]).sum(axis=2)/(d*d).sum(axis=1)[None,:],0,1);distance=np.linalg.norm(diff-t[:,:,None]*d[None,:,:],axis=2).min(axis=1)
 return {'points':np.round(simple,3).tolist(),'samples':len(points),'meanRimBrightness':round(float(np.mean(strength)),2),'minRimBrightness':round(float(np.min(strength)),2),'maxDeviation':round(float(distance.max()),4)}

result={}
for key,paths in GUIDES.items():
 image=Image.open(Path('public/assets')/f'header-{key}.png').convert('RGB');rgb=np.array(image,dtype=float);w,h=image.size
 rails={}
 for name,guide in paths.items():
  for side in ['left','right']:rails[f'{name}-{side}']=trace(rgb,guide,np.array(WEIGHTS[key]),side=='right')
 result[key]={'width':w,'height':h,'rails':rails}
Path('src/studio/generatedContours.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
for key,v in result.items():print(key,[(name,len(r['points']),r['meanRimBrightness']) for name,r in v['rails'].items()])
