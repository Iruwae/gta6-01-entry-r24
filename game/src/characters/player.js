import * as THREE from 'three';
import {clamp} from '../core/rng.js';
export function makeFigure(game,opts){
 const o=opts||{};const g=new THREE.Group();
 const skin=o.skin||0xe8b88a,shirt=o.shirt||0xc23a2a,pants=o.pants||0x2a3a5a,hair=o.hair||0x1a1a1a;
 const torso=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.62,0.28),new THREE.MeshLambertMaterial({color:shirt}));
 torso.position.y=1.18;torso.castShadow=true;g.add(torso);
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(0.54,0.08,0.3),new THREE.MeshLambertMaterial({color:0xf2c230}));
 stripe.position.y=1.32;g.add(stripe);
 const head=new THREE.Mesh(new THREE.SphereGeometry(0.21,10,8),new THREE.MeshLambertMaterial({color:skin}));
 head.position.y=1.68;g.add(head);
 const hairM=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,8,0,Math.PI*2,0,Math.PI*0.55),new THREE.MeshLambertMaterial({color:hair}));
 hairM.position.y=1.72;g.add(hairM);
 const armL=new THREE.Group(),armR=new THREE.Group();
 const armGeo=new THREE.BoxGeometry(0.14,0.62,0.14);
 const aL=new THREE.Mesh(armGeo,new THREE.MeshLambertMaterial({color:shirt}));aL.position.y=-0.28;armL.add(aL);
 const aR=new THREE.Mesh(armGeo,new THREE.MeshLambertMaterial({color:shirt}));aR.position.y=-0.28;armR.add(aR);
 armL.position.set(-0.34,1.46,0);armR.position.set(0.34,1.46,0);g.add(armL);g.add(armR);
 const legL=new THREE.Group(),legR=new THREE.Group();
 const legGeo=new THREE.BoxGeometry(0.17,0.66,0.17);
 const lL=new THREE.Mesh(legGeo,new THREE.MeshLambertMaterial({color:pants}));lL.position.y=-0.33;legL.add(lL);
 const lR=new THREE.Mesh(legGeo,new THREE.MeshLambertMaterial({color:pants}));lR.position.y=-0.33;legR.add(lR);
 legL.position.set(-0.14,0.88,0);legR.position.set(0.14,0.88,0);g.add(legL);g.add(legR);
 const shoeM=new THREE.MeshLambertMaterial({color:0x1a1a1a});
 const sL=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.1,0.3),shoeM);sL.position.set(0,-0.68,0.05);legL.add(sL);
 const sR=sL.clone();legR.add(sR);
 game.scene.add(g);
 return{group:g,armL,armR,legL,legR,head,torso,
  pose(phase,aiming,down){if(down){g.rotation.x=-Math.PI/2*0.9;g.position.y=0.3;return}
   g.rotation.x=0;const s=Math.sin(phase),c=Math.cos(phase);
   legL.rotation.x=s*0.7;legR.rotation.x=-s*0.7;
   armL.rotation.x=-s*0.55;armR.rotation.x=c*0.55;
   if(aiming){armR.rotation.x=-1.35;armL.rotation.x=-1.2;armL.rotation.z=0.5}
   g.position.y=Math.abs(Math.sin(phase))*0.05}}}
