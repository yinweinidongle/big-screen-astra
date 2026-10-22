<script setup>
const props=defineProps({modelValue:Number,label:String,min:Number,max:Number,step:{default:1},unit:{default:''}});const emit=defineEmits(['update:modelValue','change']);
function value(e,commit=false){const n=Number(e.target.value);if(!Number.isFinite(n))return;emit('update:modelValue',Math.min(props.max,Math.max(props.min,n)));if(commit)emit('change')}
</script>
<template><div class="studio-range"><label><span>{{label}}</span><span class="range-value"><input type="number" :aria-label="label+'数值'" :value="modelValue" :min="min" :max="max" :step="step" @change="value($event,true)"/>{{unit}}</span></label><input type="range" :aria-label="label" :value="modelValue" :min="min" :max="max" :step="step" :style="{'--range-progress':((modelValue-min)/(max-min)*100)+'%'}" @input="value($event)" @change="emit('change')"/></div></template>
