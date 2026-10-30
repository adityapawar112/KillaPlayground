import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * List of known abusive scrapers, vulnerability scanners, and spam crawlers.
 * Reputable search engines (Google, Bing) and AI systems (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended, etc.) are explicitly permitted.
 */
const BLOCKED_USER_AGENTS = [
  'bytespider',
  'petalbot',
  'scrapy',
  'sqlmap',
  'nikto',
  'zgrab',
  'dirbuster',
  'nmap',
  'masscan',
  'wprecon',
  'mj12bot',
  'dotbot',
  'blexbot',
  'dataforseobot',
  'semrushbot',
  'ahrefsbot',
  'zoominfobot',
];

/**
 * Common probe paths targeted by automated vulnerability and spam bots.
 */
const BLOCKED_PROBE_PREFIXES = [
  '/wp-admin',
  '/wp-login',
  '/xmlrpc.php',
  '/.env',
  '/.git',
  '/phpinfo',
  '/actuator',
  '/.aws',
];

export function middleware(request: NextRequest) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const pathname = request.nextUrl.pathname.toLowerCase();

  // 1. Block known aggressive scrapers and abusive bots
  if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse('Access Denied: Automated scraper or bot blocked.', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // 2. Reject typical exploit / CMS probe URLs immediately
  if (BLOCKED_PROBE_PREFIXES.some((probe) => pathname.startsWith(probe))) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets:
     * - _next/static, _next/image
     * - favicon.ico
     * - static textures and models
     */
    '/((?!_next/static|_next/image|favicon.ico|textures/|models/).*)',
  ],
};

