<script setup>
import {sitePath} from '../paths.js';
</script>
<template>
 <div class="city-panel-detail" aria-hidden="true">
  <svg class="panel-material" viewBox="42 39 1448 945" preserveAspectRatio="none">
   <image :href="sitePath('/assets/city-panel-glass.png')" width="1536" height="1024" opacity=".64"/>
   <g fill="none" stroke="#c6efff" stroke-width="1" vector-effect="non-scaling-stroke">
    <path class="panel-material-glint" d="M49 176V80L85 46H475" pathLength="1000"/>
    <path class="panel-material-glint" d="M1482 849V945L1446 978H1056" pathLength="1000"/>
   </g>
  </svg>
 </div>
</template>
<style>
.city-panel-detail{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;border-radius:inherit}.panel-material{display:block;width:100%;height:100%}.panel-material-glint{stroke-dasharray:130 870;animation:city-material-glint 8s ease-in-out infinite;vector-effect:non-scaling-stroke}
@keyframes city-material-glint{0%,20%{stroke-dashoffset:150px;opacity:0}30%,65%{opacity:.7}80%,100%{stroke-dashoffset:-1000px;opacity:0}}
</style>
