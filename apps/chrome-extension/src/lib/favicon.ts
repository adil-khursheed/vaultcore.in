/**
 * Build a favicon URL served by Chrome itself.
 *
 * The old implementation used Google's favicon service, which leaked every
 * credential's hostname to a third party. Chrome's `_favicon` endpoint reads
 * from the local favicon cache and never makes a network request.
 */
export function getFaviconUrl(
  pageUrl: string | null | undefined,
  size = 64,
): string | undefined {
  if (!pageUrl) return undefined;

  try {
    const url = new URL(pageUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return chrome.runtime.getURL(
      `/_favicon/?pageUrl=${encodeURIComponent(url.href)}&size=${size}`,
    );
  } catch {
    return undefined;
  }
}
