import {makeConfig,presets,validateConfig} from '../studio/presets.js';

// A header has one composition in the workbench, designer, player and export.
export function resolveHeaderConfig(node,theme={}) {
 if(node.props.headerConfig)return node.props.headerConfig;
 const c=makeConfig(presets.find(p=>p.id===node.props.preset)||presets[0]);
 c.title=node.props.text??c.title;c.subtitle=node.props.subtitle??c.subtitle;
 c.fontSize=node.props.titleSize||(node.style.fontSize!==14?node.style.fontSize:34);
 c.titleColor=node.style.color||theme.text||c.titleColor;
 c.fontFamily=node.style.fontFamily||c.fontFamily;c.fontWeight=Number(node.style.fontWeight)||c.fontWeight;
 c.titleGradient=!!node.style.gradient;c.titleGradientTo=node.style.gradientTo||c.titleGradientTo;
 return c;
}
export function applyHeaderConfig(node,value){
 const c=validateConfig(value);node.props.headerConfig=c;
 Object.assign(node.props,{preset:c.presetId,title:c.title,text:c.title,subtitle:c.subtitle,titleSize:c.fontSize});
 return c;
}
export function headerPreset(current,preset){
 const next=makeConfig(preset);next.title=current.title;next.subtitle=current.subtitle;
 return next;
}
