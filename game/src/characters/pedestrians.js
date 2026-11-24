import {makeFigure} from './player.js';
import {clamp} from '../core/rng.js';
const SKINS=[0xe8b88a,0xc98a5a,0x8a5a34,0xf2c9a0,0xd8a06a,0xa86a3a];
const HAIRS=[0x1a1a1a,0x3a2a1a,0x6a4a2a,0x8a8a8a,0x2a1a0a,0x4a2a4a,0xaa7a2a];
const SHIRTS=[0xc23a2a,0x2a6ac2,0x3a9a4a,0xe8c84a,0x8a2a6a,0x2aa8a0,0xe8e8e8,0x3a3a3a,0xff8a3d,0x7a5ac2];
const PANTS=[0x2a3a5a,0x3a3a3a,0x5a4a3a,0x2a4a3a,0x6a6a6a];
const NAMES=['Bimo','Sari','Agus','Wulan','Dedi','Rina','Joko','Maya','Andi','Putri','Budi','Lestari','Rizky','Ayu','Fajar','Nina','Eko','Sinta','Hendra','Ratna'];
export function createPedestrians(game){
 const npcs=[];let timer=0;
 function spawn(x,z,kind){
  const rng=game.rng;
  const opts=kind==='guard'?{shirt:0x1a1a1a,pants:0x1a1a1a,hair:0x1a1a1a}:
   kind==='officer'?{shirt:0x1a2a5a,pants:0x1a2a5a,hair:0x1a1a1a}:
   {skin:SKINS[Math.floor(rng.next()*SKINS.length)],hair:HAIRS[Math.floor(rng.next()*HAIRS.length)],
    shirt:SHIRTS[Math.floor(rng.next()*SHIRTS.length)],pants:PANTS[Math.floor(rng.next()*PANTS.length)]};
  const fig=makeFigure(game,opts);
  const n={fig,position:fig.group.position,heading:rng.next()*Math.PI*2,kind:kind||'civilian',
   state:'walk',health:kind==='guard'?130:kind==='officer'?120:100,phase:rng.next()*6,
   speed:1.25+rng.next()*0.65,panic:0,talk:false,name:'',talkLine:'',target:null,cash:8+Math.floor(rng.next()*82)};
  n.position.set(x,0,z);
  if(kind==='guard'){n.name=NAMES[Math.floor(rng.next()*NAMES.length)];
   n.talkLine='Malam, Rak. Senja di teluk paling cantik jam segini. Ada perlu?';
   n.talk=Math.hypot(x+170,z-60)<25}
  if(kind==='civilian'&&rng.next()<0.12){n.name=NAMES[Math.floor(rng.next()*NAMES.length)];
   n.talkLine='Jalan-jalan sore, Mas? Hati-hati, polisi lagi rajin razia.';n.talk=true}
  npcs.push(n);return n}
 return{npcs,spawn,
  update(dt){timer-=dt;
   const pp=game.player.position;
   if(timer<=0){timer=0.15;
    if(npcs.length<34){const a=game.rng.next()*Math.PI*2,d=45+game.rng.next()*80;
     const x=pp.x+Math.cos(a)*d,z=pp.z+Math.sin(a)*d;
     if(game.plan.clampLand(x,z).x===x&&z>40&&z<360)spawn(x,z,'civilian')}}
   for(let i=npcs.length-1;i>=0;i--){const n=npcs[i];
    const d=Math.hypot(n.position.x-pp.x,n.position.z-pp.z);
    if(d>150){game.scene.remove(n.fig.group);npcs.splice(i,1);continue}
    if(n.panic>0){n.panic-=dt;n.state='flee';
     const dx=n.position.x-pp.x,dz=n.position.z-pp.z,dl=Math.hypot(dx,dz)||1;
     n.position.x+=dx/dl*6.4*dt;n.position.z+=dz/dl*6.4*dt;n.heading=Math.atan2(dx,dz)}
    else if(n.state==='cower'){n.fig.pose(0,false,false)}
    else if(n.kind==='guard'&&game.player.onFoot&&d<15){n.state='talk';
     n.heading=Math.atan2(pp.x-n.position.x,pp.z-n.position.z);
     n.fig.pose(0,false,false)}
    else{n.state='walk';
     if(!n.target||Math.hypot(n.target.x-n.position.x,n.target.z-n.position.z)<3){
      const a=game.rng.next()*Math.PI*2;n.target={x:n.position.x+Math.cos(a)*30,z:n.position.z+Math.sin(a)*30}}
     const dx=n.target.x-n.position.x,dz=n.target.z-n.position.z,dl=Math.hypot(dx,dz)||1;
     n.heading=Math.atan2(dx,dz);
     n.position.x+=dx/dl*n.speed*dt;n.position.z+=dz/dl*n.speed*dt;
     n.phase+=3.1*n.speed*dt;n.fig.pose(n.phase,false,false)}
    n.fig.group.position.copy(n.position);n.fig.group.rotation.y=n.heading;
    if(n.health<=0){game.scene.remove(n.fig.group);npcs.splice(i,1)}}
  },
  panicAt(x,z,r){for(const n of npcs){if(Math.hypot(n.position.x-x,n.position.z-z)<r){n.panic=8+Math.random()*6;if(Math.random()<0.14)n.state='cower'}}},
  nearestTalk(maxD){const pp=game.player.position;let best=null,bd=maxD;
   for(const n of npcs){if(!n.talk)continue;const d=Math.hypot(n.position.x-pp.x,n.position.z-pp.z);
    if(d<bd){bd=d;best=n}}return best}}}
