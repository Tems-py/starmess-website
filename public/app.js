import { languages, allowedUrl, tiktokId } from './logic.js';
const assetUrl = image => new URL(`./assets/${image}`, import.meta.url).href;

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let config, gallery, releases, catalogs, lang, filter = 'all', selectedImage = 0, messageType;
const t = key => catalogs[lang][key] ?? key;
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const read = async path => {
  const response = await fetch(new URL(path, import.meta.url));
  if (!response.ok) throw new Error(`Cannot load ${path}: ${response.status}`);
  return response.json();
};
function setExternalLink(node, url) {
  node.href = url;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
}
function renderLanguage() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  $('meta[name="description"]').content = t('pageDescription');
  $('meta[property="og:title"]').content = t('pageTitle');
  $('meta[property="og:description"]').content = t('pageDescription');
  $('meta[property="og:locale"]').content = {pl:'pl_PL',en:'en_US',ru:'ru_RU'}[lang];
  $$('[data-t]').forEach(node => { node.textContent = t(node.dataset.t); });
  $$('[data-label]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.label)); });
  const buy = config.steamMode === 'buy';
  $$('[data-steam]').forEach(node => {
    if (node.classList.contains('header-cta')) node.textContent = t(buy ? 'buyShort' : 'wishlistShort');
    else node.querySelector('[data-t]').textContent = t(buy ? 'buy' : 'wishlist');
  });
  $('.final-cta h2').textContent = t(buy ? 'steamBuyTitle' : 'steamTitle');
  $('#steam-note').textContent = t(config.steamUrl ? (buy ? 'steamBuyReady' : 'steamReady') : 'steamSoon');
  $('#current-version').textContent = `${t('version')} ${releases[0].version}`;
  renderGallery(); renderTikToks();
  if ($('#lightbox').open) updateLightbox();
  if ($('#message-dialog').open && messageType) updateMessage();
}
function renderGallery() {
  const grid = $('#gallery-grid');
  grid.replaceChildren(); grid.classList.toggle('filtered', filter !== 'all');
  gallery.forEach((item, index) => {
    if (filter !== 'all' && item.category !== filter) return;
    const caption = t(`gallery.${item.key}`);
    const button = el('button', 'gallery-item');
    button.type = 'button'; button.setAttribute('aria-label', caption);
    const img = el('img'); img.src = assetUrl(item.image); img.alt = caption; img.loading = 'lazy'; img.width = 1280; img.height = 720;
    const label = el('span', 'gallery-caption'); label.append(el('b', '', caption), el('span', '', '↗'));
    label.lastChild.setAttribute('aria-hidden', 'true');
    button.append(img, label);
    button.addEventListener('click', () => { selectedImage = index; updateLightbox(); $('#lightbox').showModal(); });
    grid.append(button);
  });
}
function updateLightbox() {
  const item = gallery[selectedImage];
  $('#lightbox-image').src = assetUrl(item.image);
  $('#lightbox-image').alt = t(`gallery.${item.key}`);
  $('#lightbox-caption').textContent = `${selectedImage + 1} / ${gallery.length} — ${t(`gallery.${item.key}`)}`;
}
function moveImage(direction) {
  const indices = gallery.map((item, index) => filter === 'all' || item.category === filter ? index : -1).filter(index => index >= 0);
  selectedImage = indices[(indices.indexOf(selectedImage) + direction + indices.length) % indices.length];
  updateLightbox();
}
function renderTikToks() {
  const target = $('#tiktok-grid'); target.replaceChildren();
  const placeholders = ['reflection-coop.png', 'iron-gardener-arena.png', 'palace-beveled-corners.png'];
  const clips = config.tiktoks.filter(clip => tiktokId(clip.url));
  (clips.length ? clips : [null, null, null]).forEach((clip, index) => {
    const card = el('article', `clip${clip ? ' has-video' : ''}`);
    const img = el('img'); img.src = assetUrl(placeholders[index % 3]); img.alt = ''; img.loading = 'lazy';
    const content = el('div', 'clip-content'); content.append(el('span', 'clip-icon', clip ? '▷' : '✦'));
    content.append(el('h3', '', clip ? clip.title[lang] : t(`clip${index + 1}Title`)));
    card.append(img, el('div', 'clip-shade'), el('span', 'clip-badge', clip ? 'TIKTOK / STARMESS' : t('clipSoon')), content);
    if (clip) {
      const load = el('button', 'clip-load', t('loadTikTok'));
      load.addEventListener('click', () => {
        const iframe = el('iframe'); iframe.src = `https://www.tiktok.com/player/v1/${tiktokId(clip.url)}?autoplay=0&description=1`;
        iframe.title = clip.title[lang] || t('videoTitle'); iframe.allow = 'fullscreen; encrypted-media; picture-in-picture'; iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        link.classList.add('clip-player-link');
        card.replaceChildren(iframe, link); iframe.focus();
      });
      const link = el('a', 'clip-link', t('watchTikTok')); setExternalLink(link, clip.url);
      content.append(load, link);
    } else content.append(el('p', '', t('clipEmpty')));
    target.append(card);
  });
}
function updateMessage() {
  $('#message-title').textContent = t(`${messageType}Title`);
  $('#message-body').textContent = t(`${messageType}Body`);
}
function showMessage(type) { messageType = type; updateMessage(); $('#message-dialog').showModal(); }
function wireLinks() {
  for (const [selector, url, hosts, type] of [
    ['[data-steam]', config.steamUrl, ['store.steampowered.com'], 'steamSoon'],
    ['[data-discord]', config.discordUrl, ['discord.gg','discord.com'], 'discordSoon']
  ]) {
    $$(selector).forEach(link => {
      const safe = allowedUrl(url, hosts);
      if (safe) setExternalLink(link, safe);
      else {
        link.setAttribute('aria-haspopup', 'dialog');
        link.addEventListener('click', event => { event.preventDefault(); showMessage(type); });
      }
    });
  }
  const profile = allowedUrl(config.tiktokProfileUrl, ['www.tiktok.com','tiktok.com']);
  if (profile) { $('#tiktok-profile').hidden = false; setExternalLink($('#tiktok-profile'), profile); }
}
async function init() {
  [config, gallery, releases, ...catalogs] = await Promise.all([
    read('./data/site.json'), read('./data/gallery.json'), read('./data/releases.json'), ...languages.map(code => read(`./locales/${code}.json`))
  ]);
  catalogs = Object.fromEntries(languages.map((code,index) => [code, catalogs[index]]));
  lang = document.documentElement.lang;
  const legacyLanguage = new URL(location.href).searchParams.get('lang');
  if (languages.includes(legacyLanguage)) {
    location.replace(new URL(`./${legacyLanguage}/${location.hash}`,import.meta.url));
    return;
  }
  wireLinks(); renderLanguage(); $('#year').textContent = new Date().getFullYear();
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    $$('[data-filter]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    renderGallery();
  }));
  $('#previous-image').addEventListener('click', () => moveImage(-1));
  $('#next-image').addEventListener('click', () => moveImage(1));
  $('#lightbox').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); moveImage(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  $$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { if (!$$('dialog').some(item => item.open)) document.body.style.overflow = ''; });
    new MutationObserver(() => { if (dialog.open) document.body.style.overflow = 'hidden'; }).observe(dialog, {attributes:true, attributeFilter:['open']});
  });
  $('#privacy-button').addEventListener('click', () => showMessage('privacy'));
}
init().catch(error => {
  console.error(error);
  const fallback = document.createElement('p'); fallback.className = 'noscript'; fallback.setAttribute('role','alert');
  fallback.textContent = 'Nie udało się wczytać danych. Odśwież stronę. / Could not load page data. Please refresh. / Не удалось загрузить данные. Обновите страницу.';
  $('#main').prepend(fallback);
});
