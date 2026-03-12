<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds baseline security headers.
 *
 * Prefer setting these at the edge (Nginx/Apache/CDN) when possible,
 * but having app-level defaults helps ensure consistency across hosts.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Prevent MIME sniffing.
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Clickjacking protection.
        // If you need embeds, switch to a CSP frame-ancestors policy instead.
        $response->headers->set('X-Frame-Options', 'DENY');

        // Reduce referrer leakage.
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy (formerly Feature Policy).
        // Keep conservative defaults; allow only what is needed.
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
        );

        // HSTS: enable only in production and only when behind HTTPS.
        // For cPanel/Apache, ensure HTTPS is correctly configured first.
        if (app()->environment('production')) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // Minimal CSP to reduce XSS risk while keeping the app functional.
        // NOTE: You may need to adjust if you embed external scripts/styles.
        if (! $response->headers->has('Content-Security-Policy')) {
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self';"
            );
        }

        return $response;
    }
}
