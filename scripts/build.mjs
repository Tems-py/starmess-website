import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validate } from './validate.mjs';
import { renderSite } from './render.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export async function buildSite() {
await validate();
const output = path.join(root, 'dist');
if (path.dirname(output) !== path.resolve(root)) throw new Error('Unsafe output path');
await rm(output, { recursive:true, force:true });
await mkdir(output, {recursive:true});
await cp(path.join(root, 'public'), output, {recursive:true});
await renderSite(root, output);
console.log('Built website/dist. Ready for static hosting.');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await buildSite();
