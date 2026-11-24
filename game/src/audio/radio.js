import {STATIONS} from '../missions/story.js';
export function createRadio(game){
 let station=0,song=0,ctx=null,master=null;
 function ensure(){if(ctx)return;try{ctx=new (window.AudioContext||window.webkitAudioContext)();
  master=ctx.createGain();master.gain.value=0.5;master.connect(ctx.destination)}catch(e){ctx=null}}
 return{get current(){const s=STATIONS[station];return{name:s.name,song:s.songs[song%s.songs.length]}},
  next(){station=(station+1)%STATIONS.length;song=0},
  nextSong(){song++},
  blip(f,d){ensure();if(!ctx)return;try{const o=ctx.createOscillator(),g=ctx.createGain();
   o.frequency.value=f||440;g.gain.value=0.08;o.connect(g);g.connect(master);
   o.start();g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+(d||0.1));o.stop(ctx.currentTime+(d||0.1))}catch(e){}},
  engine(sp){}} }
