<script setup>
import { CloudSun, Expand, Minimize } from 'lucide-vue-next';
import SvgFlowRails from './SvgFlowRails.vue';
defineProps({clock:String,date:String,weekday:String,fullscreen:Boolean});
defineEmits(['fullscreen']);
// Traced against the original 1774 × 887 generated artwork. The image and
// every light trail share this viewBox, including at responsive breakpoints.
const leftRail='M0 476 H438 L527 566 H887';
const rightRail='M1774 476 H1335 L1247 566 H887';
</script>

<template>
  <header class="city-header">
    <div class="header-art-stage" aria-hidden="true">
      <svg class="header-art" viewBox="0 328 1774 276" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="header-edge-fade"><stop stop-color="#2eaecb" stop-opacity=".2"/><stop offset=".3" stop-color="#71e4ff" stop-opacity=".65"/><stop offset=".5" stop-color="#b7f8ff"/><stop offset=".7" stop-color="#71e4ff" stop-opacity=".65"/><stop offset="1" stop-color="#2eaecb" stop-opacity=".2"/></linearGradient>
          <linearGradient id="header-bottom-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".78" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
          <mask id="header-art-mask"><rect x="0" y="328" width="1774" height="276" fill="url(#header-bottom-fade)"/></mask>
        </defs>
        <image href="/assets/header-command-frame.png" x="0" y="0" width="1774" height="887" preserveAspectRatio="none" mask="url(#header-art-mask)"/>
        <SvgFlowRails :paths="[leftRail,rightRail]" :nodes="[[438,476],[1335,476],[527,566],[1247,566]]" color="#a9f5ff" :duration="6.8"/>
        <SvgFlowRails :paths="['M0 459H424L512 548H756','M1774 459H1350L1262 548H1018']" color="#51bdde" :duration="6.8" :secondary="true"/>
        <SvgFlowRails :paths="['M0 343H680','M1774 343H1094']" color="#6ebfdb" :duration="6.8" :secondary="true"/>
        <g fill="#90eaf2" class="city-core-detail">
          <rect v-for="i in 9" :key="i" :x="837+i*9" y="580" width="4" :height="i===5?10:5" :opacity="i===5?1:.42"/>
        </g>
        <g stroke="#458a9b" stroke-width=".65" fill="none" opacity=".55"><path d="M703 575H807L817 585M1071 575H967L957 585"/><path d="M785 356H824M950 356H989"/></g>
      </svg>
    </div>

    <div class="header-identity">
      <svg class="identity-mark" viewBox="0 0 42 44" fill="none" aria-hidden="true">
        <path d="M21 1 39 11V33L21 43 3 33V11Z" stroke="#428ba1" stroke-width=".8"/>
        <path d="M21 5 35 13V31L21 39 7 31V13Z" fill="#123144" fill-opacity=".65"/>
        <path d="M11 29V21L16 18V29M20 29V12L25 9V29M29 29V17L32 19V29M10 33H33" stroke="#a3edf6" stroke-width="1.3"/>
        <path d="M21 1 39 11V18M3 27V33L21 43" stroke="#87eaf6" stroke-width="1.6"/>
      </svg>
      <div class="identity-copy"><strong>SHANGHAI<span>上海</span></strong><p>城市数字孪生平台 <span class="os-label">CITY OS 3.0</span></p></div>
    </div>

    <div class="header-title-block">
      <div class="header-eyebrow"><span></span><b>城市运行 · 全域感知</b><span></span></div>
      <h1>上海智慧城市运行中心</h1>
      <p>SHANGHAI SMART CITY OPERATIONS CENTER</p>
    </div>

    <div class="header-telemetry">
      <div class="header-weather"><CloudSun :size="22" :stroke-width="1.3"/><div><strong>26<small>°C</small></strong><span>晴 <i>·</i> 空气优</span></div></div>
      <span class="telemetry-divider"></span>
      <div class="header-time"><time>{{clock}}</time><span>{{date}} <i>{{weekday}}</i></span></div>
      <button class="header-fullscreen" @click="$emit('fullscreen')" :aria-label="fullscreen?'退出全屏':'进入全屏'" :title="fullscreen?'退出全屏':'进入全屏'"><component :is="fullscreen?Minimize:Expand" :size="16" :stroke-width="1.4"/></button>
    </div>
  </header>
</template>