export function createPlayer(game){
 const scene=game.scene;
 const fig=makeFigure(game,{shirt:0xc23a2a,pants:0x2a3a5a,hair:0x1a1a1a});
 const p={position:new THREE.Vector3(-40,0,120),heading:0,velocity:new THREE.Vector3(),onFoot:true,
  vehicle:null,money:150000,health:100,armour:0,god:false,walkPhase:0,
  stats:{kills:0,carsStolen:0,copsEvaded:0,earned:0,driven:0,fares:0,robbed:0,sold:0},
  mesh:fig.group,fig};
 p.placeAt=function(x,z,h){p.position.set(x,0,z);p.heading=h||0;p.velocity.set(0,0,0);
  if(p.vehicle){p.vehicle.driver=null;p.vehicle=null;p.onFoot=true}};
 p.enterVehicle=function(v){if(!v)return;if(v.driver)v.driver=null;
  v.driver='player';p.vehicle=v;v.parked=false;p.onFoot=false;p.stats.carsStolen++;
  game.bus.emit('enter-vehicle',{vehicle:v})};
 p.exitVehicle=function(){if(!p.vehicle)return;const v=p.vehicle;v.driver=null;
  const fx=Math.sin(p.heading),fz=Math.cos(p.heading);
  p.position.set(v.position.x-fx*2,0,v.position.z-fz*2);p.heading=v.heading;p.vehicle=null;p.onFoot=true;
  game.bus.emit('exit-vehicle',{vehicle:v})};
 p.damage=function(n,from){if(p.god)return;let rem=n;
  if(p.armour>0){const ab=Math.min(p.armour,rem*0.8);p.armour-=ab;rem-=ab}
  p.health-=rem;if(p.health<=0){p.health=0;game.bus.emit('wasted',{from})}};
 p.heal=function(n){p.health=Math.min(100+game.respect.bonusHp(),p.health+n)};
 p.update=function(dt,input){
  if(!p.onFoot&&p.vehicle){const inp={f:input.down('KeyW')||input.down('ArrowUp'),b:input.down('KeyS')||input.down('ArrowDown'),
    l:input.down('KeyA')||input.down('ArrowLeft'),r:input.down('KeyD')||input.down('ArrowRight'),hb:input.down('Space')};
   const r=game.carPhysics.stepCar(p.vehicle,dt,inp,game.collision);
   if(r==='boom'&&game.combat)game.combat.explodeAt({x:p.vehicle.position.x,z:p.vehicle.position.z});
   p.position.copy(p.vehicle.position);p.heading=p.vehicle.heading;
   p.stats.driven+=p.vehicle.speed*dt;
   if(input.hit('KeyE'))p.exitVehicle();
   if(input.hit('KeyR')&&game.activities)game.activities.tryRace();
   if(input.hit('KeyT')&&game.activities)game.activities.tryFare();
   if(input.hit('KeyM')&&game.missions)game.missions.next();
   return}
  const sp=(input.down('ShiftLeft')||input.down('ShiftRight'))?8.4:input.down('KeyW')||input.down('ArrowUp')?5.4:2.4;
  const aim=input.down('Mouse1')||input.down('KeyF');
  let mx=0,mz=0;
  if(input.down('KeyW')||input.down('ArrowUp')){mx+=Math.sin(p.heading);mz+=Math.cos(p.heading)}
  if(input.down('KeyS')||input.down('ArrowDown')){mx-=Math.sin(p.heading);mz-=Math.cos(p.heading)}
  if(input.down('KeyA')||input.down('ArrowLeft')){mx-=Math.cos(p.heading);mz+=Math.sin(p.heading)}
  if(input.down('KeyD')||input.down('ArrowRight')){mx+=Math.cos(p.heading);mz-=Math.sin(p.heading)}
  const ml=Math.hypot(mx,mz);const spd=aim?sp*0.75:sp;
  if(ml>0){p.velocity.x=mx/ml*spd;p.velocity.z=mz/ml*spd;
   p.position.x+=p.velocity.x*dt;p.position.z+=p.velocity.z*dt;
   p.walkPhase+=3.1*spd*dt}
  else{p.velocity.x=0;p.velocity.z=0}
  game.collision.resolveCircle(p.position,0.38,0);
  const md=input.mouseDelta();if(md.x)p.heading+=md.x*0.0026;
  if(input.hit('KeyE')){const v=game.fleet.list.find(v=>v!==p.vehicle&&Math.hypot(v.position.x-p.position.x,v.position.z-p.position.z)<4);
   if(v){p.enterVehicle(v);if(game.wanted)game.wanted.crime('carjack',v.position.x,v.position.z)}}
  if(input.hit('Space')&&p.velocity.y===undefined){p.vy=5.6}
  if(p.vy!==undefined){p.position.y+=p.vy*dt;p.vy-=18*dt;if(p.position.y<=0){p.position.y=0;p.vy=undefined}}
  fig.pose(p.walkPhase,aim,p.health<=0);
  fig.group.position.copy(p.position);fig.group.position.y=p.position.y;
  fig.group.rotation.y=p.heading;
  if(input.hit('Mouse0')&&game.combat)game.combat.shoot();
 };
 return p}
