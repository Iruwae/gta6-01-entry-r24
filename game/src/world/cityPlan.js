import {makeRng,clamp} from '../core/rng.js';
export const ROAD_PITCH=90,ROAD_W=16,BEACH_ROAD_Z=90;
export const DISTRICTS=[
 {name:'PANTAI MERPATI',col:'#e8c98a',x0:-450,x1:450,z0:40,z1:98},
 {name:'PASAR SENJA',col:'#e07a4f',x0:-450,x1:-90,z0:98,z1:190},
 {name:'KOTA LAMA',col:'#c9a06a',x0:-90,x1:90,z0:98,z1:190},
 {name:'MENARA KACA',col:'#7fb3d8',x0:90,x1:450,z0:98,z1:190},
 {name:'KAMPUNG MANGGA',col:'#8fbf6a',x0:-450,x1:-90,z0:190,z1:280},
 {name:'PELABUHAN',col:'#8a8f96',x0:-90,x1:90,z0:190,z1:280},
 {name:'BUKIT HIJAU',col:'#6a9f5a',x0:90,x1:450,z0:190,z1:280},
 {name:'PULAU KARANG',col:'#e8b4c8',x0:520,x1:760,z0:-120,z1:120}];
export const STREETS=[{n:'JL. MERPATI',z:90},{n:'JL. KENANGA',z:180},{n:'JL. MELATI',z:270},{n:'JL. TERATAI',z:360},{n:'JL. NELAYAN',x:-270},{n:'JL. KARANG',x:-180},{n:'JL. SENJA',x:-90},{n:'JL. PANTAI',x:0},{n:'JL. MANGGA',x:90},{n:'JL. BUKIT',x:180},{n:'JL. PELABUHAN',x:270}];
export const PLACES=[
 {id:'garage',name:'Bengkel Sari',x:-40,z:120},{id:'diner',name:'Warung Sari',x:-160,z:100},
 {id:'chopshop',name:'Bengkel Potong',x:40,z:300},{id:'gunshop',name:'Toko Senjata',x:120,z:120},
 {id:'respray',name:'Cat Mobil Jaya',x:-120,z:300},{id:'hospital',name:'Klinik Sehat',x:200,z:300},
 {id:'hq',name:'Polsek Teluk',x:-300,z:300},{id:'tower',name:'Menara Senja',x:220,z:140},
 {id:'club',name:'Klub Ombak',x:320,z:140},{id:'pier',name:'Dermaga Merpati',x:200,z:60},
 {id:'docks',name:'Pelabuhan',x:0,z:340},{id:'radio',name:'Studio Senja 97.5',x:60,z:220},
 {id:'lighthouse',name:'Mercusuar',x:640,z:-80},{id:'marina',name:'Marina',x:560,z:40},
 {id:'villa',name:'Vila Bukit',x:300,z:240},{id:'foodstand',name:'Warung Ombak',x:-220,z:60},
 {id:'parkgate',name:'Taman Merpati',x:-320,z:220},{id:'market',name:'Pasar Senja',x:-220,z:140}];
export function createPlan(seed){
 const rng=makeRng(seed^0x9e3779b9);
 const jx=[];for(let x=-360;x<=360;x+=90)jx.push(x);
 const jz=[90,180,270,360];
 const junctions=[];const byKey=new Map();
 for(const x of jx)for(const z of jz){const id='j'+((x+360)/90)+'-'+((z-90)/90);const j={id,x,z};junctions.push(j);byKey.set(x+','+z,j)}
 const blocks=[];
 for(let i=0;i<jx.length-1;i++)for(let k=0;k<jz.length-1;k++){
  const x0=jx[i]+8,z0=jz[k]+8,x1=jx[i+1]-8,z1=jz[k+1]-8;
  const cx=(x0+x1)/2,cz=(z0+z1)/2;
  const d=DISTRICTS.find(d=>cx>=d.x0&&cx<d.x1&&cz>=d.z0&&cz<d.z1)||DISTRICTS[2];
  blocks.push({x0,z0,x1,z1,cx,cz,district:d.name,seed:rng.int(1,99999)})}
 return{junctions,blocks,seed,
  nearestJunction(x,z){let best=null,bd=1e18;for(const j of junctions){const d=(j.x-x)*(j.x-x)+(j.z-z)*(j.z-z);if(d<bd){bd=d;best=j}}return best},
  districtAt(x,z){for(const d of DISTRICTS)if(x>=d.x0&&x<d.x1&&z>=d.z0&&z<d.z1)return d;return DISTRICTS[0]},
  streetAt(x,z){let best=null,bd=1e18;for(const s of STREETS){const d=s.z!==undefined?Math.abs(z-s.z):Math.abs(x-s.x);if(d<bd){bd=d;best=s}}return best},
  groundAt(x,z){
   if(z<50&&z>-20)return 0.02;
   if(z<=-20)return -0.7;
   if(z>=82&&z<=98&&x>=-450&&x<=450)return 0;
   if(z>=98&&z<=368&&x>=-368&&x<=368)return 0.15;
   if(x>=520&&x<=760&&z>=-120&&z<=120)return 0.15;
   return 0.15},
  onRoad(x,z){for(const zz of jz)if(Math.abs(z-zz)<=8&&x>=-368&&x<=368)return true;
   for(const xx of jx)if(Math.abs(x-xx)<=8&&z>=82&&z<=368)return true;return false},
  clampLand(x,z){return{x:clamp(x,-450,780),z:clamp(z,-40,368)}}}
}
