import * as THREE from 'three';
import {clamp} from '../core/rng.js';
export function createChaseCamera(game){
 const cam=game.camera;let yaw=0,pitch=0.25,shake=0,shakeT=0;
 return{snap(pos,heading){const p=game.player;
   if(!p.onFoot&&p.vehicle){
    const units=game.dispatch.units;
    let pursuer=null,bd=35;
    for(const u of units){const d=Math.hypot(u.vehicle.position.x-p.position.x,u.vehicle.position.z-p.position.z);
     const behind=(u.vehicle.position.x-p.position.x)*Math.sin(heading)+(u.vehicle.position.z-p.position.z)*Math.cos(heading);
     if(behind<0&&d<bd){bd=d;pursuer=u}}
    const fx=Math.sin(heading),fz=Math.cos(heading);
    if(pursuer){const px=pursuer.vehicle.position.x,py=pursuer.vehicle.position.z;
     cam.position.set(px-fx*10,5.0,py-fz*10);
     cam.lookAt(p.position.x+fx*12,1.6,p.position.z+fz*12);
     cam.fov=70;cam.updateProjectionMatrix();return}
    const dist=6.2+0.75*4.6;
    cam.position.set(p.position.x-fx*dist,1.25+0.35*1.4+1.2,p.position.z-fz*dist);
    cam.lookAt(p.position.x+fx*10,1.5,p.position.z+fz*10);
    cam.fov=62;cam.updateProjectionMatrix();return}
   const fx=Math.sin(heading),fz=Math.cos(heading);
   cam.position.set(pos.x-fx*5.2,1.66+1.2,pos.z-fz*5.2);
   cam.lookAt(pos.x+fx*6,1.5,pos.z+fz*6);
   cam.fov=62;cam.updateProjectionMatrix()},
  update(dt){const p=game.player;const input=game.input;
   const md=input.mouseDelta();yaw+=md.x*0.0026;pitch=clamp(pitch+md.y*0.002,-0.32,1.25);
   if(!p.onFoot&&p.vehicle){
    const v=p.vehicle;const fx=Math.sin(v.heading),fz=Math.cos(v.heading);
    const sp=v.speed;const dist=6.2+0.75*4.6;
    const units=game.dispatch.units;let pursuer=null,bd=35;
    for(const u of units){const d=Math.hypot(u.vehicle.position.x-v.position.x,u.vehicle.position.z-v.position.z);
     const behind=(u.vehicle.position.x-v.position.x)*fx+(u.vehicle.position.z-v.position.z)*fz;
     if(behind<0&&d<bd){bd=d;pursuer=u}}
    if(pursuer){const px=pursuer.vehicle.position.x,pz=pursuer.vehicle.position.z;
     cam.position.lerp(new THREE.Vector3(px-fx*10,5.0,pz-fz*10),0.2);
     cam.lookAt(v.position.x+fx*12,1.6,v.position.z+fz*12);cam.fov=70}
    else{cam.position.lerp(new THREE.Vector3(v.position.x-fx*dist,2.6,v.position.z-fz*dist),0.25);
     cam.lookAt(v.position.x+fx*10,1.5,v.position.z+fz*10);cam.fov=62+Math.min(16,sp*0.3)}
    cam.updateProjectionMatrix();return}
   const fx=Math.sin(p.heading),fz=Math.cos(p.heading);
   const cx=p.position.x-fx*5.2,cz=p.position.z-fz*5.2;
   cam.position.lerp(new THREE.Vector3(cx,2.9,cz),0.3);
   cam.lookAt(p.position.x+fx*6,1.5,p.position.z+fz*6);
   cam.fov=62;cam.updateProjectionMatrix();
   if(shake>0){shakeT+=dt*30;shake*=Math.exp(-5*dt);
    cam.position.x+=Math.sin(shakeT*1.3)*shake*0.2;cam.position.y+=Math.sin(shakeT*1.7)*shake*0.15}},
  addShake(n){shake=Math.min(1.2,shake+n)}}}
