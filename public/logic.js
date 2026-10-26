export const languages = ['pl', 'en', 'ru'];
export function selectLanguage(query, stored, browser) {
  return [query, stored, browser?.split('-')[0], 'pl'].find(value => languages.includes(value));
}
export function allowedUrl(value, hosts) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && hosts.includes(url.hostname) ? url.href : '';
  } catch { return ''; }
}
export function tiktokId(value) {
  const url = allowedUrl(value, ['www.tiktok.com', 'tiktok.com']);
  return url ? new URL(url).pathname.match(/^\/@[^/]+\/video\/(\d{10,25})\/?$/)?.[1] || '' : '';
}
export function validateConfig(config) {
  const issues = [];
  for (const [key, hosts] of Object.entries({ steamUrl: ['store.steampowered.com'], discordUrl: ['discord.gg', 'discord.com'], tiktokProfileUrl: ['www.tiktok.com', 'tiktok.com'] })) {
    if (typeof config[key] !== 'string' || (config[key] && !allowedUrl(config[key], hosts))) issues.push(`Invalid ${key}`);
  }
  if (!['wishlist', 'buy'].includes(config.steamMode)) issues.push('steamMode must be wishlist or buy');
  if (!Array.isArray(config.tiktoks)) issues.push('tiktoks must be an array');
  else for (const clip of config.tiktoks) {
    if (!tiktokId(clip.url)) issues.push(`Invalid TikTok URL: ${clip.url}`);
    if (!clip.title || languages.some(lang => typeof clip.title[lang] !== 'string' || !clip.title[lang].trim())) issues.push('TikTok title needs pl/en/ru');
  }
  return issues;
}
