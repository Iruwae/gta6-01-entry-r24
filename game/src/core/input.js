export function createInput(){const held=new Set(),pressed=new Set();let mx=0,my=0,locked=false;
const kd=(e)=>{if(e.code==='Tab')e.preventDefault();if(!held.has(e.code))pressed.add(e.code);held.add(e.code)};
const ku=(e)=>held.delete(e.code);
const md=(e)=>{if(e.button===0)pressed.add('Mouse0'),held.add('Mouse0')};
const mu=(e)=>{if(e.button===0)held.delete('Mouse0')};
const mm=(e)=>{if(locked){mx+=e.movementX;my+=e.movementY}};
window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
window.addEventListener('mousedown',md);window.addEventListener('mouseup',mu);
window.addEventListener('mousemove',mm);
return{held,pressed,down:(c)=>held.has(c),hit:(c)=>pressed.has(c),consume:(c)=>pressed.delete(c),
endFrame(){pressed.clear();mx=0;my=0},
mouseDelta(){const d={x:mx,y:my};mx=0;my=0;return d},
lock(){const c=document.getElementById('gl');if(c&&c.requestPointerLock)c.requestPointerLock();locked=true},
unlock(){if(document.exitPointerLock)document.exitPointerLock();locked=false},
isLocked:()=>locked}}
