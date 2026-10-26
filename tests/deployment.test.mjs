import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deploymentSiteUrl } from '../scripts/deployment.mjs';
import { renderSite } from '../scripts/render.mjs';
const root = fileURLToPath(new URL('../',import.meta.url));

test('Vercel previews resolve SEO URLs to production, with explicit overrides taking precedence', () => {
  const env={VERCEL:'1',VERCEL_ENV:'preview',VERCEL_PROJECT_PRODUCTION_URL:'game.vercel.app',VERCEL_URL:'game-pr-123.vercel.app'};
  assert.equal(deploymentSiteUrl({},env),'https://game.vercel.app');
  assert.equal(deploymentSiteUrl({siteUrl:'https://game.example'},env),'https://game.example');
  assert.equal(deploymentSiteUrl({siteUrl:'https://game.example'},{...env,SITE_URL:'https://custom.example'}),'https://custom.example');
  assert.throws(()=>deploymentSiteUrl({},{VERCEL:'1',VERCEL_ENV:'preview',VERCEL_URL:'preview.vercel.app'}));
  assert.equal(deploymentSiteUrl({},{VERCEL:'1',VERCEL_ENV:'production',VERCEL_URL:'live.vercel.app'}),'https://live.vercel.app');
});
test('preview HTML has noindex, production canonical and no sitemap',async () => {
  const output=await mkdtemp(path.join(tmpdir(),'starmess-preview-'));
  try {
    await renderSite(root,output,undefined,{VERCEL:'1',VERCEL_ENV:'preview',SITE_URL:'https://game.vercel.app',VERCEL_PROJECT_PRODUCTION_URL:'game.vercel.app'});
    const html=await readFile(path.join(output,'en/index.html'),'utf8');
    assert.ok(html.includes('name="robots" content="noindex,nofollow"'));
    assert.ok(html.includes('rel="canonical" href="https://game.vercel.app/en/"'));
    assert.ok(!(await readFile(path.join(output,'robots.txt'),'utf8')).includes('Sitemap:'));
    await assert.rejects(readFile(path.join(output,'sitemap.xml')),{code:'ENOENT'});
  } finally {await rm(output,{recursive:true,force:true});}
});
