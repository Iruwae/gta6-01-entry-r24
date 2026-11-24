import {MAKES,stepCar} from './carPhysics.js';
const MIX=[['tide',5],['fizz',4],['cab',3],['hauler',2],['vanette',2],['brava',2],['comet',1],['bus',1]];
export function createTraffic(game){
 const fleet=game.fleet;const plan=game.plan;let timer=0;
 function randRoadPoint(rng,minD,maxD){const p=game.player?game.player.position:{x:0,z:90};
  for(let i=0;i<20;i++){const j=plan.junctions[Math.floor(rng.next()*plan.junctions.length)];
   const x=j.x+(rng.next()-0.5)*60,z=j.z+(rng.next()-0.5)*60;
   const d=Math.hypot(x-p.x,z-p.z);if(d>=minD&&d<=maxD)return{x,z}}return null}
 function pickKind(rng){if(rng.next()<0.07)return'interceptor';let tot=0;for(const[,w]of MIX)tot+=w;
  let r=rng.next()*tot;for(const[k,w]of MIX){r-=w;if(r<=0)return k}return'tide'}
 return{update(dt){
  timer-=dt;if(timer>0)return;timer=0.2;
  const rng=game.rng;const p=game.player?game.player.position:{x:0,z:90};
  const moving=fleet.list.filter(v=>!v.parked&&v.driver==='traffic').length;
  const parked=fleet.list.filter(v=>v.parked&&v.driver!=='player').length;
  if(moving<24){const pt=randRoadPoint(rng,80,200);
   if(pt){const kind=pickKind(rng);const j=plan.nearestJunction(pt.x,pt.z);
    const v=fleet.spawn(kind,pt.x,pt.z,rng.next()*Math.PI*2);v.driver='traffic';
    v.cruise=9.5+rng.next()*4;v.targetJ=j;v.panic=0;v.blocked=0}}
  if(parked<18){const pt=randRoadPoint(rng,80,190);
   if(pt){const kind=pickKind(rng);const v=fleet.spawn(kind,pt.x,pt.z,rng.next()*Math.PI*2);v.parked=true;v.driver=null}}
  for(const v of[...fleet.list]){
   if(v.driver!=='traffic')continue;
   const d=Math.hypot(v.position.x-p.x,v.position.z-p.z);
   if(d>250){fleet.remove(v);continue}
   if(v.panic>0){v.panic-=dt}
   const j=v.targetJ||plan.nearestJunction(v.position.x,v.position.z);
   const dx=j.x-v.position.x,dz=j.z-v.position.z,dist=Math.hypot(dx,dz);
   if(dist<6){const opts=plan.junctions.filter(q=>Math.hypot(q.x-v.position.x,q.z-v.position.z)<100&&q!==j);
    v.targetJ=opts.length?opts[Math.floor(rng.next()*opts.length)]:j}
   const want=Math.atan2(dx,dz);let dh=want-v.heading;
   while(dh>Math.PI)dh-=Math.PI*2;while(dh<-Math.PI)dh+=Math.PI*2;
   const sp=Math.hypot(v.velocity.x,v.velocity.z);
   const inp={f:true,b:false,hb:false,l:dh>0.15,r:dh<-0.15};
   if(v.panic>0){inp.f=true}
   stepCar(v,dt,inp,game.collision);
   if(sp<1){v.blocked=(v.blocked||0)+dt;if(v.blocked>5){v.position.x+=Math.sin(v.heading)*2;v.position.z+=Math.cos(v.heading)*2;v.blocked=0}}
   else v.blocked=0;
  }},
  panicAt(x,z,r){for(const v of fleet.list){if(v.driver!=='traffic')continue;
   if(Math.hypot(v.position.x-x,v.position.z-z)<r)v.panic=10}}}}
