// Autosave timestamps do not change the editable content of a project.
export function projectFingerprint(project){const copy=JSON.parse(JSON.stringify(project));delete copy.updatedAt;return JSON.stringify(copy);}
