import {clamp} from '../core/rng.js';
export const MAKES={
 comet:{name:'GARUDA GT',top:56,acc:15,grip:9.5,hp:1400,val:4200,len:4.6,w:2,col:0xd21f2a},
 tide:{name:'OMBAK',top:42,acc:10,grip:8,hp:1200,val:1800,len:4.4,w:1.9,col:0x3a6a9a},
 fizz:{name:'KANCIL',top:38,acc:9,grip:8.5,hp:800,val:900,len:3.6,w:1.7,col:0xe8c84a},
 cab:{name:'TAKSI',top:43,acc:10,grip:8,hp:1100,val:1200,len:4.4,w:1.9,col:0xf2c230},
 hauler:{name:'TRUK BESAR',top:40,acc:7,grip:7,hp:2400,val:2200,len:7,w:2.5,col:0x7a5a3a},
 vanette:{name:'ANGKOT',top:36,acc:8,grip:7.5,hp:1300,val:1100,len:5,w:2.1,col:0x4a9a5a},
 brava:{name:'BRAVA',top:50,acc:13,grip:9,hp:1300,val:3200,len:4.5,w:1.95,col:0x8a2a6a},
 bulwark:{name:'BULWARK',top:44,acc:9,grip:7.5,hp:2600,val:0,len:5.4,w:2.3,col:0x2a2a3a},
 bus:{name:'BUS KOTA',top:27,acc:5.5,grip:6.5,hp:2800,val:0,len:9,w:2.6,col:0x3a7a8a},
 rockhog:{name:'PICKUP',top:30,acc:8,grip:7,hp:1800,val:1500,len:5.2,w:2.1,col:0x9a6a3a},
 interceptor:{name:'PATROLI',top:53,acc:14,grip:9,hp:1600,val:0,len:4.7,w:2,col:0xe8e8e8}};
export function stepCar(v,dt,input,coll){
 const m=MAKES[v.kind];const fwd=input.f?1:0,bk=input.b?1:0,hb=input.hb?1:0;
 const sp=Math.hypot(v.velocity.x,v.velocity.z);
 const steerMax=0.52-(0.52-0.06)*clamp(sp/m.top,0,1);
 let steer=0;if(input.l)steer+=steerMax;if(input.r)steer-=steerMax;
 const yawRate=clamp(2.3-(2.3-0.9)*clamp(sp/m.top,0,1),0.9,2.3)*(hb?1.55:1);
 const dir=sp>0.5?(v.velocity.x*Math.sin(v.heading)+v.velocity.z*Math.cos(v.heading))>=0?1:-1:1;
 v.heading+=steer*yawRate*dt*dir*(sp>0.2?1:0);
 const fx=Math.sin(v.heading),fz=Math.cos(v.heading);
 const fSpeed=v.velocity.x*fx+v.velocity.z*fz;
 const lSpeed=v.velocity.x*fz-v.velocity.z*fx;
 let acc=0;
 if(fwd)acc+=m.acc*(v.health<0.5*m.hp?0.45:1);
 if(bk)acc-=m.acc*0.6;
 if(!fwd&&!bk)acc-=fSpeed*0.6;
 const newF=clamp(fSpeed+acc*dt,-m.top*0.6,m.top);
 let newL=lSpeed;const grip=m.grip*(hb?0.4:1);
 newL-=newL*clamp(grip*dt,0,1);
 if(Math.abs(newL)>7)newL*=0.5;
 v.velocity.x=fx*newF+fz*newL;v.velocity.z=fz*newF-fx*newL;
 v.position.x+=v.velocity.x*dt;v.position.z+=v.velocity.z*dt;
 v.speed=Math.hypot(v.velocity.x,v.velocity.z);
 if(coll){const hit=coll.resolveCircle(v.position,1.4,0);
  if(hit){const vn=v.velocity.x*hit.nx+v.velocity.z*hit.nz;
   if(vn<0){v.velocity.x-=vn*hit.nx*1.4;v.velocity.z-=vn*hit.nz*1.4;
    if(Math.abs(vn)>4){v.health-=vn*vn*0.5;if(v.health<=0)v.burning=3.2}}}}
 if(v.burning>0){v.burning-=dt;v.health-=40*dt;if(v.health<=0&&!v.exploded){v.exploded=true;return'boom'}}
 if(v.health<0.45*m.hp)v.smoke=1;else if(v.health<0.2*m.hp)v.smoke=2;else v.smoke=0;
 return null}
