export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function makeRng(seed){const f=mulberry32(seed);return{next:f,range:(a,b)=>a+f()*(b-a),int:(a,b)=>a+Math.floor(f()*(b-a+1)),pick:(arr)=>arr[Math.floor(f()*arr.length)],fork:(label)=>{let h=seed;for(const c of label)h=(h*31+c.charCodeAt(0))|0;return makeRng(h)}}}
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const lerp=(a,b,t)=>a+(b-a)*t;
export const dist2=(ax,az,bx,bz)=>{const dx=ax-bx,dz=az-bz;return dx*dx+dz*dz};
export function fmtRp(n){n=Math.round(n);return'Rp '+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
export function fmtTime(s){s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
