import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Killa Playground | 3D Diwali Mud Fort Diorama Builder',
    short_name: 'Killa Playground',
    description:
      'Interactive 3D browser diorama celebrating the Maharashtrian Diwali folk tradition of building miniature mud forts (Diwali Killa).',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9F6F0',
    theme_color: '#B85F45',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/killaplayground-tranparent.png',
        sizes: '1254x1254',
        type: 'image/png',
      },
    ],
  };
}

