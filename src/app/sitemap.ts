import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://killaplayground.com';
  const lastModified = new Date().toISOString();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          en: `${siteUrl}/?lang=en`,
          mr: `${siteUrl}/?lang=mr`,
          hi: `${siteUrl}/?lang=hi`,
        },
      },
    },
  ];
}
