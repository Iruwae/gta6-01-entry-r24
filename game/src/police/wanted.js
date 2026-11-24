export const HEAT_THRESH=[0,10,28,60,110,180];
export const CRIME_HEAT={'kill-officer':36,explosion:26,'assault-officer':16,murder:14,'destroy-vehicle':12,carjack:8,'run-over':7,'ram-police':6,'attack-police-car':6,assault:5,'car-theft':4,gunfire:4};
export function createWanted(game){
 let level=0,heat=0,lockedMin=0,lastReport=0,hiddenTime=0,lastSeen=null,searchR=24;
 return{get level(){return level},get heat(){return heat},
  set(l,min){level=Math.max(0,Math.min(5,l));if(min!==undefined)lockedMin=min;
   if(level<lockedMin)level=lockedMin;heat=HEAT_THRESH[level]||0;
   if(game.dispatch)game.dispatch.syncUnits();game.bus.emit('wanted',{level})},
  lockMin(m){lockedMin=m;if(level<m)this.set(m)},
  crime(kind,x,z){const now=game.time;
   if(kind==='gunfire'&&now-lastReport<1.5)return;lastReport=now;
   const near=game.pedestrians.npcs.some(n=>Math.hypot(n.position.x-x,n.position.z-z)<55);
   const copNear=game.dispatch.units.some(u=>Math.hypot(u.vehicle.position.x-x,u.vehicle.position.z-z)<40);
   if(!near&&!copNear&&kind!=='explosion'&&kind!=='murder')return;
   heat+=(CRIME_HEAT[kind]||4);
   let nl=0;for(let i=0;i<6;i++)if(heat>=HEAT_THRESH[i])nl=i;
   if(nl>level){level=Math.min(5,nl);game.bus.emit('wanted',{level});
    if(game.dispatch)game.dispatch.syncUnits()}
   lastSeen={x,z,t:now};hiddenTime=0},
  update(dt){const p=game.player.position;
   if(level===0){heat=Math.max(0,heat-0.4*dt);return}
   const seen=game.dispatch.units.some(u=>{const d=Math.hypot(u.vehicle.position.x-p.x,u.vehicle.position.z-p.z);
    return d<100&&game.collision.lineOfSight(u.vehicle.position.x,u.vehicle.position.z,p.x,p.z,2)});
   if(seen){hiddenTime=0;lastSeen={x:p.x,z:p.z,t:game.time}}
   else{hiddenTime+=dt;if(hiddenTime>2.5){searchR=Math.min(140,24+7*hiddenTime);
     if(hiddenTime>8+3.5*level){level=Math.max(lockedMin,level-1);heat=HEAT_THRESH[level];
      if(level===0)game.player.stats.copsEvaded++;
      if(game.dispatch)game.dispatch.syncUnits()}}}},
  get searchRadius(){return searchR},get lastSeenPos(){return lastSeen}}}
