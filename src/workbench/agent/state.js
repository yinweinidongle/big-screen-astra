import {designChanges} from './changes.js';

// Autosave timestamps do not change the editable content of a project.
export function projectFingerprint(project){const copy=JSON.parse(JSON.stringify(project));delete copy.updatedAt;return JSON.stringify(copy);}

// A visible, unapplied draft is the document the user is continuing to edit.
// Keep its application anchored to the original canvas revision, not its new ID.
export function prepareAgentTurn({project,revision,result,applied=false,baseRevision=-1,selectedIds=[]}){
 const continuing=!!result?.modified&&!applied;
 if(continuing&&baseRevision!==revision)throw Error('原稿已发生变化，上一轮草稿仍保留。请先收起草稿，再基于当前画布继续修改。');
 const copy=value=>JSON.parse(JSON.stringify(value)),source=continuing?result.project:project,ids=new Set(source.nodes.map(n=>n.id));
 return {project:copy(source),origin:copy(project),baseRevision:continuing?baseRevision:revision,selectedIds:selectedIds.filter(id=>ids.has(id)),continuing};
}

// Resuming can finish with no further edits. The pending work still differs
// from the original canvas and must remain available for application/undo.
export function finishAgentTurn(turn,result){
 if(!turn.continuing)return result;
 const changes=designChanges(turn.origin,result.project);
 return {...result,changes,modified:changes.changed,noChange:!changes.changed};
}
