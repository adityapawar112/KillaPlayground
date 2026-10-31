import type { Metadata } from 'next';
import { Yatra_One, Modak, Inter } from 'next/font/google';
import './globals.css';

const yatraOne = Yatra_One({
  weight: '400',
  subsets: ['devanagari', 'latin'],
  variable: '--font-yatra',
  display: 'swap',
});

const modak = Modak({
  weight: '400',
  subsets: ['devanagari', 'latin'],
  variable: '--font-modak',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.killaplayground.games';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Killa Playground | 3D Diwali Mud Fort Diorama Builder',
    template: '%s | Killa Playground',
  },
  description:
    'Interactive 3D browser diorama celebrating the Maharashtrian Diwali folk tradition of building miniature mud forts (Diwali Killa). Sculpt mountain terrain, draw parametric ramparts, place watchtowers and arched gates, lay stone steps and saffron flags, and generate festive posters in honor of Chhatrapati Shivaji Maharaj.',
  keywords: [
    'diwali killa',
    'killa playground',
    'किल्ला प्लेग्राउंड',
    'killa making',
    'diwali fort',
    'miniature mud fort',
    'maratha forts',
    'chhatrapati shivaji maharaj',
    'raigad fort',
    'murud janjira',
    'sinhagad fort',
    '3d diorama',
    'diwali 3d sandbox',
    'online killa builder',
    'maharashtrian diwali tradition',
    'tatbandi',
    'buruj',
    'maha darwaza',
    'tambdi maati',
    'saffron flag',
    'bhagwa dhwaj',
  ],
  authors: [{ name: 'Killa Playground Team' }],
  creator: 'Killa Playground',
  publisher: 'Killa Playground',
  category: 'Design & Creative 3D Sandbox',
  applicationName: 'Killa Playground',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/?lang=en',
      'mr-IN': '/?lang=mr',
      'hi-IN': '/?lang=hi',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['mr_IN', 'hi_IN'],
    url: '/',
    siteName: 'Killa Playground | किल्ला प्लेग्राउंड',
    title: 'Killa Playground | 3D Diwali Mud Fort Diorama Builder',
    description:
      'Build, sculpt, and paint traditional Diwali mud forts in 3D right in your browser. Place watchtowers, bastions, gates, stone steps, and festive diyas in honor of Chhatrapati Shivaji Maharaj.',
    images: [
      {
        url: '/killaplayground-logo-light.png',
        width: 1200,
        height: 630,
        alt: 'Killa Playground 3D Fort Diorama',
      },
      {
        url: '/killaplayground-tranparent.png',
        width: 1254,
        height: 1254,
        alt: 'The Killa Playground Fort Emblem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Killa Playground | 3D Diwali Mud Fort Diorama Builder',
    description:
      'Craft, sculpt, and paint your own traditional Diwali mud fort in 3D right in your browser.',
    creator: '@killaplayground',
    images: ['/killaplayground-logo-light.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      {
        url: '/killaplayground-favicon-dark.png',
        sizes: '2000x2000',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/killaplayground-favicon-light.png',
        sizes: '2000x2000',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Killa Playground',
  alternateName: 'किल्ला प्लेग्राउंड',
  url: siteUrl,
  image: `${siteUrl}/killaplayground-tranparent.png`,
  logo: `${siteUrl}/killaplayground-tranparent.png`,
  description:
    'Interactive 3D browser diorama celebrating the Maharashtrian Diwali folk tradition of building miniature mud forts (Diwali Killa). Sculpt mountain terrain, draw parametric ramparts, place watchtowers, stone steps, and glowing diyas.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any (Web Browser with WebGL2)',
  browserRequirements: 'Requires WebGL2 and modern browser (Chrome, Edge, Firefox, Safari)',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  author: {
    '@type': 'Organization',
    name: 'Killa Playground',
  },
  inLanguage: ['en', 'mr', 'hi'],
  featureList: [
    '3D Mountain Terrain Sculpting',
    'Parametric Fort Ramparts & Bastions',
    '3D Spline Stone Steps & Saffron Flags',
    'Diwali Night Diya Mode',
    'Automated 4-Angle Festive Poster Studio',
    'Multi-texture PBR retro terrain painting',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${yatraOne.variable} ${modak.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#F9F6F0] text-[#2B1E16] overflow-hidden">
        {children}
      </body>
    </html>
  );
}
