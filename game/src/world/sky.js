import * as THREE from 'three';
export function createSky(game){
 const scene=game.scene;
 const geo=new THREE.SphereGeometry(4200,24,14);
 const top=new THREE.Color(0x2c2a6e),hor=new THREE.Color(0xff9e5e),bot=new THREE.Color(0x3a2a4a);
 const col=new Float32Array(geo.attributes.position.count*3);
 const pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const y=pos.getY(i)/4200;const t=Math.max(0,Math.min(1,(y+0.08)/0.55));
  const c=y<0?bot.clone().lerp(hor,Math.max(0,1+y*4)):hor.clone().lerp(top,t);
  col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 const dome=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));
 dome.renderOrder=-10;scene.add(dome);
 const sunSpr=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');
  const g=c.createRadialGradient(128,128,4,128,128,128);g.addColorStop(0,'rgba(255,236,180,1)');g.addColorStop(0.25,'rgba(255,180,90,0.75)');g.addColorStop(1,'rgba(255,140,60,0)');
  c.fillStyle=g;c.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(cv);return new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}))})();
 sunSpr.scale.set(900,900,1);sunSpr.position.set(2600,320,-1400);scene.add(sunSpr);
 const clouds=[];
 const cm=(()=>{const cv=document.createElement('canvas');cv.width=256;cv.height=96;const c=cv.getContext('2d');
  for(let i=0;i<26;i++){const x=20+Math.random()*216,y=28+Math.random()*40,r=14+Math.random()*26;
   const g=c.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'rgba(255,214,190,0.55)');g.addColorStop(1,'rgba(255,214,190,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
  return new THREE.CanvasTexture(cv)})();
 for(let i=0;i<26;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:cm,transparent:true,opacity:0.55,depthWrite:false,fog:false}));
  const a=game.rng.range(0,Math.PI*2),r=game.rng.range(900,2600);
  s.position.set(Math.cos(a)*r,game.rng.range(330,760),Math.sin(a)*r);
  s.scale.set(game.rng.range(420,900),game.rng.range(90,190),1);s.userData.v=game.rng.range(1,3);clouds.push(s);scene.add(s)}
 const sun=new THREE.DirectionalLight(0xffb36b,1.9);
 sun.position.set(180,140,-220);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-95;sun.shadow.camera.right=95;
 sun.shadow.camera.top=95;sun.shadow.camera.bottom=-95;sun.shadow.camera.near=10;sun.shadow.camera.far=700;
 sun.shadow.bias=-0.0004;scene.add(sun);scene.add(sun.target);
 const hemi=new THREE.HemisphereLight(0x8a7bd8,0x4a2f28,0.7);scene.add(hemi);
 scene.fog=new THREE.Fog(0xe89a6a,260,2400);
 const loader=new THREE.TextureLoader();
 loader.load('tex4-sky.jpg',t=>{t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5200,1500),new THREE.MeshBasicMaterial({map:t,fog:false,depthWrite:false}));
  m.position.set(2400,420,-60);m.rotation.y=-Math.PI/2;m.renderOrder=-9;scene.add(m);
  const m2=m.clone();m2.position.set(-2400,420,60);m2.rotation.y=Math.PI/2;scene.add(m2);
 },undefined,()=>{});
 return{sun,hemi,dome,
  update(dt,focus){sun.position.set(focus.x+180,140,focus.z-220);sun.target.position.set(focus.x,0,focus.z);sun.target.updateMatrixWorld();
   dome.position.set(focus.x,0,focus.z);sunSpr.position.set(focus.x+2600,320,focus.z-1400);
   for(const c of clouds){c.position.x+=c.userData.v*dt;if(c.position.x>2800)c.position.x=-2800}}}}
