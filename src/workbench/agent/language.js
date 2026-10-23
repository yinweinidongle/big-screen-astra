// This parses explicit reply-language preferences only; design intent remains model-decided.
export function replyLanguage(prompt=''){
 const language='(?:English|Chinese|Japanese|German|French|Spanish|Korean|Italian|Portuguese|Russian|Arabic|Hindi|中文|汉语|英文|英语|日文|日语|德文|德语|法文|法语|西班牙语|韩文|韩语|俄语|阿拉伯语)';
 const explicit=new RegExp('(?:reply|respond|answer|write|translate)[^\\n.!?。！？]{0,60}\\b(?:in|into|to)\\s+'+language+'\\b|(?:用|使用|改用|翻译成|翻译为)\\s*'+language+'(?:回复|回答|解释|输出|撰写|翻译)?','i');
 const match=prompt.match(explicit)?.[0]||'';return match&&!/Chinese|中文|汉语/i.test(match)?'follow-user':'zh-CN';
}
export function needsChinese(text=''){
 const prose=text.replace(/```[\s\S]*?```/g,'').replace(/`[^`]*`/g,'').replace(/https?:\/\/\S+/g,'');
 const han=(prose.match(/[\u3400-\u9fff]/g)||[]).length,latin=(prose.match(/[a-z]/gi)||[]).length,words=(prose.match(/[a-z]{2,}/gi)||[]).length;
 const otherScript=(prose.match(/[\u3040-\u30ff\uac00-\ud7af]/g)||[]).length;return otherScript>=8||words>=8&&han/Math.max(1,latin+han)<.08;
}
