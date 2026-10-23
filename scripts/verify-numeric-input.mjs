import assert from 'node:assert/strict';
import {parseNumericDraft,liveNumericValue,resolveNumericCommit,syncNumericDraft} from '../src/workbench/numeric-input.js';

function typeNumber(parts,initial,limits){
 let current=initial,draft='';
 for(const part of parts){draft=part;const value=liveNumericValue(draft,limits);if(value!==null&&value!==current){current=value;draft=syncNumericDraft(draft,current,true);}assert.equal(draft,part,'model echo must preserve the text being edited');}
 return resolveNumericCommit(draft,current,limits);
}
assert.equal(typeNumber(['','0','0.','0.5'],1,{min:.02,max:40}),.5,'scaling below one must be entered one character at a time');
assert.equal(typeNumber(['','-','-2','-2.','-2.5'],1,{min:-200,max:200}),-2.5,'negative coordinates must remain editable');
assert.equal(typeNumber(['','.','.2','.25'],1,{min:.02,max:40}),.25);
assert.equal(typeNumber(['','1','1e','1e-','1e-2'],1,{min:.001,max:40}),.01);
assert.equal(resolveNumericCommit('0',1,{min:.02,max:40}),.02,'minimum applies when committing');
assert.equal(resolveNumericCommit('100',1,{min:.02,max:40}),40,'maximum applies when committing');
assert.equal(liveNumericValue('0',{min:.02,max:40}),null,'out-of-range drafts must not send invalid transforms to the scene');
assert.equal(liveNumericValue('100',{min:.02,max:40}),null);
assert.equal(liveNumericValue('0.5',{min:.02,max:40}),.5,'valid values update in real time');
assert.equal(resolveNumericCommit('',.5,{min:.02,max:40}),.5,'clearing an input must not corrupt the previous value');
assert.equal(resolveNumericCommit('-',-3,{min:-200,max:200}),-3);
for(const text of ['', '-', '.', '1e-', 'Infinity', 'NaN', '0x10'])assert.equal(parseNumericDraft(text),null,text);
assert.equal(syncNumericDraft('0.',0,true),'0.','a numeric echo must preserve a trailing decimal point');
assert.equal(syncNumericDraft('0.5',1,true),'1','undo must update a focused input');
assert.equal(syncNumericDraft('-',2,true),'2','external changes must replace incomplete drafts');
assert.equal(syncNumericDraft('0.50',.5,false),'0.5','inactive fields display the current value');
console.log('Numeric controls: decimal and negative typing, incomplete input, commit bounds and external undo updates passed.');
