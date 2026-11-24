import {buildDossier} from './vendor/makefun-game.ts';
import {copyFileSync,existsSync,lstatSync,mkdirSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.argv[2]||process.env.MAKEFUN_OUTPUT_DIR||'out');
function copyDir(src,dst){mkdirSync(dst,{recursive:true});
 for(const e of readdirSync(src,{withFileTypes:true})){const s=join(src,e.name),d=join(dst,e.name);
  if(e.isDirectory())copyDir(s,d);else if(e.isFile())copyFileSync(s,d)}}
if(existsSync(out))rmSync(out,{recursive:true,force:true});
mkdirSync(out,{recursive:true});
copyDir(join(root,'game'),join(out,'game'));
if(existsSync(join(root,'screenshots')))copyDir(join(root,'screenshots'),join(out,'screenshots'));
const bytes=buildDossier(out,{text_max_bytes:163840,screenshots:{max:4,max_bytes:262144},game_max_files:993,game_max_bytes:50331648,game_path_max_bytes:1000});
writeFileSync(join(out,'dossier.json'),bytes);
console.log('dossier '+bytes.length+' bytes -> '+join(out,'dossier.json'));
