<script setup>
import {Link2,Unlink2,RotateCcw} from 'lucide-vue-next';
import Control from './Control.vue';
import {MIN_OBJECT_SCALE,MAX_OBJECT_SCALE,scaleObjectAxis,scaleObjectBy} from '../scene/scaling.js';
const props=defineProps({modelValue:Array,linked:Boolean});
const emit=defineEmits(['update:modelValue','update:linked','commit']);
function axis(index,value){emit('update:modelValue',scaleObjectAxis(props.modelValue,index,value,props.linked));}
function resize(factor){emit('update:modelValue',factor===null?[1,1,1]:scaleObjectBy(props.modelValue,factor));emit('commit');}
</script>
<template>
 <div class="ase-scale-heading"><span>模型缩放 <small>×</small></span><button type="button" :aria-pressed="linked" aria-label="保持缩放比例" :title="linked?'三个轴按当前比例同步调整':'分别调整三个轴'" @click="emit('update:linked',!linked)"><component :is="linked?Link2:Unlink2" :size="12"/>{{linked?'保持比例':'独立轴向'}}</button></div>
 <div class="ase-vector"><Control v-for="(a,i) in ['X','Y','Z']" :key="a" :model-value="modelValue[i]" :label="'缩放 '+a" :min="MIN_OBJECT_SCALE" :max="MAX_OBJECT_SCALE" :step=".05" @update:model-value="axis(i,$event)" @commit="emit('commit')"/></div>
 <div class="ase-scale-presets"><button type="button" aria-label="选中模型缩小至一半" @click="resize(.5)">× 0.5</button><button type="button" aria-label="还原选中模型缩放" @click="resize(null)"><RotateCcw :size="10"/>还原</button><button type="button" aria-label="选中模型放大至两倍" @click="resize(2)">× 2</button></div>
 <p class="ase-scale-note">数值与拖动实时生效，滚轮仅调整视距。</p>
</template>
