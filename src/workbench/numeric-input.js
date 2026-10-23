// Keep the text being edited separate from the numeric value used by the scene.
// A range limit must never turn the first `0` in `0.5` into `0.02` mid-typing.
export function parseNumericDraft(value){
 const text=String(value??'').trim();
 if(!text||!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(text))return null;
 const number=Number(text);return Number.isFinite(number)?number:null;
}
export function formatNumericValue(value){return value===undefined||value===null?'':String(value);}
export function liveNumericValue(draft,{min,max}={}){
 const value=parseNumericDraft(draft);
 return value===null||(Number.isFinite(min)&&value<min)||(Number.isFinite(max)&&value>max)?null:value;
}
export function resolveNumericCommit(draft,current,{min,max}={}){
 let value=parseNumericDraft(draft)??parseNumericDraft(current)??(Number.isFinite(min)?min:0);
 if(Number.isFinite(min))value=Math.max(min,value);
 if(Number.isFinite(max))value=Math.min(max,value);
 return value;
}
export function syncNumericDraft(draft,value,editing){
 // Ignore our own numeric echo while preserving intermediate decimal text.
 // A different value (for example undo/redo) replaces even a focused draft.
 return editing&&parseNumericDraft(draft)===parseNumericDraft(value)?draft:formatNumericValue(value);
}
