import { cp, mkdir, rm, readdir } from "node:fs/promises";
import { join } from "node:path";
const root=process.cwd(), out=join(root,"www");
await rm(out,{recursive:true,force:true}); await mkdir(out,{recursive:true});
const excluded=new Set(["www","node_modules","ios","android","native-app","scripts","package.json","package-lock.json","capacitor.config.json",".git",".github"]);
for (const entry of await readdir(root,{withFileTypes:true})) { if(!excluded.has(entry.name)) await cp(join(root,entry.name),join(out,entry.name),{recursive:true}); }
console.log("Web files copied to www/");
