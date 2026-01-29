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
        
        // Store in session for persistence
        Session::put('locale', $locale);
        
        return $next($request);
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
        
        // Priority 3: Accept-Language header
        $headerLocale = $request->getPreferredLanguage($availableLocales);
        if ($headerLocale && in_array($headerLocale, $availableLocales)) {
            return $headerLocale;
        }
        
        // Fallback
        return $fallbackLocale;
    }
}
