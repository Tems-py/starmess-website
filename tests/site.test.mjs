import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedUrl, selectLanguage, tiktokId, validateConfig } from '../public/logic.js';
import { validate } from '../scripts/validate.mjs';

test('language: URL wins, saved choice next, browser next, unsupported languages fall back to English', () => {
  assert.equal(selectLanguage('ru','pl','en-US'),'ru');
  assert.equal(selectLanguage(null,'en','pl-PL'),'en');
  assert.equal(selectLanguage(null,null,'ru-RU'),'ru');
  assert.equal(selectLanguage('de','fr','de-DE'),'en');
});
test('external links reject unsafe protocols, credentials and lookalike domains', () => {
  const hosts = ['store.steampowered.com'];
  assert.ok(allowedUrl('https://store.steampowered.com/app/123/',hosts));
  for (const url of ['javascript:alert(1)','http://store.steampowered.com','https://store.steampowered.com.evil.test','https://user:secret@store.steampowered.com','broken']) assert.equal(allowedUrl(url,hosts),'');
});
test('TikTok only extracts post IDs from full canonical video links', () => {
  assert.equal(tiktokId('https://www.tiktok.com/@starmess/video/6718335390845095173?lang=en'),'6718335390845095173');
  assert.equal(tiktokId('https://evil.test/@starmess/video/6718335390845095173'),'');
  assert.equal(tiktokId('https://www.tiktok.com/@starmess'),'');
  assert.equal(tiktokId('https://vm.tiktok.com/short/'),'');
});
test('unconfigured integrations are valid, configured clips require complete translations', () => {
  const empty = {steamUrl:'',steamMode:'wishlist',discordUrl:'',tiktokProfileUrl:'',tiktoks:[]};
  assert.deepEqual(validateConfig(empty),[]);
  assert.deepEqual(validateConfig({...empty,tiktoks:['https://www.tiktok.com/@a/video/6718335390845095173']}),[]);
  assert.ok(validateConfig({...empty,steamMode:'other'}).length);
  assert.ok(validateConfig({...empty,tiktoks:[{url:'https://www.tiktok.com/@a/video/6718335390845095173',title:{pl:'Tytuł'}}]}).length);
  assert.deepEqual(validateConfig({...empty,tiktoks:[{url:'https://www.tiktok.com/@a/video/6718335390845095173',title:{pl:'Tytuł',en:'Title',ru:'Название'}}]}),[]);
});
test('all shipped translations, changelog entries and gallery images are present', validate);
