import * as THREE from 'three';
import {MAKES} from './carPhysics.js';
export function createVehicleFleet(game){
 const scene=game.scene;const list=[];
 function buildMesh(kind){
  const m=MAKES[kind];const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(m.w,m.len*0.16+0.5,m.len),new THREE.MeshLambertMaterial({color:m.col}));
  body.position.y=0.55;body.castShadow=true;g.add(body);
  const glass=new THREE.Mesh(new THREE.BoxGeometry(m.w*0.86,0.42,m.len*0.42),new THREE.MeshLambertMaterial({color:0x1a2a3a,emissive:0x0a1420,emissiveIntensity:0.6}));
  glass.position.set(0,1.05,-m.len*0.06);g.add(glass);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(m.w*0.8,0.14,m.len*0.5),new THREE.MeshLambertMaterial({color:m.col}));
  roof.position.set(0,1.28,-m.len*0.05);g.add(roof);
  const wheelG=new THREE.CylinderGeometry(0.36,0.36,0.24,10);
  const wheelM=new THREE.MeshLambertMaterial({color:0x14141a});
  for(const[wx,wz]of[[-m.w/2+0.15,m.len*0.32],[m.w/2-0.15,m.len*0.32],[-m.w/2+0.15,-m.len*0.32],[m.w/2-0.15,-m.len*0.32]]){
   const w=new THREE.Mesh(wheelG,wheelM);w.rotation.z=Math.PI/2;w.position.set(wx,0.36,wz);g.add(w)}
  const hl=new THREE.Mesh(new THREE.BoxGeometry(m.w*0.9,0.16,0.1),new THREE.MeshBasicMaterial({color:0xfff2c0}));
  hl.position.set(0,0.62,m.len/2);g.add(hl);
  const tl=new THREE.Mesh(new THREE.BoxGeometry(m.w*0.9,0.16,0.1),new THREE.MeshBasicMaterial({color:0xff2a2a}));
  tl.position.set(0,0.62,-m.len/2);g.add(tl);
  if(kind==='cab'){const s=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.24,0.5),new THREE.MeshBasicMaterial({color:0xffd23d}));s.position.set(0,1.45,0);g.add(s)}
  if(kind==='interceptor'||kind==='bulwark'){
   const bar=new THREE.Mesh(new THREE.BoxGeometry(m.w*0.7,0.18,0.5),new THREE.MeshBasicMaterial({color:0xffffff}));
   bar.position.set(0,1.42,-m.len*0.1);g.add(bar);g.userData.bar=bar;
   const r=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.2,0.52),new THREE.MeshBasicMaterial({color:0xff2020}));r.position.set(-0.4,1.42,-m.len*0.1);g.add(r);
   const b=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.2,0.52),new THREE.MeshBasicMaterial({color:0x2040ff}));b.position.set(0.4,1.42,-m.len*0.1);g.add(b);
   g.userData.barR=r;g.userData.barB=b}
  if(kind==='comet'){const rb=new THREE.Mesh(new THREE.BoxGeometry(m.w*0.6,0.16,m.len*0.24),new THREE.MeshLambertMaterial({color:0x1a1a1a}));rb.position.set(0,1.32,-m.len*0.2);g.add(rb)}
  return g}
 return{list,
  spawn(kind,x,z,heading){const m=MAKES[kind]||MAKES.tide;
   const mesh=buildMesh(kind);scene.add(mesh);
   const v={kind,mesh,position:new THREE.Vector3(x,0,z),pos:null,heading:heading||0,velocity:new THREE.Vector3(),speed:0,health:m.hp,maxHp:m.hp,parked:false,burning:0,exploded:false,smoke:0,driver:null,owner:null};
   v.pos=v.position;list.push(v);return v},
  remove(v){const i=list.indexOf(v);if(i>=0)list.splice(i,1);scene.remove(v.mesh)},
  update(dt,t){for(const v of list){
   v.mesh.position.copy(v.position);v.mesh.position.y=0;v.mesh.rotation.y=v.heading;
   if(v.mesh.userData.barR){const on=Math.floor(t*6)%2===0;
    v.mesh.userData.barR.visible=on;v.mesh.userData.barB.visible=!on}
   if(v.burning>0){v.mesh.position.y=0.1*Math.sin(t*40)}
   if(v.smoke>0&&game.effects)game.effects.smoke(v.position.x,0.8,v.position.z,v.smoke,dt)}}}}
