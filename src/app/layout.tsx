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

export const metadata: Metadata = {
  title: 'Killa Playground | किल्ला प्लेग्राउंड',
  description:
    'Interactive 3D browser diorama celebrating the Maharashtrian Diwali custom of crafting miniature mud forts with tactile soil sculpting, hand-painting, and festive poster creation.',
  openGraph: {
    title: 'Killa Playground | किल्ला प्लेग्राउंड',
    description:
      'Craft, sculpt, and paint your own traditional Diwali mud fort in 3D right in your browser.',
    siteName: 'Killa Playground',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${yatraOne.variable} ${modak.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen bg-[#F9F6F0] text-[#2B1E16] overflow-hidden">
        {children}
      </body>
    </html>
  );
}
