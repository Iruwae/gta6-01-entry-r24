import {fmtRp} from '../core/rng.js';
import {PLACES} from '../world/cityPlan.js';
export function createMenus(game){
 const root=document.getElementById('hud');
 const title=document.createElement('div');title.id='title';root.appendChild(title);
 const pause=document.createElement('div');pause.id='pause';pause.classList.add('hidden');root.appendChild(pause);
 function renderTitle(){
  const s=game.save.slots();
  title.innerHTML='<h1>TELUK SENJA</h1><div class="tag">Kota pesisir yang tak pernah tidur. Bawa pulang senja.</div>'+
   '<div class="menu">'+
   (s[0]?'<div class="mi" data-a="continue">LANJUTKAN<small>'+s[0].summary+'</small></div>':'')+
   '<div class="mi" data-a="new">PERMAINAN BARU</div>'+
   '<div class="mi" data-a="slots">SLOT SIMPANAN<small>SLOT 1 · SLOT 2 · SLOT 3</small></div>'+
   '</div><div class="ctl">WASD jalan / mengemudi · E masuk-keluar mobil · Spasi rem tangan · F bidik · Klik kiri tembak · M misi · R balap · T taksi · Esc jeda</div>';
  title.querySelectorAll('.mi').forEach(m=>m.onclick=()=>{
   const a=m.dataset.a;
   if(a==='new'){game.newGame()}
   else if(a==='continue'){game.save.load(0);game.menus.hideTitle();game.mode='play';game.introShown=true}
   else{game.ui.notice('Slot simpanan: 3 slot tersedia')}})}
 function renderPause(){
  const p=game.player;const st=p.stats;
  pause.innerHTML='<div class="l"><h2>PETA TELUK SENJA</h2><canvas id="mapcv"></canvas>'+
   '<div class="sub" style="margin-top:8px">PANTAI MERPATI · PASAR SENJA · KOTA LAMA · MENARA KACA · KAMPUNG MANGGA · PELABUHAN · BUKIT HIJAU · PULAU KARANG</div></div>'+
   '<div class="r"><h2>STATISTIK</h2>'+
   '<div class="stat"><span>Uang</span><b>'+fmtRp(p.money)+'</b></div>'+
   '<div class="stat"><span>Pangkat</span><b>'+game.respect.rankName+' · '+game.respect.rp+' RP</b></div>'+
   '<div class="stat"><span>Misi selesai</span><b>'+game.missions.doneCount+' / 8</b></div>'+
   '<div class="stat"><span>Mobil dicuri</span><b>'+st.carsStolen+'</b></div>'+
   '<div class="stat"><span>Musuh kalah</span><b>'+st.kills+'</b></div>'+
   '<div class="stat"><span>Polisi lolos</span><b>'+st.copsEvaded+'</b></div>'+
   '<div class="stat"><span>Total hasil</span><b>'+fmtRp(st.earned)+'</b></div>'+
   '<div class="stat"><span>Koin Senja</span><b>'+game.activities.coinsCollected+' / 20</b></div>'+
   '<div class="stat"><span>Jarak tempuh</span><b>'+Math.round(st.driven)+' m</b></div>'+
   '<div class="stat"><span>Penumpang</span><b>'+st.fares+'</b></div>'+
   '<h2 style="font-size:16px;margin-top:14px">BERDIRI DI DISTRIK</h2>'+
   Object.keys(game.standing).map(d=>'<div class="stat"><span>'+d+'</span><b>'+game.standing[d]+'</b></div>').join('')+
   '<div class="btn" data-a="resume">LANJUTKAN</div>'+
   '<div class="btn" data-a="save">SIMPAN</div>'+
   '<div class="btn" data-a="garage">BENGKEL &amp; TOKO</div>'+
   '<div class="btn" data-a="quit">KELUAR KE JUDUL</div>'+
   '<div class="sub" style="margin-top:10px">ESC untuk lanjut</div></div>';
  const cv=pause.querySelector('#mapcv');drawMap(cv);
  pause.querySelectorAll('.btn').forEach(b=>b.onclick=()=>{
   const a=b.dataset.a;
   if(a==='resume')game.menus.hidePause();
   else if(a==='save'){game.save.save();game.ui.notice('Permainan disimpan')}
   else if(a==='garage')game.ui.notice('Bengkel Sari: cat ulang Rp 350.000 · lapis baja Rp 400.000')
   else if(a==='quit'){game.mode='title';game.menus.hidePause();renderTitle();title.classList.remove('hidden')}})}
 function drawMap(cv){if(!cv)return;const x=cv.getContext('2d');cv.width=cv.clientWidth||600;cv.height=420;
  x.fillStyle='#0e1622';x.fillRect(0,0,cv.width,cv.height);
  const sx=v=>(v+450)/1230*cv.width,sz=v=>(v+40)/440*cv.height;
  x.fillStyle='#2fa8a0';x.fillRect(0,0,cv.width,sz(50));
  x.fillStyle='#e8d29a';x.fillRect(0,sz(50),cv.width,sz(90)-sz(50));
  x.strokeStyle='#3a3a44';x.lineWidth=5;
  for(let gx=-360;gx<=360;gx+=90){x.beginPath();x.moveTo(sx(gx),sz(82));x.lineTo(sx(gx),sz(368));x.stroke()}
  for(let gz=90;gz<=360;gz+=90){x.beginPath();x.moveTo(sx(-450),sz(gz));x.lineTo(sx(780),sz(gz));x.stroke()}
  for(const d of game.plan.blocks){x.fillStyle='#2a3040';x.fillRect(sx(d.x0),sz(d.z0),(d.x1-d.x0)/1230*cv.width,(d.z1-d.z0)/440*cv.height)}
  x.fillStyle='#ffd76a';x.font='11px Arial';
  for(const pl of PLACES){x.fillRect(sx(pl.x)-3,sz(pl.z)-3,6,6)}
  const pp=game.player.position;x.fillStyle='#ff5d5d';x.beginPath();x.arc(sx(pp.x),sz(pp.z),6,0,7);x.fill();
  x.fillStyle='#4be38a';x.font='bold 12px Arial';x.fillText('KAMU DI SINI',sx(pp.x)+10,sz(pp.z)+4)}
 return{renderTitle,renderPause,
  hideTitle(){title.classList.add('hidden')},
  showTitle(){renderTitle();title.classList.remove('hidden')},
  showPause(){renderPause();pause.classList.remove('hidden')},
  hidePause(){pause.classList.add('hidden')}}}
