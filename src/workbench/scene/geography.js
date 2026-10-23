import {sitePath} from '../../paths.js';
export const provinceNames={'Hainan Province':'海南','Taiwan Province':'台湾','Guangxi Zhuang Autonomous Region':'广西','Fujian Province':'福建','Yunnan Province':'云南','Guizhou Province':'贵州','Jiangxi Province':'江西','Hunan Province':'湖南','Zhejiang Province':'浙江','Shanghai Municipality':'上海','Chongqing Municipality':'重庆','Hubei Province':'湖北','Sichuan Province':'四川','Anhui Province':'安徽','Jiangsu Province':'江苏','Henan Province':'河南','Tibet Autonomous Region':'西藏','Shandong Province':'山东','Qinghai Province':'青海','Ningxia Ningxia Hui Autonomous Region':'宁夏','Shaanxi Province':'陕西','Tianjin Municipality':'天津','Shanxi Province':'山西','Beijing Municipality':'北京','Gansu Province':'甘肃','Hebei Province':'河北','Liaoning Province':'辽宁','Jilin Province':'吉林','Xinjiang Uyghur Autonomous Region':'新疆','Inner Mongolia Autonomous Region':'内蒙古','Heilongjiang Province':'黑龙江','Macau Special Administrative Region':'澳门','Hong Kong Special Administrative Region':'香港','Guangzhou Province':'广东'};
const cache=new Map();
export async function loadRegions(country='china'){
 const file=country==='japan'?'japan-prefectures':'china-provinces';
 if(!cache.has(file))cache.set(file,fetch(sitePath('/assets/maps/'+file+'.geojson')).then(r=>{if(!r.ok)throw Error('行政区数据加载失败');return r.json();}).catch(e=>{cache.delete(file);throw e;}));
 return cache.get(file);
}
export function projectRegions(geo,region='all'){
 const features=geo.features.filter(f=>region==='all'||f.properties.shapeName===region||provinceNames[f.properties.shapeName]===region);
 if(!features.length)throw Error('没有匹配的行政区');
 const merc=([x,y])=>[x,Math.log(Math.tan(Math.PI/4+Math.max(-85,Math.min(85,y))*Math.PI/360))*180/Math.PI];
 const polygons=f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
 const all=features.flatMap(f=>polygons(f).flatMap(p=>p.flatMap(r=>r.map(merc))));
 const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=56/Math.max(maxX-minX,maxY-minY);
 return features.map(f=>({name:provinceNames[f.properties.shapeName]||f.properties.shapeName,polygons:polygons(f).map(p=>p.map(r=>r.map(c=>{const [x,y]=merc(c);return [(x-(minX+maxX)/2)*scale,(y-(minY+maxY)/2)*scale];})))}));
}
