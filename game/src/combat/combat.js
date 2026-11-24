import * as THREE from 'three';
export function createCombat(game){
 const scene=game.scene;const tracers=[];
 function raycastShot(ox,oy,oz,dx,dy,dz,range){
  let best=null,bd=range;
  for(const n of game.pedestrians.npcs){const px=n.position.x-ox,pz=n.position.z-oz;
   const t=px*dx+pz*dz;if(t<0||t>bd)continue;
   const ex=ox+dx*t,ez=oz+dz*t;const d2=(ex-n.position.x)*(ex-n.position.x)+(ez-n.position.z)*(ez-n.position.z);
   if(d2<0.6){best={npc:n,dist:t};bd=t}}
  for(const v of game.fleet.list){if(v===game.player.vehicle)continue;
   const px=v.position.x-ox,pz=v.position.z-oz;const t=px*dx+pz*dz;if(t<0||t>bd)continue;
   const ex=ox+dx*t,ez=oz+dz*t;const d2=(ex-v.position.x)*(ex-v.position.x)+(ez-v.position.z)*(ez-v.position.z);
   if(d2<4){best={veh:v,dist:t};bd=t}}
  return best}
 return{
  shoot(){const p=game.player;const w=game.weapons.WEAPONS[game.loadout.selected];
   if(!w)return;const now=game.time;
   if(game._lastShot&&now-game._lastShot<w.interval)return;game._lastShot=now;
   if(!game.loadout.consume(game.loadout.selected))return;
   const origin=p.onFoot?{x:p.position.x,y:1.5,z:p.position.z}:{x:p.vehicle.position.x,y:1.2,z:p.vehicle.position.z};
   const h=p.heading;const dx=Math.sin(h),dz=Math.cos(h);
   const hit=raycastShot(origin.x,origin.y,origin.z,dx,0,dz,w.range);
   const end=hit?{x:origin.x+dx*hit.dist,y:1.2,z:origin.z+dz*hit.dist}:{x:origin.x+dx*w.range,y:1.2,z:origin.z+dz*w.range};
   if(game.effects)game.effects.tracer(origin,end);
   if(game.effects)game.effects.flash(origin);
   if(hit){if(hit.npc){hit.npc.health-=w.dmg;if(hit.npc.health<=0){p.stats.kills++;game.wanted.crime('murder',hit.npc.position.x,hit.npc.position.z);game.pedestrians.panicAt(hit.npc.position.x,hit.npc.position.z,22)}}
    else if(hit.veh){hit.veh.health-=w.dmg*1.5;if(hit.veh.health<=0&&!hit.veh.exploded){hit.veh.exploded=true;this.explodeAt({x:hit.veh.position.x,z:hit.veh.position.z});game.wanted.crime('explosion',hit.veh.position.x,hit.veh.position.z)}}}
   if(game.wanted)game.wanted.crime('gunfire',p.position.x,p.position.z);
   if(game.traffic)game.traffic.panicAt(p.position.x,p.position.z,45)},
  explodeAt(pos){const p=game.player;
   if(game.effects)game.effects.explosion(pos.x,0.8,pos.z);
   if(game.wanted)game.wanted.crime('explosion',pos.x,pos.z);
   if(game.traffic)game.traffic.panicAt(pos.x,pos.z,80);
   game.pedestrians.panicAt(pos.x,pos.z,70);
   for(const n of[...game.pedestrians.npcs]){if(Math.hypot(n.position.x-pos.x,n.position.z-pos.z)<10){n.health-=320;if(n.health<=0)p.stats.kills++}}
   for(const v of game.fleet.list){if(Math.hypot(v.position.x-pos.x,v.position.z-pos.z)<9){v.health-=260;if(v.health<=0&&!v.exploded){v.exploded=true;v.burning=3.2}}}
   if(Math.hypot(p.position.x-pos.x,p.position.z-pos.z)<10)p.damage(60,'explosion')}}}
