import * as THREE from 'three';
import {makeRng,clamp} from '../core/rng.js';
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')]}
function grainTex(base,spk,n){const[c,x]=cv(256,256);x.fillStyle=base;x.fillRect(0,0,256,256);
 for(let i=0;i<n;i++){x.fillStyle=spk[i%spk.length];x.globalAlpha=0.12+Math.random()*0.2;x.fillRect(Math.random()*256,Math.random()*256,2,2)}
 x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function facadeTex(rng,variant){const[c,x]=cv(512,640);
 const pals=[['#3a5a7a','#27435e'],['#2e2a33','#211e26'],['#a86a4a','#8a5238'],['#e8dcc0','#d8c8a8'],['#c9b18a','#b39a72'],['#8a8f96','#6e747b'],['#b0704a','#96583a'],['#7a6a5a','#5e5148']];
 const[base,dark]=pals[variant%8];x.fillStyle=base;x.fillRect(0,0,512,640);
 for(let f=0;f<8;f++)for(let b=0;b<4;b++){const wx=14+b*124,wy=14+f*76,ww=100,wh=56;
  const r=rng.next();x.fillStyle=r<0.42?'#ffd98a':r<0.58?'#a8d8e8':r<0.7?'#5a6a7a':'#20242c';
  x.fillRect(wx,wy,ww,wh);x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(wx,wy+wh-6,ww,6);
  x.strokeStyle='rgba(0,0,0,0.35)';x.strokeRect(wx,wy,ww,wh);
  if(rng.next()<0.5){x.fillStyle='rgba(255,255,255,0.12)';x.fillRect(wx,wy,ww,8)}}
 x.fillStyle=dark;x.fillRect(0,0,512,10);x.fillRect(0,630,512,10);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t}
function frondTex(){const[c,x]=cv(256,256);x.clearRect(0,0,256,256);x.strokeStyle='#4a9a3a';x.lineWidth=6;
 x.beginPath();x.moveTo(128,250);x.quadraticCurveTo(132,130,128,8);x.stroke();
 for(let i=0;i<26;i++){const t=i/26,y=246-t*228,len=90*(1-t*0.55);
  x.strokeStyle=i%2?'#6ab85a':'#4a9a3a';x.lineWidth=4;
  x.beginPath();x.moveTo(128,y);x.lineTo(128-len,y+26);x.stroke();
  x.beginPath();x.moveTo(128,y);x.lineTo(128+len,y+26);x.stroke()}
 const t=new THREE.CanvasTexture(c);return t}
function signTex(txt,bg,fg){const[c,x]=cv(512,96);x.fillStyle=bg;x.fillRect(0,0,512,96);
 x.fillStyle=fg;x.font='bold 52px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,50);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
export function createCityBuilder(game){
 const scene=game.scene,plan=game.plan,coll=game.collision,rng=makeRng(game.seed^0x51ab);
 const atlases=[];for(let i=0;i<8;i++)atlases.push(facadeTex(makeRng(game.seed+i*77),i));
 const frond=frondTex();
 const loader=new THREE.TextureLoader();
 const photoMats=[];
 const shopWinMat=new THREE.MeshLambertMaterial({color:0x3a2a1a});
 const photoNames={brick:'tex3-brick.png',glass:'tex3-glass.png',concrete:'tex3-concrete.png',barber:'tex3-barber.png'};
 for(const k in photoNames)loader.load(photoNames[k],t=>{t.colorSpace=THREE.SRGBColorSpace;
  for(const e of photoMats)if(e.key===k){e.mat.map=t;e.mat.emissiveMap=t;e.mat.emissive=new THREE.Color(0xffffff);e.mat.emissiveIntensity=0.08;e.mat.needsUpdate=true}},undefined,()=>{});
 loader.load('tex4-shop.jpg',t=>{t.colorSpace=THREE.SRGBColorSpace;
  shopWinMat.map=t;shopWinMat.emissiveMap=t;shopWinMat.emissive=new THREE.Color(0xffffff);shopWinMat.emissiveIntensity=0.3;shopWinMat.needsUpdate=true},undefined,()=>{});
 const gates=[];const heroSpots=[];let wheel=null,seaMat=null;
 const M={asphalt:new THREE.MeshLambertMaterial({map:grainTex('#1e1e24',['#33333a','#1e1e24'],5200)}),
  pave:new THREE.MeshLambertMaterial({map:grainTex('#8a7f74',['#96897c','#7a6f64'],2600)}),
  sand:new THREE.MeshLambertMaterial({map:grainTex('#e8d29a',['#d8c28a','#f2e2b2'],4200)}),
  prom:new THREE.MeshLambertMaterial({map:grainTex('#b09a86',['#a08a76','#c0aa96'],3600)}),
  sea:new THREE.MeshLambertMaterial({color:0x2fa8a0,transparent:true,opacity:0.94}),
  grass:new THREE.MeshLambertMaterial({color:0x5a8a4a}),
  trunk:new THREE.MeshLambertMaterial({color:0x7a5a3a}),
  leaf:new THREE.MeshLambertMaterial({map:frond,alphaTest:0.35,side:THREE.DoubleSide}),
  leaf2:new THREE.MeshLambertMaterial({color:0x3f8a4a}),
  leaf3:new THREE.MeshLambertMaterial({color:0x5aa85a}),
  lamp:new THREE.MeshLambertMaterial({color:0x33333a}),
  glow:new THREE.MeshBasicMaterial({color:0xffc86a}),
  white:new THREE.MeshLambertMaterial({color:0xe8e4da}),
  dark:new THREE.MeshLambertMaterial({color:0x22222a}),
  wood:new THREE.MeshLambertMaterial({color:0x8a6a44}),
  teal:new THREE.MeshBasicMaterial({color:0x2ee6c8,transparent:true,opacity:0.4}),
  tealHot:new THREE.MeshBasicMaterial({color:0x4ffce0,transparent:true,opacity:0.75})};
 function box(w,h,d,mat,x,y,z,ry){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);if(ry)m.rotation.y=ry;m.receiveShadow=true;scene.add(m);return m}
 function ground(w,d,mat,x,y,z,rx){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);m.rotation.x=rx===undefined?-Math.PI/2:rx;m.position.set(x,y,z);m.receiveShadow=true;scene.add(m);return m}
 function buildGround(){
  ground(900,300,M.asphalt,165,0,225);ground(340,300,M.asphalt,640,0,0);
  ground(900,286,M.pave,165,0.02,225);
  ground(900,32,M.prom,0,0.03,66);
  ground(900,70,M.sand,0,0.02,15);ground(240,240,M.sand,640,0.02,0);
  seaMat=new THREE.Mesh(new THREE.PlaneGeometry(3600,2400),M.sea);seaMat.rotation.x=-Math.PI/2;seaMat.position.set(0,-0.7,-1250);scene.add(seaMat);
  const foam=new THREE.Mesh(new THREE.PlaneGeometry(1800,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5}));foam.rotation.x=-Math.PI/2;foam.position.set(0,-0.6,-22);scene.add(foam);
  ground(900,286,M.grass,-1200,0,225).rotation.y=0;
  const hillM=new THREE.MeshLambertMaterial({color:0x5a7a5a});
  for(let i=0;i<25;i++){const h=new THREE.Mesh(new THREE.ConeGeometry(rng.range(60,150),rng.range(50,150),7),hillM);
   const a=rng.range(0,Math.PI*2),r=rng.range(600,1100);h.position.set(Math.cos(a)*r,0,360+Math.sin(a)*r*0.4+200);scene.add(h)}
  for(let i=0;i<4;i++){const h=new THREE.Mesh(new THREE.ConeGeometry(rng.range(80,160),rng.range(40,90),7),new THREE.MeshLambertMaterial({color:0x4a6a5a}));
   h.position.set(-600+i*380,-4,-420-rng.range(0,200));scene.add(h)}
 }
 function buildRoads(){
  const dashM=new THREE.MeshBasicMaterial({color:0xf2e8c8});
  const dashG=new THREE.BoxGeometry(4,0.06,0.5);
  for(let x=-360;x<=360;x+=90)for(let z=100;z<360;z+=16){const d=new THREE.Mesh(dashG,dashM);d.position.set(x,0.06,z);scene.add(d)}
  for(let z=90;z<=360;z+=90)for(let x=-440;x<450;x+=16){const d=new THREE.Mesh(dashG,dashM);d.position.set(x,0.06,z);d.rotation.y=Math.PI/2;scene.add(d)}
  const cwM=new THREE.MeshBasicMaterial({color:0xffffff});
  for(const j of plan.junctions){for(let s=-1;s<=1;s+=2){for(let k=-3;k<=3;k++){
   const w=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.06,5),cwM);w.position.set(j.x+k*2.2,0.06,j.z+s*9);scene.add(w);
   const w2=new THREE.Mesh(new THREE.BoxGeometry(5,0.06,1.4),cwM);w2.position.set(j.x+s*9,0.06,j.z+k*2.2);scene.add(w2)}}}
 }
 function facadeMat(variant,w,h,photo){if(photo){const m=new THREE.MeshLambertMaterial({color:0x8a7a6a});photoMats.push({mat:m,key:photo});return m}
  const t=atlases[variant%8].clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(w/25.6)),Math.max(1,Math.round(h/25.6)));
  return new THREE.MeshLambertMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:0.08})}
 function buildBuildings(){
  const roofM=new THREE.MeshLambertMaterial({color:0x3a3a42});
  const shopSigns=['WARUNG SARI','KOPI SENJA','TOKO KELONTONG','MIE AYAM','BENGKEL SARI','JUS MANGGA','TAMBAL BAN','LAUNDRY','SATE PADANG','ES TEH'];
  let heroN=0;
  for(const b of plan.blocks){
   const brng=makeRng(b.seed);const n=brng.int(1,3);
   const bw=(b.x1-b.x0)/n;
   for(let i=0;i<n;i++){
    const x0=b.x0+i*bw+2,x1=b.x0+(i+1)*bw-2,z0=b.z0+2,z1=b.z1-2;
    const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
    const dist=b.district;
    let floors=dist==='MENARA KACA'?brng.int(10,26):dist==='PANTAI MERPATI'?brng.int(2,5):dist==='PELABUHAN'?brng.int(1,3):brng.int(3,9);
    const h=floors*3.2+brng.range(0,2);
    const nearS1=Math.abs(cz-135)<60&&cx>-340&&cx<-160;
    const nearTalk=Math.abs(cx+170)<50&&Math.abs(cz-80)<50;
    const hero=(nearS1||nearTalk)&&heroN<16;
    let photo=null;if(hero){heroN++;photo=h<12?'brick':h<30?'concrete':'glass';heroSpots.push({x:cx,z:cz,h})}
    const variant=brng.int(0,7);
    const side=facadeMat(variant,w,h,photo);
    const mats=[side,side,roofM,roofM,side,side];
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);
    m.position.set(cx,h/2+0.15,cz);m.castShadow=true;m.receiveShadow=true;scene.add(m);
    coll.add(x0,z0,x1,z1,h+0.15);
    box(w+1,0.8,d+1,roofM,cx,h+0.5,cz);
    if(brng.next()<0.3){const wt=box(3,3,3,roofM,cx-w*0.2,h+2,cz-d*0.2);wt.castShadow=true}
    if(brng.next()<0.4){const fin=box(1.2,h*0.12,1.2,M.glow,cx+w*0.3,h+h*0.06,cz);fin.castShadow=false}
    if(cz<200){const sw=w*0.7,sh=4.2;
     const shop=box(sw,sh,1.2,new THREE.MeshLambertMaterial({color:0x2a2a30}),cx,2.1,Math.min(z0,z1)-0.4);
     coll.add(cx-sw/2,Math.min(z0,z1)-1,cx+sw/2,Math.min(z0,z1)+0.2,sh);
     {const wp=new THREE.Mesh(new THREE.PlaneGeometry(sw-2,sh-1),shopWinMat);
      wp.position.set(cx,2.1,Math.min(z0,z1)-1.05);wp.rotation.y=Math.PI;scene.add(wp)}
     const sg=new THREE.Mesh(new THREE.PlaneGeometry(sw,1.6),new THREE.MeshBasicMaterial({map:signTex(shopSigns[brng.int(0,9)],'#1a1a22','#ffd76a')}));
     sg.position.set(cx,sh+0.9,Math.min(z0,z1)-1.05);sg.rotation.y=Math.PI;scene.add(sg)}
   }}
  const tower=box(40,150,40,facadeMat(1,40,150,'glass'),220,75,140);coll.add(200,120,240,160,150);
  const tw2=box(34,96,34,facadeMat(0,34,96,'concrete'),300,48,220);coll.add(283,203,317,237,96);
 }
 function palm(x,z,s){s=s||1;const g=new THREE.Group();
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.22*s,0.34*s,8*s,6),M.trunk);tr.position.y=4*s;tr.rotation.z=0.06;tr.castShadow=true;g.add(tr);
  for(let i=0;i<9;i++){const f=new THREE.Mesh(new THREE.PlaneGeometry(4.4*s,4.4*s),M.leaf);
   const a=i/9*Math.PI*2;f.position.set(Math.cos(a)*1.3*s,8.2*s,Math.sin(a)*1.3*s);
   f.rotation.set(Math.sin(a)*0.9-0.5,a,Math.cos(a)*0.9);f.castShadow=true;g.add(f)}
  const c=new THREE.Mesh(new THREE.ConeGeometry(0.7*s,1.4*s,6),M.leaf2);c.position.y=8.4*s;g.add(c);
  g.position.set(x,0,z);scene.add(g);coll.add(x-0.4,z-0.4,x+0.4,z+0.4,8*s,true);return g}
 function tree(x,z){const g=new THREE.Group();
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.24,2.6,6),M.trunk);tr.position.y=1.3;g.add(tr);
  const cols=[M.leaf2,M.leaf3,M.leaf2];
  for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(1.5-i*0.25,8,6),cols[i]);c.position.set((i-1)*0.9,3.1+i*0.5,(i%2?0.5:-0.4));c.castShadow=true;g.add(c)}
  g.position.set(x,0,z);scene.add(g);coll.add(x-0.3,z-0.3,x+0.3,z+0.3,4,true);return g}
 function lamp(x,z){const g=new THREE.Group();
  const p=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.12,7.4,6),M.lamp);p.position.y=3.7;g.add(p);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.12,0.12),M.lamp);arm.position.set(0.8,7.3,0);g.add(arm);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.32,8,6),M.glow);head.position.set(1.5,7.2,0);g.add(head);
  g.position.set(x,0,z);scene.add(g);coll.add(x-0.15,z-0.15,x+0.15,z+0.15,7.4,true);return g}
 function buildProps(){
  for(let x=-440;x<=440;x+=22){palm(x+(x%44?4:-4),80,rng.range(0.9,1.25))}
  for(let x=-440;x<=440;x+=44){palm(x+11,102,rng.range(0.85,1.1))}
  for(const b of plan.blocks){const brng=makeRng(b.seed+5);
   for(let i=0;i<6;i++){const x=b.x0+4+brng.next()*(b.x1-b.x0-8),z=b.z0+4+brng.next()*(b.z1-b.z0-8);
    if(brng.next()<0.5)tree(x,z);else lamp(x,z)}
   if(b.district==='PANTAI MERPATI')for(let i=0;i<4;i++)palm(b.x0+8+brng.next()*(b.x1-b.x0-16),b.z0+8,rng.range(0.9,1.2))}
  for(let x=-440;x<=440;x+=60){const u=new THREE.Group();
   const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,3,6),M.wood);pole.position.y=1.5;u.add(pole);
   const top=new THREE.Mesh(new THREE.ConeGeometry(2.2,1.2,8),new THREE.MeshLambertMaterial({color:[0xff6a3d,0xffd23d,0x3d8aff][Math.floor(rng.next()*3)]}));top.position.y=3.4;u.add(top);
   u.position.set(x,0.02,30+rng.range(-6,6));scene.add(u)}
  for(let i=0;i<4;i++){const boat=box(7,1.6,2.6,M.white,-300+i*90,0.4,8);boat.rotation.y=rng.range(-0.3,0.3)}
 }
 function buildGates(){
  for(let i=0;i<14;i++){const x=-420+i*60;const g=new THREE.Group();
   const post=new THREE.BoxGeometry(0.8,14,0.8);
   const p1=new THREE.Mesh(post,M.teal);p1.position.set(0,7,-7);g.add(p1);
   const p2=new THREE.Mesh(post,M.teal);p2.position.set(0,7,7);g.add(p2);
   const beam=new THREE.Mesh(new THREE.BoxGeometry(0.8,1,14),M.tealHot);beam.position.set(0,13.5,0);g.add(beam);
   const sheet=new THREE.Mesh(new THREE.PlaneGeometry(14,13),new THREE.MeshBasicMaterial({color:0x2ee6c8,transparent:true,opacity:0.12,side:THREE.DoubleSide,depthWrite:false}));
   sheet.position.set(0,6.5,0);sheet.rotation.y=Math.PI/2;g.add(sheet);
   g.position.set(x,0,90);scene.add(g);gates.push({group:g,mat:sheet.material,x})}
 }
 function buildTalkShop(){
  const g=new THREE.Group();
  const wall=new THREE.Mesh(new THREE.BoxGeometry(18,7,10),new THREE.MeshLambertMaterial({color:0x3a3a44}));wall.position.y=3.5;g.add(wall);
  coll.add(-167,55,-149,65,7);
  {const win=new THREE.Mesh(new THREE.PlaneGeometry(16,5),shopWinMat);
   win.position.set(-9.05,3.2,0);win.rotation.y=-Math.PI/2;g.add(win)}
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(10,1.8),new THREE.MeshBasicMaterial({map:signTex('TOKO SARI','#241a10','#ffd76a')}));
  sg.position.set(-9.05,6.2,0);sg.rotation.y=-Math.PI/2;g.add(sg);
  const awn=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.2,18),new THREE.MeshLambertMaterial({color:0x2a7a5a}));awn.position.set(-9.6,5.4,0);g.add(awn);
  g.position.set(-149,0,60);scene.add(g);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,16),new THREE.MeshLambertMaterial({map:grainTex('#9a8a7a',['#8a7a6a','#aa9a8a'],1200)}));
  floor.rotation.x=-Math.PI/2;floor.position.set(-168,0.04,60);scene.add(floor);
 }
 function buildPier(){
  const deck=new THREE.Mesh(new THREE.BoxGeometry(10,0.6,150),M.wood);deck.position.set(200,0.2,15);scene.add(deck);
  for(let z=80;z>-50;z-=15){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,3,6),M.dark);p.position.set(194,-0.8,z);scene.add(p);
   const p2=p.clone();p2.position.x=206;scene.add(p2)}
  for(let i=0;i<3;i++){const k=box(4,3,4,new THREE.MeshLambertMaterial({color:[0xff6a3d,0x3d8aff,0xffd23d][i]}),200,2,70-i*30);k.rotation.y=0.2}
  wheel=new THREE.Group();
  const rim=new THREE.Mesh(new THREE.TorusGeometry(21,0.7,8,32),M.white);wheel.add(rim);
  for(let i=0;i<8;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(0.5,42,0.5),M.white);sp.rotation.z=i*Math.PI/8;wheel.add(sp)}
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const car=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.4,2.4),new THREE.MeshLambertMaterial({color:[0xff6a3d,0xffd23d,0x3d8aff,0x4be38a][i%4]}));car.position.set(Math.cos(a)*21,Math.sin(a)*21,0);wheel.add(car)}
  wheel.position.set(200,26,-58);scene.add(wheel);
  const sup1=new THREE.Mesh(new THREE.BoxGeometry(1.5,26,1.5),M.white);sup1.position.set(196,13,-58);sup1.rotation.z=0.3;scene.add(sup1);
  const sup2=sup1.clone();sup2.position.x=204;sup2.rotation.z=-0.3;scene.add(sup2);
 }
 function buildBridge(){
  const deck=new THREE.Mesh(new THREE.BoxGeometry(320,1,16),new THREE.MeshLambertMaterial({color:0x8a8f96}));deck.position.set(600,4,0);scene.add(deck);
  for(let x=480;x<=720;x+=40){const p=new THREE.Mesh(new THREE.BoxGeometry(3,8,3),M.dark);p.position.set(x,0,0);scene.add(p)}
  for(const tx of[540,680]){const t=new THREE.Mesh(new THREE.BoxGeometry(4,46,4),new THREE.MeshLambertMaterial({color:0xe07a8a}));t.position.set(tx,27,0);scene.add(t);
   const b=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xff3d3d}));b.position.set(tx,51,0);scene.add(b)}
  for(let i=0;i<4;i++){const b=plan.blocks.find(b=>b.cx>520&&b.cx<760);
   const x=540+((i%2)*140),z=-60+Math.floor(i/2)*120;
   const v=box(20,7,16,new THREE.MeshLambertMaterial({color:0xf2ead8}),x,3.5,z);coll.add(x-10,z-8,x+10,z+8,7)}
  const lh=new THREE.Mesh(new THREE.CylinderGeometry(2,3,37,10),new THREE.MeshLambertMaterial({color:0xe84a3d}));lh.position.set(640,18.5,-80);scene.add(lh);
  const lb=new THREE.Mesh(new THREE.SphereGeometry(2.4,8,6),M.glow);lb.position.set(640,38,-80);scene.add(lb);
 }
 buildGround();buildRoads();buildBuildings();buildProps();buildGates();buildTalkShop();buildPier();buildBridge();
 return{gates,heroSpots,
  update(dt,t){if(wheel)wheel.rotation.z+=dt*0.12;
   if(seaMat)seaMat.position.x=Math.sin(t*0.05)*4;
   for(let i=0;i<gates.length;i++){const g=gates[i];g.mat.opacity=0.1+0.06*Math.sin(t*2+i)}}}}
