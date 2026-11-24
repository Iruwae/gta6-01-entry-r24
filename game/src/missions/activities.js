import {fmtRp} from '../core/rng.js';
export function createActivities(game){
 let coinsCollected=0,race=null,fare=null;
 const coinSpots=[];for(let i=0;i<20;i++){const a=game.rng.range(0,Math.PI*2),r=game.rng.range(60,380);
  coinSpots.push({x:Math.cos(a)*r,z:90+Math.abs(Math.sin(a))*260,taken:false})}
 return{get coinsCollected(){return coinsCollected},set coinsCollected(v){coinsCollected=v},
  get race(){return race},get fare(){return fare},
  tryRace(){if(race)return;
   if(!game.player.vehicle){game.ui.notice('Butuh mobil untuk balapan');return}
   race={gate:0,gates:14,t:0,par:82};game.ui.notice('BALAP PANTAI dimulai! Lewati 14 gerbang!');
   game.bus.emit('race-start',{})},
  tryFare(){if(fare||!game.player.vehicle)return;
   const p=game.player.position;const a=game.rng.range(0,Math.PI*2),d=180+game.rng.range(0,300);
   fare={x:p.x+Math.cos(a)*d,z:p.z+Math.sin(a)*d,t:16+d/8.5,pay:40000};game.ui.notice('Penumpang baru! Antar ke tujuan.')},
  update(dt){const p=game.player.position;
   for(const c of coinSpots){if(!c.taken&&Math.hypot(p.x-c.x,p.z-c.z)<3){c.taken=true;coinsCollected++;
     game.player.money+=250000;game.respect.add(10);game.ui.notice('Koin Senja! +Rp 250.000 (total '+coinsCollected+'/20)')}}
   if(race){race.t+=dt;
    const gx=-420+race.gate*60;
    if(game.player.vehicle&&Math.abs(p.x-gx)<8&&Math.abs(p.z-90)<10){race.gate++;
     game.ui.notice('Gerbang '+race.gate+'/14!');
     if(race.gate>=14){const pay=race.t<=82?900000:race.t<=102?400000:120000;
      game.player.money+=pay;game.respect.add(45);game.player.stats.earned+=pay;
      game.ui.titleCard('BALAPAN SELESAI','Waktu '+race.t.toFixed(1)+' dtk · +'+fmtRp(pay));race=null}}
    if(race&&race.t>200){game.ui.notice('Balapan gagal — waktu habis');race=null}}
   if(fare){fare.t-=dt;
    if(Math.hypot(p.x-fare.x,p.z-fare.z)<10){const pay=fare.pay+Math.round(fare.t)*3000;
     game.player.money+=pay;game.respect.add(15);game.player.stats.fares++;
     game.ui.titleCard('PENUMPANG SAMPAI','+'+fmtRp(pay));fare=null}
    else if(fare.t<=0){game.ui.notice('Penumpang kabur — terlambat');fare=null}}},
  coinSpots}}
