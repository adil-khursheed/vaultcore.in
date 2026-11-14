const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

// Marketing site. Indexed by search engines.
export const siteUrl = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vaultcore.in",
);

// Product app. Never indexed.
export const appUrl = stripTrailingSlash(
  process.env.NEXT_PUBLIC_WEB_APP_URL ?? "https://dash.vaultcore.in",
);
