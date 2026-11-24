export function createMinimap(game){
 let base=null;
 function drawBase(){const c=document.createElement('canvas');c.width=420;c.height=420;const x=c.getContext('2d');
  x.fillStyle='#0e1622';x.fillRect(0,0,420,420);
  const sx=v=>(v+450)/1230*420,sz=v=>(v+40)/440*420;
  x.fillStyle='#2fa8a0';x.fillRect(0,0,420,sz(50));
  x.fillStyle='#e8d29a';x.fillRect(0,sz(50),420,sz(90)-sz(50));
  x.strokeStyle='#4a5568';x.lineWidth=7;
  for(let gx=-360;gx<=360;gx+=90){x.beginPath();x.moveTo(sx(gx),sz(82));x.lineTo(sx(gx),sz(368));x.stroke()}
  for(let gz=90;gz<=360;gz+=90){x.beginPath();x.moveTo(sx(-450),sz(gz));x.lineTo(sx(780),sz(gz));x.stroke()}
  for(const d of game.plan.blocks){x.fillStyle=d.district==='PANTAI MERPATI'?'#3a3f4a':'#2a3040';
   x.fillRect(sx(d.x0),sz(d.z0),(d.x1-d.x0)/1230*420,(d.z1-d.z0)/440*420)}
  base=c}
 return{draw(){const cv=game.ui?game.ui.mmCanvas:document.getElementById('minimap');if(!cv)return;
   if(!base)drawBase();const x=cv.getContext('2d');const W=cv.width,H=cv.height;
   const p=game.player.position;const scale=0.62*(game.player.onFoot?1.15:1);
   const range=420*scale;
   x.save();x.beginPath();x.arc(W/2,H/2,W/2,0,7);x.clip();
   x.clearRect(0,0,W,H);
   const ox=W/2-(p.x+450)/1230*420*scale,oy=H/2-(p.z+40)/440*420*scale;
   x.drawImage(base,ox,oy,420*scale,420*scale);
   const tgt=game.missions.target()||(game.activities.fare?{x:game.activities.fare.x,z:game.activities.fare.z}:null);
   if(tgt){const tx=W/2+(tgt.x-p.x)/1230*420*scale,ty=H/2+(tgt.z-p.z)/440*420*scale;
    x.strokeStyle='#ffd76a';x.lineWidth=2;x.beginPath();x.moveTo(W/2,H/2);x.lineTo(tx,ty);x.stroke();
    x.fillStyle='#ffd76a';x.beginPath();x.arc(tx,ty,6,0,7);x.fill()}
   for(const u of game.dispatch.units){const ux=W/2+(u.vehicle.position.x-p.x)/1230*420*scale,uy=H/2+(u.vehicle.position.z-p.z)/440*420*scale;
    x.fillStyle='#3d8aff';x.beginPath();x.arc(ux,uy,4,0,7);x.fill()}
   x.fillStyle='#ff5d5d';x.beginPath();x.arc(W/2,H/2,5,0,7);x.fill();
   x.fillStyle='#fff';x.font='bold 11px Arial';x.fillText('U',W/2+8,H/2-8);
   x.restore()}}}
