<script setup>
import {ref,watch,onMounted,onBeforeUnmount,nextTick} from 'vue';
import {poiConnection} from '../scene/poi-connection.js';
const props=defineProps({host:Object,panel:Object,poi:Object,target:Object,labels:Array});
const geometry=ref(null),size=ref({width:1,height:1});let observer,frame;
function measure(){
 frame=0;const host=props.host,panel=props.panel?.getElement?.();
 if(!host||!panel||!props.target?.visible){geometry.value=null;return;}
 if(!host.clientWidth||!host.clientHeight){geometry.value=null;return;}
 size.value={width:host.clientWidth,height:host.clientHeight};
 const label=[...host.querySelectorAll('[data-poi-id]')].find(el=>el.dataset.poiId===String(props.poi.id)&&el.getClientRects().length);
 const matrix=label?new DOMMatrixReadOnly(getComputedStyle(label).transform):null;
 const source=label?{x:label.offsetLeft+label.offsetWidth/2+matrix.m41,y:label.offsetTop+label.offsetHeight/2+matrix.m42,width:label.offsetWidth,height:label.offsetHeight}:props.target;
 geometry.value=poiConnection(source,{x:panel.offsetLeft,y:panel.offsetTop,width:panel.offsetWidth,height:panel.offsetHeight});
}
function schedule(){if(!frame)frame=requestAnimationFrame(measure);}
watch(()=>[props.target,props.labels,props.poi],schedule,{flush:'post'});
watch(()=>[props.host,props.panel],async()=>{await nextTick();observer?.disconnect();if(props.host)observer?.observe(props.host);const panel=props.panel?.getElement?.();if(panel)observer?.observe(panel);schedule();},{flush:'post'});
onMounted(()=>{observer=new ResizeObserver(schedule);if(props.host)observer.observe(props.host);const panel=props.panel?.getElement?.();if(panel)observer.observe(panel);schedule();});
onBeforeUnmount(()=>{observer?.disconnect();cancelAnimationFrame(frame);});
</script>
<template><svg v-if="geometry" class="aw-poi-panel-connector" :viewBox="`0 0 ${size.width} ${size.height}`" preserveAspectRatio="none" aria-hidden="true" :style="{'--connector-color':poi.color||'#8cc9e8'}"><path class="connector-halo" :d="geometry.path"/><path class="connector-line" :d="geometry.path"/><path class="connector-flow" :d="geometry.path"/><circle :cx="geometry.start.x" :cy="geometry.start.y" r="2.5"/><circle :cx="geometry.end.x" :cy="geometry.end.y" r="3"/></svg></template>
<style>
.aw-poi-panel-connector{position:absolute;inset:0;width:100%;height:100%;z-index:7;pointer-events:none;overflow:visible;color:var(--connector-color)}.aw-poi-panel-connector path{fill:none;stroke:currentColor;vector-effect:non-scaling-stroke}.aw-poi-panel-connector .connector-halo{stroke-width:7;opacity:.07}.aw-poi-panel-connector .connector-line{stroke-width:1.3;opacity:.65}.aw-poi-panel-connector .connector-flow{stroke-width:1.7;stroke-dasharray:7 70;stroke-linecap:round;opacity:.9;animation:poi-panel-flow 3s linear infinite}.aw-poi-panel-connector circle{fill:currentColor;stroke:#0c1725;stroke-width:1.5;vector-effect:non-scaling-stroke}@keyframes poi-panel-flow{to{stroke-dashoffset:-154}}@media(prefers-reduced-motion:reduce){.aw-poi-panel-connector .connector-flow{animation:none}}
</style>
