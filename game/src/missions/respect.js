export const RANKS=['ANAK BARU','ANAK JALANAN','PREMAN','JAGOAN','RAJA JALANAN','BOS PANTAI','LEGENDA TELUK','PENGUASA SENJA'];
export const RP_THRESH=[0,150,400,800,1400,2200,3300,5000];
export function createRespect(game){
 let rp=0;
 return{get rp(){return rp},set rp(v){rp=v},
  get rank(){let r=0;for(let i=0;i<8;i++)if(rp>=RP_THRESH[i])r=i;return r},
  get rankName(){return RANKS[this.rank]},
  bonusHp(){return this.rank*5},
  add(n){const before=this.rank;rp+=n;
   if(this.rank>before){game.ui.titleCard('NAIK PANGKAT',RANKS[this.rank]+' · '+rp+' RP');
    game.bus.emit('rank-up',{rank:this.rank})}}}}
