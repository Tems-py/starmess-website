import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateConfig, languages } from '../public/logic.js';
import { siteBase } from './render.mjs';
const publicRoot = new URL('../public/',import.meta.url);
const json = async file => JSON.parse(await readFile(new URL(file,publicRoot),'utf8'));
export async function validate() {
  const config = await json('data/site.json');
  const errors = validateConfig(config);
  siteBase(process.env.SITE_URL ?? config.siteUrl);
  const catalogs = await Promise.all(languages.map(lang => json(`locales/${lang}.json`)));
  const keys = Object.keys(catalogs[0]).sort();
  catalogs.forEach((catalog,index) => {
    if (JSON.stringify(Object.keys(catalog).sort()) !== JSON.stringify(keys)) errors.push(`Mismatched locale keys: ${languages[index]}`);
    if (Object.values(catalog).some(value => typeof value !== 'string' || !value.trim())) errors.push(`Empty translation: ${languages[index]}`);
  });
  const html = await readFile(new URL('index.html',publicRoot),'utf8');
  for (const [,key] of html.matchAll(/data-(?:t|label)="([^"]+)"/g)) if (!keys.includes(key)) errors.push(`Missing translation: ${key}`);
  const releases = await json('data/releases.json');
  if (!releases.length) errors.push('No game releases');
  releases.forEach(release => {
    if (!/^\d+\.\d+\.\d+$/.test(release.version) || !/^\d{4}-\d{2}-\d{2}$/.test(release.date)) errors.push('Invalid release');
    if (languages.some(lang => !release.entries[lang]?.length || release.entries[lang].some(text => !text))) errors.push(`Missing release translations: ${release.version}`);
  });
  for (const shot of await json('data/gallery.json')) {
    if (!keys.includes(`gallery.${shot.key}`)) errors.push(`Missing gallery label: ${shot.key}`);
    await access(new URL(`assets/${shot.image}`,publicRoot));
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Validated ${keys.length} translation keys × 3 languages, ${releases.length} releases, gallery and external links.`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await validate();
