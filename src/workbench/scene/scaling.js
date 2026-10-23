export const MIN_OBJECT_SCALE=.02;
export const MAX_OBJECT_SCALE=40;
const clamp=value=>Math.max(MIN_OBJECT_SCALE,Math.min(MAX_OBJECT_SCALE,Number(value)||MIN_OBJECT_SCALE));

// Bound the common multiplier, rather than each axis, to preserve proportions.
export function scaleObjectBy(scale,factor){
 const values=scale.map(clamp);
 if(!Number.isFinite(factor)||factor<=0)return values;
 const lower=Math.max(...values.map(v=>MIN_OBJECT_SCALE/v));
 const upper=Math.min(...values.map(v=>MAX_OBJECT_SCALE/v));
 const ratio=Math.max(lower,Math.min(upper,factor));
 return values.map(v=>Math.round(v*ratio*1e6)/1e6);
}

export function scaleObjectAxis(scale,axis,value,linked){
 const values=scale.map(clamp);
 if(!Number.isInteger(axis)||axis<0||axis>2||!Number.isFinite(value))return values;
 if(linked)return scaleObjectBy(values,clamp(value)/values[axis]);
 values[axis]=clamp(value);return values;
}
