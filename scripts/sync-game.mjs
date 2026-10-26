import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const game = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(root, '..');
const catalog = JSON.parse(await readFile(path.join(game,'assets/data/changelog.json'),'utf8'));
const translations = {};
for (const lang of ['pl','en','ru']) {
  const properties = await readFile(path.join(game,`assets/i18n/${lang}.properties`),'utf8');
  translations[lang] = Object.fromEntries(properties.split(/\r?\n/).filter(line => line.startsWith('changelog.')).map(line => {
    const i = line.indexOf('=');
    return [line.slice(0,i), line.slice(i+1).replace(/\\u([\da-f]{4})/gi,(_,hex) => String.fromCharCode(parseInt(hex,16))).replace(/\\n/g,'\n').replace(/\\([\\:=#!])/g,'$1')];
  }));
}
const releases = catalog.releases.map(release => ({version:release.version,date:release.date,entries:Object.fromEntries(['pl','en','ru'].map(lang => [lang,release.entries.map(key => {
  if (!translations[lang][key]) throw new Error(`Missing ${lang} translation: ${key}`);
  return translations[lang][key];
})]))}));
await writeFile(path.join(root,'public/data/releases.json'), JSON.stringify(releases,null,2)+'\n');
console.log(`Imported ${releases.length} game releases; latest ${releases[0].version}.`);
