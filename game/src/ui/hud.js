import * as THREE from 'three';
import {fmtRp,fmtTime} from '../core/rng.js';
export function createHud(game){
 const root=document.getElementById('hud');
 function el(id,cls,html){const d=document.createElement('div');d.id=id;if(cls)d.className=cls;if(html!==undefined)d.innerHTML=html;root.appendChild(d);return d}
 const mission=el('mission','pnl'),status=el('status','pnl'),dispatch=el('dispatch','pnl hidden'),
  weapons=el('weapons','pnl'),crew=el('crew','pnl'),radio=el('radio','pnl hidden'),
  vehicle=el('vehicle','pnl'),mmW=el('minimapW',''),dialogue=el('dialogue','pnl hidden'),
  hint=el('hint','hidden'),notices=el('notices',''),banner=el('banner',''),
  race=el('race','pnl hidden'),district=el('district','pnl hidden');
 const mmC=document.createElement('canvas');mmC.id='minimap';mmC.width=210;mmC.height=210;mmW.appendChild(mmC);
 const objD=document.createElement('div');objD.id='objDist';mmW.appendChild(objD);
 const vit=document.createElement('div');vit.id='vitals';mmW.appendChild(vit);
 vit.innerHTML='<div class="sub">KESEHATAN</div><div class="bar h"><i id="hpb" style="width:100%"></i></div><div class="sub" style="margin-top:4px">PELINDUNG</div><div class="bar a"><i id="arb" style="width:0%"></i></div>';
 const tagLayer=document.createElement('div');tagLayer.id='tags';root.appendChild(tagLayer);
 let dlgTimer=0,noticeList=[];
 const clock0=17*3600+24*60;
 function clockStr(){const t=clock0+game.time*60;const h=Math.floor(t/3600)%24,m=Math.floor(t/60)%60;
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}
 function update(){
  root.classList.toggle('mode-title',game.mode==='title');
  root.classList.toggle('mode-pause',game.mode==='pause');
  const p=game.player;
  const m=game.missions.current;
  if(m){const s=game.missions.step;
   mission.innerHTML='<div class="ttl">MISI '+(game.missions.doneCount+1)+'/8 · '+m.title+'</div>'+
    (s?'<div class="obj">'+s.txt+'</div><div class="nxt">▶ '+(s.next||'')+'</div>':'')+
    (game.missions.timer>0?'<div class="obj gold">⏱ '+fmtTime(game.missions.timer)+'</div>':'')+
    (game.missions.stepLeft!==undefined&&game.missions.stepLeft!==null?'<div class="obj red">Target tersisa: '+game.missions.stepLeft+'</div>':'');
   mission.classList.remove('hidden')}
  else if(game.activities.race){const r=game.activities.race;
   mission.innerHTML='<div class="ttl">BALAP PANTAI</div><div class="obj">Gerbang '+r.gate+'/14 · Par '+r.par+' dtk</div>';
   mission.classList.remove('hidden')}
  else mission.classList.add('hidden');
  const d=game.plan.districtAt(p.position.x,p.position.z);
  const st=game.plan.streetAt(p.position.x,p.position.z);
  const rp=game.respect.rp,rank=game.respect.rank;
  status.innerHTML='<div id="money">'+fmtRp(p.money)+'</div>'+
   '<div id="stars">'+'★'.repeat(game.wanted.level)+'<span style="color:#666">'+'☆'.repeat(5-game.wanted.level)+'</span></div>'+
   '<div class="sub">'+clockStr()+' · '+d.name+'</div>'+
   '<div class="sub">'+(st?st.n:'')+'</div>'+
   '<div class="sub gold">'+game.respect.rankName+' · '+rp+' RP</div>'+
   '<div class="bar"><i style="width:'+Math.min(100,rp/50)+'%"></i></div>';
  const us=game.dispatch.units;
  if(us.length){dispatch.classList.remove('hidden');
   dispatch.innerHTML='<div class="ttl">UNIT MENANGGAPI · '+us.length+'</div>'+us.slice(0,5).map(u=>{
    const dist=Math.round(Math.hypot(u.vehicle.position.x-p.position.x,u.vehicle.position.z-p.position.z));
    return'<div class="row"><span>'+u.callsign+'</span><span class="chip">'+u.tactic+'</span><span>'+dist+' m</span></div>'}).join('')}
  else dispatch.classList.add('hidden');
  weapons.innerHTML='<div class="ttl">SENJATA</div>'+game.loadout.list().map(w=>
   '<div class="w'+(w.sel?' sel':'')+'"><span>'+(w.sel?'▶ ':'')+w.name+'</span><span class="a">'+(w.mag===Infinity?'∞':w.mag+' / '+w.ammo)+'</span></div>').join('');
  crew.innerHTML='<div class="ttl">KRU</div>'+game.crew.map(c=>
   '<div class="c"><b>['+c.key.replace('Key','')+'] '+c.name+'</b> · '+c.role+'<br><span class="sub">'+c.desc+'</span></div>').join('');
  const stn=game.radio.current;
  if(p.vehicle){vehicle.classList.remove('hidden');
   radio.classList.add('hidden');
   const kmh=Math.round(p.vehicle.speed*3.6);
   vehicle.innerHTML='<div class="sub">'+(game.fleet?game.fleetName(p.vehicle):'')+'</div>'+
    '<div id="speed">'+kmh+'<small> KM/H</small></div>'+
    '<div class="sub">KONDISI</div><div class="bar"><i style="width:'+Math.max(0,p.vehicle.health/p.vehicle.maxHp*100)+'%"></i></div>'+
    '<div class="sub" style="margin-top:4px">♪ '+stn.name+' — '+stn.song+'</div>'}
  else{vehicle.classList.add('hidden');
   radio.classList.remove('hidden');
   radio.style.bottom='12px';
   radio.innerHTML='<div class="sub">♪ '+stn.name+'</div><div>'+stn.song+'</div>'}
  const tgt=game.missions.target()||(game.activities.fare?{x:game.activities.fare.x,z:game.activities.fare.z}:null);
  if(tgt){const dd=Math.round(Math.hypot(tgt.x-p.position.x,tgt.z-p.position.z));
   objD.textContent='★ Objective · '+dd+' m'}
  else objD.textContent='';
  const hpb=document.getElementById('hpb'),arb=document.getElementById('arb');
  if(hpb)hpb.style.width=Math.max(0,p.health)+'%';
  if(arb)arb.style.width=Math.max(0,p.armour)+'%';
  const r=game.activities.race;
  if(r){race.classList.remove('hidden');
   race.innerHTML='<div class="t">BALAP PANTAI</div><div class="g">Gerbang '+r.gate+'/14 · rekor 82 dtk · '+r.t.toFixed(1)+' dtk</div>'}
  else race.classList.add('hidden');
  district.classList.remove('hidden');
  district.innerHTML='<div class="big">'+d.name+'</div><div class="sub">'+(st?st.n:'')+'</div>';
  district.style.bottom='118px';district.style.right='12px';district.style.textAlign='right';district.style.top='auto';district.style.left='auto';
  updateTags();
  if(game.minimap)game.minimap.draw();
 }
 function updateTags(){
  tagLayer.innerHTML='';
  const cam=game.camera;if(!cam)return;
  const v=new THREE.Vector3();
  for(const n of game.pedestrians.npcs){if(!n.talk)continue;
   const d=Math.hypot(n.position.x-game.player.position.x,n.position.z-game.player.position.z);
   if(d>25)continue;
   v.set(n.position.x,2.3,n.position.z).project(cam);
   if(v.z>1)continue;
   const x=(v.x*0.5+0.5)*window.innerWidth,y=(-v.y*0.5+0.5)*window.innerHeight;
   const t=document.createElement('div');t.id='nametag';t.style.left=x+'px';t.style.top=y+'px';t.textContent=n.name;
   tagLayer.appendChild(t)}
  const talk=game.pedestrians.nearestTalk(15);
  if(talk&&game.player.onFoot){dialogue.classList.remove('hidden');
   dialogue.innerHTML='<div class="por">'+talk.name[0]+'</div><div><div class="who">'+talk.name+'</div><div class="ln">'+talk.talkLine+'</div></div>'}
  else if(!game._dlgManual){dialogue.classList.add('hidden')}
 }
 return{update,mmCanvas:mmC,
  dialogue(name,text){game._dlgManual=true;dialogue.classList.remove('hidden');
   dialogue.innerHTML='<div class="por">'+name[0]+'</div><div><div class="who">'+name+'</div><div class="ln">'+text+'</div></div>'},
  hideDialogue(){game._dlgManual=false;dialogue.classList.add('hidden')},
  titleCard(t,s){banner.style.display='block';
   banner.innerHTML='<div class="t">'+t+'</div><div class="s">'+(s||'')+'</div>';
   clearTimeout(banner._t);banner._t=setTimeout(()=>banner.style.display='none',3200)},
  notice(text){const n=document.createElement('div');n.className='n';n.textContent=text;
   notices.appendChild(n);noticeList.push(n);
   while(noticeList.length>4){noticeList.shift().remove()}
   setTimeout(()=>{n.remove();noticeList=noticeList.filter(x=>x!==n)},4500)},
  hint(text){if(text){hint.classList.remove('hidden');hint.textContent=text}else hint.classList.add('hidden')}}}
