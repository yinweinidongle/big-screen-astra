import {ref,computed,onMounted,onBeforeUnmount} from 'vue';
export function useDashboard(){const now=ref(new Date()),active=ref(0),running=ref(true),rotate=ref(false),layer=ref('all'),view=ref('perspective'),zoom=ref(0),reset=ref(0),selected=ref(null),period=ref('今日'),toast=ref('');let timer,toastTimer;
const weekday=computed(()=> '星期'+'日一二三四五六'[now.value.getDay()]);
const time=computed(()=>now.value.toLocaleTimeString('zh-CN',{hour12:false}));const date=computed(()=>now.value.toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).replaceAll('/','.'));
function notify(message){toast.value=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.value='',2800)}
async function full(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{notify('请使用浏览器全屏快捷键')}}
function home(){reset.value++;view.value='perspective';rotate.value=false;layer.value='all'}
function close(e){if(e.key==='Escape')selected.value=null}onMounted(()=>{timer=setInterval(()=>now.value=new Date(),1000);document.addEventListener('keydown',close)});onBeforeUnmount(()=>{clearInterval(timer);clearTimeout(toastTimer);document.removeEventListener('keydown',close)});
return {active,running,rotate,layer,view,zoom,reset,selected,period,toast,time,date,weekday,full,home,notify};}