<style scoped>
.city-header{height:126px;position:relative;margin:0 -24px;isolation:isolate;overflow:hidden;background:#050f1b;--title-size:clamp(24px,2.03vw,37px)}
.header-art-stage{position:absolute;inset:0;pointer-events:none;z-index:-1}
.header-art{display:block;width:100%;height:100%}.city-core-detail{animation:city-core-arrival 6.8s linear infinite;animation-delay:-1.6s}@keyframes city-core-arrival{0%,65%,100%{opacity:.35}82%,90%{opacity:1}}
.header-title-block{position:absolute;left:50%;top:49%;transform:translate(-50%,-50%);width:41%;text-align:center;white-space:nowrap}
.header-title-block h1{font-size:var(--title-size);font-weight:600;letter-spacing:.15em;padding-left:.15em;line-height:1.45;margin:3px 0 4px;color:#e8fbff;text-shadow:0 1px 0 #82c5dc66,0 0 22px #319dc555}
.header-title-block>p{margin:0;color:#80a9bb;font-family:'Barlow Condensed',sans-serif;font-size:clamp(8px,.64vw,12px);font-weight:400;letter-spacing:.27em;padding-left:.27em;line-height:1.6}
.header-eyebrow{display:flex;justify-content:center;align-items:center;gap:12px;color:#65a7bc;font-size:8px;letter-spacing:.35em;line-height:1.5}
.header-eyebrow b{font-weight:400}.header-eyebrow>span{width:25px;height:1px;background:linear-gradient(90deg,transparent,#498fa3)}.header-eyebrow>span:last-child{transform:scaleX(-1)}
.header-identity{position:absolute;left:28px;top:27px;display:flex;align-items:center;gap:12px;white-space:nowrap}
.identity-mark{width:35px;height:39px;filter:drop-shadow(0 0 7px #42b7d022)}
.identity-copy strong{display:flex;align-items:center;gap:11px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.17em;font-size:19px;line-height:1.1;color:#d3e9f0;font-weight:500}
.identity-copy strong>span{font-family:'Noto Sans SC',sans-serif;font-size:10px;letter-spacing:.2em;color:#7599ab;border-left:1px solid #345163;padding-left:11px}
.identity-copy p{font-size:9px;letter-spacing:.14em;color:#658b9f;margin:7px 0 0;line-height:1.3}
.os-label{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:.07em;color:#466b82;margin-left:9px}
.header-telemetry{position:absolute;right:28px;top:27px;display:flex;align-items:center;gap:16px;white-space:nowrap}
.header-weather{display:flex;align-items:center;gap:9px;color:#82bacb}.header-weather strong{font-family:'Barlow Condensed',sans-serif;font-size:23px;color:#c4dfe9;line-height:1;font-weight:400}.header-weather small{font-size:13px;margin-left:2px;color:#8bb5c6}.header-weather>div>span{display:block;font-size:8px;color:#6f96a9;margin-top:5px;letter-spacing:1px}.header-weather i{font-style:normal;margin:0 3px;color:#3d6a80}.telemetry-divider{height:27px;width:1px;background:linear-gradient(transparent,#345367,transparent)}
.header-time{min-width:104px}.header-time time{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:500;font-variant-numeric:tabular-nums;letter-spacing:.075em;font-size:28px;line-height:1;color:#d5ecf3;text-shadow:0 0 15px #5fd8e41f}.header-time>span{display:block;font-family:monospace;font-size:9px;letter-spacing:.05em;color:#648b9f;margin-top:6px}.header-time i{font-family:'Noto Sans SC',sans-serif;font-size:8px;font-style:normal;margin-left:6px;color:#608499}.header-fullscreen{width:29px;height:29px;border:1px solid #25475988;display:grid;place-items:center;color:#7199ae;background:#0a223144;margin-left:2px}.header-fullscreen:hover{background:#164458;color:#baf5ff;border-color:#4d9bb2}.header-fullscreen:focus-visible{outline:2px solid #91f2fa;outline-offset:4px}
@media(min-width:1700px){.city-header{height:137px;margin:0 -32px}.header-identity{left:36px;top:32px}.header-telemetry{right:36px;top:30px;gap:19px}.identity-copy strong{font-size:21px}.identity-copy p{font-size:10px}.header-time time{font-size:30px}.header-eyebrow{font-size:9px}}
@media(max-width:1250px){.city-header{margin:0 -16px;--title-size:25px}.header-identity{left:20px;gap:8px}.identity-mark{width:28px}.identity-copy strong{font-size:17px}.identity-copy strong>span,.os-label{display:none}.identity-copy p{font-size:8px}.header-telemetry{right:20px;gap:10px}.header-weather{gap:5px}.header-weather>svg{width:18px}.header-time time{font-size:25px}.header-time{min-width:93px}.header-fullscreen{width:25px;height:25px}.header-title-block>p{font-size:8px;letter-spacing:.18em}}
@media(max-width:1100px){.city-header{height:140px}.header-art-stage{top:33px;width:max(100%,1000px);left:50%;right:auto;transform:translateX(-50%)}.header-title-block{top:62%;width:auto;--title-size:27px}.header-identity{top:12px}.header-telemetry{top:12px}.identity-mark{height:29px}.header-time time{font-size:23px}.header-time>span{font-size:8px;margin-top:4px}.header-weather{display:none}.telemetry-divider{display:none}.header-eyebrow{font-size:7px;letter-spacing:.25em;gap:9px}.header-title-block h1{margin:2px 0 3px}.header-title-block>p{font-size:8px;letter-spacing:.23em}}
@media(max-width:620px){.city-header{margin:0 -12px;height:153px}.header-art-stage{top:45px;width:920px}.header-title-block{top:65%;--title-size:clamp(20px,5.5vw,27px)}.header-title-block h1{letter-spacing:.11em;padding-left:.11em}.header-title-block>p{font-size:7px;letter-spacing:.15em}.header-eyebrow{font-size:7px;letter-spacing:.18em;margin-bottom:3px}.header-identity{left:15px;top:13px;gap:7px}.identity-copy strong{font-size:15px}.identity-copy p{font-size:7px;letter-spacing:.1em;margin-top:5px}.identity-mark{width:25px;height:29px}.header-telemetry{right:15px;top:13px;gap:8px}.header-time{min-width:87px}.header-time time{font-size:22px}.header-time i{font-size:7px;margin-left:3px}.header-time>span{font-size:7px}.header-fullscreen{width:24px;height:24px}}
@media(prefers-reduced-motion:reduce){.city-core-detail{animation:none}}
</style>
