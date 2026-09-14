<script setup>
defineProps({paths:{type:Array,required:true},nodes:{type:Array,default:()=>[]},color:{default:'#9cefff'},duration:{default:7},delay:{default:-1.6},secondary:Boolean});
</script>
<template>
 <g class="flow-system" :class="{secondary}" :style="{'--flow-color':color,'--flow-duration':duration+'s','--flow-delay':delay+'s'}" fill="none" stroke-linecap="round" aria-hidden="true">
  <g v-for="(path,i) in paths" :key="i">
   <path class="flow-guide" :d="path" vector-effect="non-scaling-stroke"/>
   <g class="flow-envelope">
    <path v-for="(s,j) in [{length:132,width:9,opacity:.1},{length:120,width:2.1,opacity:.19},{length:78,width:2.1,opacity:.28},{length:40,width:2.1,opacity:.48},{length:7,width:2.7,opacity:1}]" :key="j" class="flow-segment" :d="path" pathLength="1000" vector-effect="non-scaling-stroke" :style="{'--segment':s.length,'--offset-start':s.length+'px','--offset-end':(s.length-1135)+'px','stroke-dasharray':s.length+' '+(1000-s.length),'stroke-width':s.width,opacity:s.opacity}"/>
   </g>
  </g>
  <g v-for="([x,y],i) in nodes" :key="i" class="flow-node" :style="{'--node-order':i%2}" :transform="`translate(${x} ${y})`">
   <circle class="node-ring" r="7" vector-effect="non-scaling-stroke"/>
   <path d="M-12 0H-9M9 0H12M0 -12V-9M0 9V12" stroke-width=".6" opacity=".55" vector-effect="non-scaling-stroke"/>
   <circle class="node-core" r="2.3"/>
  </g>
 </g>
</template>
<style scoped>
.flow-system{stroke:var(--flow-color);pointer-events:none}.flow-guide{stroke-width:.65;opacity:.17}.flow-segment{animation:flow-travel var(--flow-duration) linear infinite;animation-delay:var(--flow-delay)}.flow-envelope{animation:flow-envelope var(--flow-duration) linear infinite;animation-delay:var(--flow-delay)}.flow-node{stroke:var(--flow-color)}.node-ring{stroke-width:.7;opacity:.4;animation:flow-node-bloom var(--flow-duration) ease-out infinite;animation-delay:var(--flow-delay);transform-box:fill-box;transform-origin:center}.node-core{fill:var(--flow-color);stroke:none;animation:flow-node-light var(--flow-duration) ease-in-out infinite;animation-delay:var(--flow-delay)}.secondary{opacity:.58}.secondary .flow-guide{opacity:.11}.secondary .flow-segment{stroke-width:.8!important}.secondary .flow-segment:first-child{display:none}
@keyframes flow-travel{from{stroke-dashoffset:var(--offset-start)}to{stroke-dashoffset:var(--offset-end)}}
@keyframes flow-envelope{0%,100%{opacity:0}6%,86%{opacity:1}97%{opacity:0}}
@keyframes flow-node-bloom{0%,36%,73%,100%{opacity:.2;transform:scale(.85)}46%{opacity:.75;transform:scale(1)}62%{opacity:0;transform:scale(1.65)}}
@keyframes flow-node-light{0%,32%,75%,100%{opacity:.35}44%,58%{opacity:1}}
@media(prefers-reduced-motion:reduce){.flow-segment,.flow-envelope,.node-ring,.node-core{animation:none}.flow-envelope{display:none}.node-core{opacity:.6}}
</style>
