import * as THREE from 'three';
export function createEffects(game){
 const scene=game.scene;const parts=[];
 function sprite(color,size,opacity){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');
  const g=c.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.fillRect(0,0,64,64);
  const t=new THREE.CanvasTexture(cv);
  return new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,opacity:opacity===undefined?0.9:opacity,depthWrite:false}))}
 return{explosion(x,y,z){
   const grp=new THREE.Group();grp.position.set(x,y,z);
   const core=sprite('rgba(255,240,180,1)',1,1);core.scale.set(4.5,4.5,1);grp.add(core);
   const mid=sprite('rgba(255,120,30,0.9)',1,0.95);mid.scale.set(7,7,1);grp.add(mid);
   const outer=sprite('rgba(255,60,10,0.7)',1,0.8);outer.scale.set(10,10,1);grp.add(outer);
   for(let i=0;i<11;i++){const s=sprite(i%2?'rgba(255,200,80,0.95)':'rgba(120,120,120,0.8)',1,0.9);
    const a=i/11*Math.PI*2;s.position.set(Math.cos(a)*2.5,Math.sin(a)*1.5,Math.sin(a)*2.5);
    s.scale.set(3.5,3.5,1);grp.add(s)}
   scene.add(grp);
   const light=new THREE.PointLight(0xff8844,35,30);light.position.set(x,y+2,z);scene.add(light);
   parts.push({obj:grp,light,t:0,life:0.9,init:1});
   if(game.cameraRig)game.cameraRig.addShake(0.7)},
  tracer(a,b){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x,a.y,a.z),new THREE.Vector3(b.x,b.y,b.z)]);
   const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffe9a3,transparent:true,opacity:0.95}));
   scene.add(l);parts.push({obj:l,t:0,life:0.07,init:1})},
  flash(p){const s=sprite('rgba(255,230,150,1)',1,1);s.position.set(p.x,p.y+0.4,p.z);s.scale.set(2.2,2.2,1);
   scene.add(s);parts.push({obj:s,t:0,life:0.42,init:1})},
  smoke(x,y,z,kind,dt){if(Math.random()>0.3)return;
   const s=sprite(kind===2?'rgba(40,40,40,0.7)':'rgba(160,160,160,0.55)',1,0.6);
   s.position.set(x+(Math.random()-0.5),y+Math.random()*0.5,z+(Math.random()-0.5));s.scale.set(2.5,2.5,1);
   scene.add(s);parts.push({obj:s,t:0,life:1.2,init:0.6,rise:true})},
  update(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;
    const k=1-p.t/p.life;
    if(k<=0){scene.remove(p.obj);if(p.light)scene.remove(p.light);parts.splice(i,1);continue}
    if(p.obj.material)p.obj.material.opacity=p.init*k;
    if(p.rise)p.obj.position.y+=dt*2;
    if(p.light)p.light.intensity=60*k}}}}
