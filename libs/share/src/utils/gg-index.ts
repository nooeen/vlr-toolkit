import GetSitemapLinks from "get-sitemap-links";

export const getLinksFromSitemap = async (sitemapUrl: string) => {
  const array = await GetSitemapLinks(sitemapUrl);

  console.log(array.length);

  return array;
};

export function getMainDomain(url) {
  try {
      // Extract hostname from the URL
      const hostname = new URL(url).hostname;

      // Split the hostname by dots
      const parts = hostname.split('.');

      // If the hostname has less than 2 parts, return it as is
      if (parts.length < 2) return hostname;

      // Get the main domain by joining the last two parts
      const mainDomain = parts.slice(-2).join('.');

      return mainDomain;
  } catch (error) {
      console.error("Invalid URL:", url, error);
      return null;
  }
}



