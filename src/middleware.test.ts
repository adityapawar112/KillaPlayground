import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

describe('Edge Security & Bot Protection Middleware', () => {
  it('allows legitimate human browser traffic', () => {
    const req = new NextRequest('https://www.killaplayground.games/', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const res = middleware(req);
    // NextResponse.next() returns status 200 / continues chain
    expect(res.status).toBe(200);
  });

  it('allows reputable LLMs and search engines', () => {
    const reputableBots = [
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
      'ClaudeBot/1.0 (+https://www.anthropic.com/claudebot)',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
      'Google-Extended',
    ];

    for (const bot of reputableBots) {
      const req = new NextRequest('https://www.killaplayground.games/llms.txt', {
        headers: { 'user-agent': bot },
      });
      const res = middleware(req);
      expect(res.status).toBe(200);
    }
  });

  it('blocks known aggressive scrapers and spam bots with 403 Forbidden', () => {
    const aggressiveBots = [
      'Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)',
      'PetalBot',
      'Scrapy/2.11.0 (+https://scrapy.org)',
      'sqlmap/1.7#stable',
      'Nikto/2.1.6',
      'Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot)',
    ];

    for (const bot of aggressiveBots) {
      const req = new NextRequest('https://www.killaplayground.games/', {
        headers: { 'user-agent': bot },
      });
      const res = middleware(req);
      expect(res.status).toBe(403);
    }
  });

  it('blocks vulnerability and CMS exploit probe paths with 404 Not Found', () => {
    const probeUrls = [
      'https://www.killaplayground.games/wp-admin',
      'https://www.killaplayground.games/wp-login.php',
      'https://www.killaplayground.games/.env',
      'https://www.killaplayground.games/.git/config',
      'https://www.killaplayground.games/xmlrpc.php',
    ];

    for (const url of probeUrls) {
      const req = new NextRequest(url);
      const res = middleware(req);
      expect(res.status).toBe(404);
    }
  });
});

