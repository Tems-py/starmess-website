export function deploymentSiteUrl(config = {}, env = process.env) {
  if (env.SITE_URL?.trim()) return env.SITE_URL.trim();
  if (config.siteUrl?.trim()) return config.siteUrl.trim();
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (env.VERCEL_ENV === 'production' && env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  if (env.VERCEL) throw new Error('Missing production URL. Enable Vercel system environment variables or set SITE_URL.');
  return '';
}
export const isPreview = (env = process.env) => Boolean(env.VERCEL && env.VERCEL_ENV !== 'production');
