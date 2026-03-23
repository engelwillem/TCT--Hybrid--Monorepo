import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  PRIMARY_HOST,
  PRIMARY_SITE_URL,
  getNormalizedHost,
  isLocalHost,
  isNonPrimaryHost,
} from '@/lib/seo';

const NOINDEX_HEADER = 'noindex, nofollow, noarchive';
const STAGING_ROBOTS = 'User-agent: *\nDisallow: /\n';
const STAGING_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n`;

function buildPrimaryRedirect(request: NextRequest): NextResponse {
  const target = new URL(request.url);
  target.protocol = 'https:';
  target.host = PRIMARY_HOST;

  return NextResponse.redirect(target, 308);
}

export function middleware(request: NextRequest) {
  const hostHeader = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const normalizedHost = getNormalizedHost(hostHeader);
  const { pathname } = request.nextUrl;

  if (normalizedHost === 'thechoosentalks.org') {
    return buildPrimaryRedirect(request);
  }

  if (!normalizedHost || isLocalHost(normalizedHost)) {
    return NextResponse.next();
  }

  if (isNonPrimaryHost(normalizedHost)) {
    if (pathname === '/robots.txt') {
      return new NextResponse(STAGING_ROBOTS, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Robots-Tag': NOINDEX_HEADER,
        },
      });
    }

    if (pathname === '/sitemap.xml') {
      return new NextResponse(STAGING_SITEMAP, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'X-Robots-Tag': NOINDEX_HEADER,
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', NOINDEX_HEADER);
    response.headers.set('Link', `<${PRIMARY_SITE_URL}${pathname}>; rel="canonical"`);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|avif|ico|svg|css|js|map)$).*)',
  ],
};
