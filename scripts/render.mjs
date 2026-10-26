import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { languages } from '../public/logic.js';
import { deploymentSiteUrl, isPreview } from './deployment.mjs';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function siteBase(value) {
  if (!value) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('SITE_URL must be an absolute HTTPS site URL without credentials, query or fragment.');
  return url.href.replace(/\/$/,'') + '/';
}
export async function renderSite(root, output, siteUrl, env = process.env) {
  const read = file => readFile(path.join(root,'public',file),'utf8');
  const [template, config, gallery, releases] = await Promise.all([read('index.html'),read('data/site.json').then(JSON.parse),read('data/gallery.json').then(JSON.parse),read('data/releases.json').then(JSON.parse)]);
  const base = siteBase(siteUrl ?? deploymentSiteUrl(config, env));
  const preview = isPreview(env);
  for (const lang of languages) {
    const catalog = JSON.parse(await read(`locales/${lang}.json`));
    const t = key => { if (!catalog[key]) throw new Error(`Missing ${lang}:${key}`); return escapeHtml(catalog[key]); };
    let html = template.replace('<html lang="pl">',`<html lang="${lang}" data-static="true">`);
    html = html.replace(/<([a-z0-9]+)([^>]*data-t="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g,(_,tag,attrs,key) => `<${tag}${attrs}>${t(key)}</${tag}>`);
    html = html.replace(/<[^>]+data-label="([^"]+)"[^>]*>/g,(tag,key) => tag.replace(/aria-label="[^"]*"/,`aria-label="${t(key)}"`));
    html = html.replace(/<title>.*?<\/title>/,`<title>${t('pageTitle')}</title>`)
      .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*/,`$1${t('pageDescription')}`)
      .replace(/(<meta property="og:description" content=")[^"]*/,`$1${t('pageDescription')}`)
      .replace(/(<meta property="og:title" content=")[^"]*/,`$1${t('pageTitle')}`)
      .replace('content="pl_PL"',`content="${{pl:'pl_PL',en:'en_US',ru:'ru_RU'}[lang]}"`);
    html = html.replace(/<label class="language">[\s\S]*?<\/label>/,`<div class="language-links" role="group" aria-label="${t('language')}">${languages.map(code=>`<a data-language="${code}" href="./${code}/" lang="${code}" hreflang="${code}"${code===lang?' aria-current="page"':''}>${code.toUpperCase()}</a>`).join('')}</div>`);
    html = html.replace('<div id="gallery-grid" class="gallery-grid"></div>',`<div id="gallery-grid" class="gallery-grid">${gallery.map(item=>`<a class="gallery-item" href="./assets/${item.image}" aria-label="${t(`gallery.${item.key}`)}"><img src="./assets/${item.image}" alt="${t(`gallery.${item.key}`)}" width="1280" height="720" loading="lazy"><span class="gallery-caption"><b>${t(`gallery.${item.key}`)}</b><span aria-hidden="true">↗</span></span></a>`).join('')}</div>`);
    const releaseHtml = (release,index) => `<article class="release"><div class="release-head"><h3>v${escapeHtml(release.version)}${index===0?`<span class="release-badge">${t('latest')}</span>`:''}</h3><time datetime="${release.date}">${escapeHtml(new Intl.DateTimeFormat(lang,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${release.date}T12:00:00Z`)))}</time></div><ul>${release.entries[lang].map(text=>`<li>${escapeHtml(text)}</li>`).join('')}</ul></article>`;
    const history = releases.slice(0,4).map(releaseHtml).join('') + (releases.length>4?`<details class="release-archive"><summary>${t('moreChanges')}</summary>${releases.slice(4).map((release,index)=>releaseHtml(release,index+4)).join('')}</details>`:'');
    html = html.replace('<div id="releases"></div>',`<div id="releases">${history}</div>`).replace(/<button id="more-releases"[^>]*>[\s\S]*?<\/button>/,'');
    html = html.replace('<span class="version-label" id="current-version"></span>',`<span class="version-label" id="current-version">${t('version')} ${escapeHtml(releases[0].version)}</span>`);
    if(config.steamMode==='buy') html = html.replaceAll(t('wishlist'),t('buy')).replaceAll(t('wishlistShort'),t('buyShort')).replace(t('steamTitle'),t('steamBuyTitle'));
    if(config.steamUrl) {
      html = html.replace(/<a ([^>]*data-steam[^>]*)href="#steam"/g,`<a $1href="${escapeHtml(config.steamUrl)}" target="_blank" rel="noopener noreferrer"`);
      html = html.replace(t('steamSoon'),t(config.steamMode==='buy'?'steamBuyReady':'steamReady'));
    }
    if(config.discordUrl) html = html.replace(/<a ([^>]*data-discord[^>]*)href="#community"/g,`<a $1href="${escapeHtml(config.discordUrl)}" target="_blank" rel="noopener noreferrer"`);
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/,`<noscript><style>.filters,#privacy-button,[data-discord][href="#community"]{display:none}</style></noscript>`);
    const localHead = `<meta name="robots" content="${preview ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${t('pageTitle')}">\n<meta name="twitter:description" content="${t('pageDescription')}">`;
    const url = base ? `${base}${lang}/` : '';
    const image = base ? `${base}assets/palace-beveled-corners.png` : '';
    const linkedHead = base ? `<link rel="canonical" href="${escapeHtml(url)}">\n${languages.map(code=>`<link rel="alternate" hreflang="${code}" href="${escapeHtml(`${base}${code}/`)}">`).join('\n')}\n<link rel="alternate" hreflang="x-default" href="${escapeHtml(`${base}pl/`)}">\n<meta property="og:url" content="${escapeHtml(url)}">\n<meta property="og:image" content="${escapeHtml(image)}">\n<meta property="og:image:width" content="1280">\n<meta property="og:image:height" content="720">\n<meta property="og:image:alt" content="${t('gallery.palace')}">\n<meta name="twitter:image" content="${escapeHtml(image)}">` : '';
    const structured = {'@context':'https://schema.org','@type':'VideoGame',name:'StarMess',description:catalog.pageDescription,inLanguage:languages,...(base?{url,image}:{})};
    html = html.replace('</head>',`${localHead}\n${linkedHead}\n<script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script>\n</head>`);
    const localized = html.replaceAll('="./','="../');
    await mkdir(path.join(output,lang),{recursive:true});
    await writeFile(path.join(output,lang,'index.html'),localized);
    if(lang==='pl') await writeFile(path.join(output,'index.html'),html);
  }
  await writeFile(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\n${base && !preview?`Sitemap: ${base}sitemap.xml\n`:''}`);
  if(base && !preview) {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${languages.map(lang=>`<url><loc>${escapeHtml(`${base}${lang}/`)}</loc>${languages.map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${escapeHtml(`${base}${code}/`)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(`${base}pl/`)}"/></url>`).join('')}</urlset>\n`;
    await writeFile(path.join(output,'sitemap.xml'),sitemap);
  } else if (!base) console.log('Local build: set SITE_URL (or siteUrl in data/site.json) to generate SEO URLs. Vercel supplies the production URL automatically.');
}
