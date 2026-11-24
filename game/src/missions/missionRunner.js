import {MISSIONS} from './story.js';
import {fmtRp} from '../core/rng.js';
export function createMissionRunner(game){
 let cur=null,stepIdx=0,stepState=null,dialogueQueue=[],dlgT=0,timer=0;
 function showDlg(){if(dialogueQueue.length){const[n,t]=dialogueQueue[0];game.ui.dialogue(n,t);dlgT=0}}
 return{get current(){return cur},get step(){return cur?cur.steps[stepIdx]:null},get stepIndex(){return stepIdx},
  get doneCount(){return MISSIONS.filter(m=>m.done).length},
  start(id){const m=MISSIONS.find(m=>m.id===id);if(!m)return;
   cur=m;stepIdx=0;stepState={};dialogueQueue=[...m.dlg];timer=0;
   game.bus.emit('mission-start',{mission:m});
   game.ui.titleCard(m.title,'MISI '+(MISSIONS.indexOf(m)+1)+' DARI 8');
   game.ui.notice('Misi dimulai: '+m.title);
   if(m.steps[0]&&m.steps[0].timer)timer=m.steps[0].timer;
   showDlg()},
  next(){if(!cur){const nxt=MISSIONS.find(m=>!m.done);if(nxt)this.start(nxt.id);return}
   game.ui.notice('Misi berikutnya: '+cur.title)},
  advance(){if(!cur)return;stepIdx++;
   if(stepIdx>=cur.steps.length){this.complete();return}
   const s=cur.steps[stepIdx];if(s.timer)timer=s.timer;if(s.count)stepState.left=s.count;
   game.ui.notice('Langkah baru: '+s.txt)},
  complete(){if(!cur)return;const m=cur;
   m.done=true;const rp=120+Math.round(m.pay/60000);
   game.player.money+=m.pay;game.player.stats.earned+=m.pay;
   game.respect.add(rp);
   game.ui.titleCard('MISI SELESAI',m.title+' · +'+fmtRp(m.pay)+' · +'+rp+' RP');
   game.bus.emit('mission-done',{mission:m});
   cur=null;game.save.save()},
  fail(reason){if(!cur)return;game.ui.titleCard('MISI GAGAL',reason||cur.title);
   game.bus.emit('mission-fail',{mission:cur});cur=null},
  update(dt){if(dialogueQueue.length){dlgT+=dt;
    const line=dialogueQueue[0];const need=Math.max(3,line[1].length*0.065);
    if(dlgT>need){dialogueQueue.shift();if(dialogueQueue.length)showDlg();else game.ui.hideDialogue()}}
   if(!cur)return;const s=cur.steps[stepIdx];if(!s)return;
   const p=game.player.position;
   if(s.timer!==undefined){timer-=dt;if(timer<=0){this.fail('Waktu habis');return}}
   const d=Math.hypot(p.x-s.x,p.z-s.z);
   if(s.k==='drive'&&d<8)this.advance();
   else if(s.k==='talk'&&d<4){this.advance()}
   else if(s.k==='pickup'&&d<4){this.advance()}
   else if(s.k==='deliver'&&d<8){this.advance()}
   else if(s.k==='steal'){const v=game.fleet.list.find(v=>v.kind==='comet'&&Math.hypot(v.position.x-s.x,v.position.z-s.z)<30);
    if(v&&game.player.vehicle===v)this.advance()}
   else if(s.k==='escape'&&d<10&&game.wanted.level===0)this.advance();
   else if(s.k==='kill'&&stepState.left!==undefined&&stepState.left<=0)this.advance();
   if(s.k==='kill'&&s.count&&stepState.left===undefined)stepState.left=s.count},
  onKill(){if(cur&&cur.steps[stepIdx]&&cur.steps[stepIdx].k==='kill'&&stepState.left>0){stepState.left--;
    game.ui.notice('Tersisa '+stepState.left+' target');
    if(stepState.left<=0)this.advance()}},
  get timer(){return timer},get stepLeft(){return stepState.left},
  target(){return cur?cur.steps[stepIdx]:null}}}
