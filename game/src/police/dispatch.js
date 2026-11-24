const CALLSIGNS=['TIDE-12','SURF-07','REEF-22','OMBAK-04','KARANG-09','SENJA-31'];
const TACTICS=['MENGEJAR','MENGEPUNG','MENABRAK','BLOKADE','MENCARI'];
export function createDispatch(game){
 const units=[];let heli=null,heliT=0,roadblock=null,rbTimer=0,spawnT=0;
 function addUnit(i){const p=game.player.position;
  const a=game.rng.next()*Math.PI*2,d=110+game.rng.next()*90;
  const v=game.fleet.spawn(i===0?'interceptor':'interceptor',p.x+Math.cos(a)*d,p.z+Math.sin(a)*d,0);
  v.driver='police';
  const u={callsign:CALLSIGNS[units.length%CALLSIGNS.length],tactic:TACTICS[units.length%TACTICS.length],vehicle:v,from:null,to:null,along:0,stuck:0};
  units.push(u);return u}
 return{units,get helicopter(){return heli},
  syncUnits(){const want=game.wanted.level;
   while(units.length<want)addUnit(units.length);
   while(units.length>want){const u=units.pop();game.fleet.remove(u.vehicle)}
   if(want>=3&&!heli){heli={x:game.player.position.x+260,z:game.player.position.z-200,y:90,angle:0};
    game.bus.emit('notice','Helikopter polisi di udara!')}
   if(want<3)heli=null;
   if(want>=3)rbTimer=Math.max(rbTimer,1)},
  update(dt){const p=game.player.position;const w=game.wanted.level;
   spawnT-=dt;
   if(w>0&&units.length<w&&spawnT<=0){addUnit(units.length);spawnT=Math.max(1.2,4.5-0.6*w)}
   for(const u of units){const v=u.vehicle;
    const dx=p.x-v.position.x,dz=p.z-v.position.z,dist=Math.hypot(dx,dz);
    const want=Math.atan2(dx,dz);let dh=want-v.heading;
    while(dh>Math.PI)dh-=Math.PI*2;while(dh<-Math.PI)dh+=Math.PI*2;
    const lead=Math.min(0.9,dist/60);
    const tx=p.x+Math.sin(v.heading)*0,tx2=p.x+Math.sin(want)*lead*20;
    const inp={f:true,b:false,hb:false,l:dh>0.12,r:dh<-0.12};
    const sp=Math.hypot(v.velocity.x,v.velocity.z);
    if(sp<1){u.stuck+=dt;if(u.stuck>2.2){inp.b=true;inp.f=false;if(u.stuck>3.5)u.stuck=0}}else u.stuck=0;
    game.carPhysics.stepCar(v,dt,inp,game.collision);
    if(dist>12){const mv=Math.min((dist-10)*0.25,1.5);v.position.x+=(p.x-v.position.x)/dist*mv;v.position.z+=(p.z-v.position.z)/dist*mv}
    if(dist<3&&game.player.onFoot===false){v.velocity.x*=0.5;v.velocity.z*=0.5}
    const j=game.plan.nearestJunction(v.position.x,v.position.z);u.from=j.id;
    const j2=game.plan.nearestJunction(p.x,p.z);u.to=j2.id;u.along=Math.min(1,dist/200);
    if(dist>300){game.fleet.remove(v);units.splice(units.indexOf(u),1)}}
   if(heli){heliT+=dt;heli.angle+=dt*0.32;
    heli.x=p.x+Math.cos(heli.angle)*30;heli.z=p.z+Math.sin(heli.angle)*30;
    if(game.effects&&w>=4&&Math.floor(heliT/0.4)!==Math.floor((heliT-dt)/0.4))game.effects.tracer({x:heli.x,y:heli.y,z:heli.z},{x:p.x,y:1,z:p.z})}
   if(w>=3){rbTimer-=dt;
    if(rbTimer<=0){rbTimer=16;
     const fx=Math.sin(game.player.heading),fz=Math.cos(game.player.heading);
     const bx=p.x+fx*140,bz=p.z+fz*140;
     const v1=game.fleet.spawn('interceptor',bx+4,bz,game.player.heading);v1.parked=true;v1.driver='police';
     const v2=game.fleet.spawn('interceptor',bx-4,bz,game.player.heading);v2.parked=true;v2.driver='police';
     roadblock={v1,v2,t:40};game.bus.emit('notice','BLOKADE DI DEPAN!')}}
   if(roadblock){roadblock.t-=dt;
    if(roadblock.t<=0||Math.hypot(p.x-roadblock.v1.position.x,p.z-roadblock.v1.position.z)<14){
     game.fleet.remove(roadblock.v1);game.fleet.remove(roadblock.v2);roadblock=null}}
   if(w===0&&roadblock){game.fleet.remove(roadblock.v1);game.fleet.remove(roadblock.v2);roadblock=null}}}}
