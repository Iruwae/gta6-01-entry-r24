export function createSave(game){
 const KEY='teluk-senja-save-v1';
 return{slots(){try{const raw=localStorage.getItem(KEY);if(!raw)return[null,null,null];
   const d=JSON.parse(raw);return[d,null,null]}catch(e){return[null,null,null]}},
  save(){try{const p=game.player;
   const d={money:p.money,rp:game.respect.rp,missions:game.missions.doneCount,
    x:p.position.x,z:p.position.z,coins:game.activities.coinsCollected,
    stats:p.stats,time:game.time,
    summary:game.missions.doneCount+'/8 misi · Rp '+p.money+' · '+game.respect.rankName};
   localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}},
  load(i){try{const raw=localStorage.getItem(KEY);if(!raw)return false;const d=JSON.parse(raw);
   game.player.money=d.money;game.respect.rp=d.rp;game.activities.coinsCollected=d.coins;
   Object.assign(game.player.stats,d.stats||{});game.player.placeAt(d.x,d.z,0);return true}catch(e){return false}}}}
