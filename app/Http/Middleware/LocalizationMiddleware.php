<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class LocalizationMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->determineLocale($request);
        
        // Set application locale
        App::setLocale($locale);
        
        // Store in session for persistence only if changed
        if (Session::get('locale') !== $locale) {
            Session::put('locale', $locale);
        }
        
        $response = $next($request);
        
        // Persist to cookie (30 days) if changed
        if ($locale && $request->cookie('locale') !== $locale) {
            $response->withCookie(cookie('locale', $locale, 60 * 24 * 30));
        }

        return $response;
    }
    
    /**
     * Determine the locale from request
     */
    protected function determineLocale(Request $request): string
    {
        $availableLocales = config('app.available_locales', ['fr', 'ar']);
        $fallbackLocale = config('app.fallback_locale', 'fr');
        
        // Priority 1: Query parameter
        if ($request->has('lang') && in_array($request->query('lang'), $availableLocales)) {
            return $request->query('lang');
        }
        
        // Priority 2: Session
        if (Session::has('locale') && in_array(Session::get('locale'), $availableLocales)) {
            return Session::get('locale');
        }
        
        // Priority 3: Cookie
        if ($request->hasCookie('locale') && in_array($request->cookie('locale'), $availableLocales)) {
            return $request->cookie('locale');
        }
        
        // Priority 4: Accept-Language header
        $headerLocale = $request->getPreferredLanguage($availableLocales);
        if ($headerLocale && in_array($headerLocale, $availableLocales)) {
            return $headerLocale;
        }
        
        // Fallback
        return $fallbackLocale;
    }
}
