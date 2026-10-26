import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSite, siteBase, escapeHtml } from '../scripts/render.mjs';

const root = fileURLToPath(new URL('../',import.meta.url));
test('SEO rendering emits translated full HTML and correct metadata under a repository subpath',async () => {
  const output=await mkdtemp(path.join(tmpdir(),'starmess-seo-'));
  try {
    await renderSite(root,output,'https://example.com/starmess',{});
    const releases=JSON.parse(await readFile(path.join(root,'public/data/releases.json'),'utf8'));
    for(const lang of ['pl','en','ru']) {
      const html=await readFile(path.join(output,lang,'index.html'),'utf8');
      const text=JSON.parse(await readFile(path.join(root,`public/locales/${lang}.json`),'utf8'));
      assert.ok(html.includes(`<html lang="${lang}"`));
      assert.ok(html.includes(`<title>${escapeHtml(text.pageTitle)}</title>`));
      assert.ok(html.includes(`name="description" content="${escapeHtml(text.pageDescription)}"`));
      assert.ok(html.includes(`property="og:description" content="${escapeHtml(text.pageDescription)}"`));
      assert.ok(html.includes(`rel="canonical" href="https://example.com/starmess/${lang}/"`));
      for(const code of ['pl','en','ru']) {
        assert.ok(html.includes(`hreflang="${code}" href="https://example.com/starmess/${code}/"`));
        assert.ok(html.includes(`href="../${code}/"`));
      }
      assert.ok(html.includes('src="../app.js"'));
      assert.ok(html.includes('href="../styles.css"'));
      assert.equal((html.match(/class="gallery-item"/g)||[]).length,6);
      assert.equal((html.match(/class="release"/g)||[]).length,releases.length);
      for(const release of releases) for(const entry of release.entries[lang]) assert.ok(html.includes(escapeHtml(entry)));
      const structured=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
      assert.equal(structured['@type'],'VideoGame');
      assert.equal(structured.url,`https://example.com/starmess/${lang}/`);
      assert.ok(!('offers' in structured));
      assert.ok(!html.includes('<iframe'));
      assert.ok(html.includes('property="og:image" content="https://example.com/starmess/assets/palace-beveled-corners.png"'));
    }
    const sitemap=await readFile(path.join(output,'sitemap.xml'),'utf8');
    assert.equal((sitemap.match(/<loc>/g)||[]).length,3);
    assert.equal((sitemap.match(/<xhtml:link/g)||[]).length,12);
    assert.ok((await readFile(path.join(output,'robots.txt'),'utf8')).includes('Sitemap: https://example.com/starmess/sitemap.xml'));
    const home=await readFile(path.join(output,'index.html'),'utf8');
    assert.ok(home.includes('href="./en/"'));
    assert.ok(home.includes('src="./app.js"'));
  } finally {await rm(output,{recursive:true,force:true});}
});
test('local builds never invent a production domain',async () => {
  const output=await mkdtemp(path.join(tmpdir(),'starmess-local-'));
  try {
    await renderSite(root,output,'',{});
    const html=await readFile(path.join(output,'en/index.html'),'utf8');
    assert.ok(!html.includes('rel="canonical"'));
    assert.ok(!(await readFile(path.join(output,'robots.txt'),'utf8')).includes('Sitemap:'));
  } finally {await rm(output,{recursive:true,force:true});}
});
test('production URL rejects misleading or unsafe configuration',() => {
  assert.equal(siteBase('https://example.com/game'),'https://example.com/game/');
  for(const value of ['http://example.com','https://user:secret@example.com','https://example.com/?lang=en','https://example.com/#foo','javascript:alert(1)']) assert.throws(()=>siteBase(value));
});
