export function createCollision(){const cell=32,map=new Map();const boxes=[];
function key(cx,cz){return cx+','+cz}
return{add(x0,z0,x1,z1,h,slim){const b={x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1),h:h||10,slim:!!slim};boxes.push(b);
 const ax=Math.floor(b.x0/cell),bx=Math.floor(b.x1/cell),az=Math.floor(b.z0/cell),bz=Math.floor(b.z1/cell);
 for(let cx=ax;cx<=bx;cx++)for(let cz=az;cz<=bz;cz++){const k=key(cx,cz);if(!map.has(k))map.set(k,[]);map.get(k).push(b)}return b},
 solidAt(x,z,y){const k=key(Math.floor(x/cell),Math.floor(z/cell));const l=map.get(k);if(!l)return null;
  for(const b of l)if(x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1&&(y===undefined||y<b.h))return b;return null},
 resolveCircle(p,r,feet){const k=key(Math.floor(p.x/cell),Math.floor(p.z/cell));const l=map.get(k);if(!l)return null;
  let hit=null;
  for(const b of l){if(b.h<=(feet||0))continue;
   const cx=Math.max(b.x0,Math.min(p.x,b.x1)),cz=Math.max(b.z0,Math.min(p.z,b.z1));
   const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
   if(d2<r*r){let nx,nz,depth;
    if(d2>1e-6){const d=Math.sqrt(d2);nx=dx/d;nz=dz/d;depth=r-d}
    else{const lft=p.x-b.x0,rgt=b.x1-p.x,top=p.z-b.z0,bot=b.z1-p.z;const m=Math.min(lft,rgt,top,bot);
     if(m===lft){nx=-1;nz=0;depth=lft+r}else if(m===rgt){nx=1;nz=0;depth=rgt+r}
     else if(m===top){nx=0;nz=-1;depth=top+r}else{nx=0;nz=1;depth=bot+r}}
    p.x+=nx*depth;p.z+=nz*depth;hit={nx,nz,depth,box:b}}}
  return hit},
 lineOfSight(ax,az,bx,bz,h){const dx=bx-ax,dz=bz-az,d=Math.hypot(dx,dz);if(d<1)return true;const steps=Math.ceil(d/4);
  for(let i=1;i<steps;i++){const t=i/steps;if(this.solidAt(ax+dx*t,az+dz*t,h||2))return false}return true},
 boxes}}
