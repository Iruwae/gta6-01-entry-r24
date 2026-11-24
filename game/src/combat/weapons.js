export const WEAPONS={
 fists:{name:'TANGAN KOSONG',dmg:14,interval:0.38,range:2.2,price:0,clip:Infinity,pack:0,auto:false},
 bat:{name:'TONGKAT',dmg:38,interval:0.5,range:2.6,price:120000,clip:Infinity,pack:0,auto:false},
 pistol:{name:'PISTOL GARUDA 9',dmg:24,interval:0.26,range:90,price:450000,clip:12,pack:48,auto:false},
 smg:{name:'SMG',dmg:15,interval:0.085,range:80,price:1400000,clip:30,pack:120,auto:true},
 shotgun:{name:'SHOTGUN',dmg:13,interval:0.85,range:38,price:1900000,clip:6,pack:24,auto:false,pellets:8},
 rifle:{name:'RIFLE',dmg:31,interval:0.12,range:150,price:3600000,clip:30,pack:120,auto:true},
 rpg:{name:'RPG BUAYA',dmg:300,interval:1.6,range:220,price:9000000,clip:1,pack:4,auto:false}};
export const SLOT_ORDER=['fists','bat','pistol','smg','shotgun','rifle','rpg'];
export function createLoadout(game){
 const slots={};let sel='fists';
 slots.fists={ammo:Infinity,mag:Infinity};
 return{slots,get selected(){return sel},
  give(name,ammo){const w=WEAPONS[name];if(!w)return;
   if(!slots[name])slots[name]={ammo:0,mag:0};
   slots[name].ammo=(slots[name].ammo||0)+(ammo!==undefined?ammo:w.pack);
   if(slots[name].mag===0)slots[name].mag=Math.min(w.clip,slots[name].ammo)},
  select(name){if(slots[name])sel=name},
  cycle(d){const owned=SLOT_ORDER.filter(s=>slots[s]);const i=owned.indexOf(sel);
   sel=owned[(i+d+owned.length)%owned.length]||'fists'},
  ammo(name){const s=slots[name];return s?s.ammo:0},
  mag(name){const s=slots[name];return s?s.mag:0},
  consume(name){const s=slots[name];if(!s)return false;
   if(s.mag===Infinity)return true;
   if(s.mag<=0){if(s.ammo>0){const w=WEAPONS[name];const take=Math.min(w.clip,s.ammo);s.mag=take;s.ammo-=take;return true}return false}
   s.mag--;return true},
  list(){return SLOT_ORDER.filter(s=>slots[s]).map(s=>({id:s,name:WEAPONS[s].name,ammo:slots[s].ammo,mag:slots[s].mag,sel:s===sel}))}}}
