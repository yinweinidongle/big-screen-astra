<script setup>
import {sitePath} from '../paths.js';

import {useId,computed} from 'vue';
import {trimLinePaths} from './pathTrimming';
import {effectSegments,segmentDash,segmentStyle,rippleNodes,lineRadius} from './lineEffects';
const props=defineProps({config:{type:Object,required:true},playing:{type:Boolean,default:true},resolvedPaths:{type:Array,default:null}});
const uid='hdr-'+useId().replace(/[^a-z0-9]/gi,'');
const layers=computed(()=>(props.resolvedPaths||trimLinePaths(props.config.lines,lineRadius)).map(({line,paths})=>({line,segments:effectSegments(line),paths:paths.filter(p=>p.d).map(path=>({...path,nodes:rippleNodes(path.points)}))})));
</script>
<template><svg class="header-composition" :viewBox="`0 0 1600 ${config.height}`" :style="{aspectRatio:`1600 / ${config.height}`}" :preserveAspectRatio="config.fit==='contain'?'xMidYMid meet':config.fit==='cover'?'xMidYMid slice':'none'" role="img" :aria-label="config.title" :class="{'header-paused':!playing}" xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient :id="uid+'-title'" x1="0" y1="0" x2="1" y2="1"><stop :stop-color="config.titleColor"/><stop offset="1" :stop-color="config.titleGradientTo||config.titleColor"/></linearGradient><filter v-for="l in config.lines" :id="uid+l.id" :key="l.id" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1800" :height="config.height+200" color-interpolation-filters="sRGB"><feGaussianBlur :stdDeviation="l.glow/2"/></filter></defs>
 <rect width="1600" :height="config.height" :fill="config.bgColor" :opacity="config.bgOpacity??1"/>
 <svg width="1600" :height="config.height" :viewBox="`${config.background.crop.x} ${config.background.crop.y} ${config.background.crop.w} ${config.background.crop.h}`" preserveAspectRatio="none"><image :href="sitePath(config.background.url)" :width="config.background.width" :height="config.background.height" preserveAspectRatio="none" :opacity="config.background.opacity" :style="{filter:config.background.filter||'none'}"/></svg>
 <g v-for="{line:l,segments,paths} in layers" :key="l.id" :stroke="l.color" fill="none" stroke-linecap="round" :opacity="l.opacity" :class="{'header-spectrum':l.effect==='neon'}" :style="{'--duration':l.duration+'s'}" :data-effect="l.effect">
  <g v-for="(path,i) in paths" :key="i">
   <path :d="path.d" :stroke-width="l.width*.5" opacity=".16"/>
   <path v-if="l.effect==='trail'&&l.glow>0" :d="path.d" pathLength="1000" :stroke-width="l.width*2.2" :filter="`url(#${uid+l.id})`" opacity=".2" :stroke-dasharray="segmentDash(segments[0])" :style="segmentStyle(l,segments[0])" class="header-motion-travel"/>
   <g v-for="(s,j) in segments" :key="l.effect+'-'+j" :transform="s.shift?`translate(0 ${s.shift*l.width})`:undefined" :opacity="s.opacity">
    <path v-if="l.glow>0&&l.effect!=='trail'" :d="path.d" pathLength="1000" :stroke-width="l.width*s.width*2.5" :filter="`url(#${uid+l.id})`" opacity=".55" :stroke-dasharray="segmentDash(s)" :style="segmentStyle(l,s)" :class="'header-motion-'+s.motion"/>
    <path :d="path.d" pathLength="1000" :stroke="s.white?'#f1fcff':undefined" :stroke-width="l.width*s.width" :stroke-dasharray="segmentDash(s)" :style="segmentStyle(l,s)" :class="'header-motion-'+s.motion"/>
   </g>
   <g v-if="l.effect==='ripple'" :style="{'--duration':l.duration+'s'}"><g v-for="(p,j) in path.nodes" :key="j" :transform="`translate(${p.x} ${p.y})`"><circle class="header-node-ripple" r="5" :stroke-width="l.width*.65" :style="{animationDelay:-(j*l.duration/3)+'s'}"/><circle r="2" fill="currentColor" :style="{color:l.color}" stroke="none"/></g></g>
  </g>
 </g>
 <g text-anchor="middle" :font-family="config.fontFamily||'sans-serif'" :style="{filter:config.textGlow?`drop-shadow(0 0 ${config.textGlow}px ${config.titleColor})`:undefined}"><text :x="config.titleX" :y="config.titleY" :fill="config.titleGradient?`url(#${uid}-title)`:config.titleColor" :font-size="config.fontSize" :letter-spacing="config.letterSpacing" :font-weight="config.fontWeight||600" style="paint-order:stroke;stroke:#06121e33;stroke-width:1px">{{config.title}}</text><text :x="config.titleX" :y="config.titleY+(config.subtitleOffset??31)" :fill="config.accent" :font-size="config.subtitleSize" :letter-spacing="config.subtitleSpacing" :opacity="config.subtitleOpacity??.68">{{config.subtitle}}</text></g>
</svg></template>
<style scoped>
.header-composition{display:block;width:100%;height:auto;overflow:hidden}
.header-motion-travel{animation:header-travel var(--duration) linear infinite}
.header-motion-converge{animation:header-converge var(--duration) ease-in-out infinite}
.header-motion-breathe{animation:header-breathe var(--duration) ease-in-out infinite}
.header-motion-flicker{animation:header-flicker 1.4s steps(1) infinite}
.header-motion-spark{animation:header-travel var(--duration) linear infinite,header-flicker .65s steps(1) infinite}
.header-spectrum{animation:header-spectrum var(--duration) linear infinite}
.header-node-ripple{animation:header-node-ripple var(--duration) ease-out infinite;transform-origin:0 0}
.header-paused *{animation-play-state:paused!important}
@keyframes header-travel{from{stroke-dashoffset:var(--offset-start)}to{stroke-dashoffset:var(--offset-end)}}
@keyframes header-converge{0%{stroke-dashoffset:var(--offset-start);opacity:0}10%,70%{opacity:1}100%{stroke-dashoffset:var(--offset-end);opacity:0}}
@keyframes header-breathe{0%,100%{opacity:.12}50%{opacity:1}}
@keyframes header-flicker{0%,15%,23%,44%,53%,69%,82%,100%{opacity:1}10%,19%,38%,49%,64%,77%,94%{opacity:.12}}
@keyframes header-spectrum{from{filter:hue-rotate(0deg)}to{filter:hue-rotate(360deg)}}
@keyframes header-node-ripple{0%{transform:scale(.5);opacity:0}15%{opacity:.9}90%,100%{transform:scale(4);opacity:0}}
@media(prefers-reduced-motion:reduce){.header-composition *{animation:none!important}.header-motion-travel,.header-motion-converge,.header-motion-spark{stroke-dashoffset:-250px}.header-node-ripple{opacity:.5}}
</style>
