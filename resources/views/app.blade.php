<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Puréva Pharma') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead

        @php
            $pixelsByPlatform = \App\Models\PixelSetting::getActiveGrouped();
        @endphp

        @if(!empty($pixelsByPlatform))
            {{-- Facebook Pixel --}}
            @if(!empty($pixelsByPlatform['facebook']))
            <script>
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                @foreach($pixelsByPlatform['facebook'] as $id)
                    fbq('init', '{{ $id }}');
                @endforeach
                fbq('track', 'PageView');
            </script>
            @foreach($pixelsByPlatform['facebook'] as $id)
                <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id={{ $id }}&ev=PageView&noscript=1"/></noscript>
            @endforeach
            @endif

            {{-- TikTok Pixel --}}
            @if(!empty($pixelsByPlatform['tiktok']))
            <script>
                !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","trackV2","trackSingleV2","identifyV2"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n;var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                    @foreach($pixelsByPlatform['tiktok'] as $id)
                        ttq.load('{{ $id }}');
                    @endforeach
                    ttq.page();
                }(window, document, 'ttq');
            </script>
            @endif

            {{-- Snapchat Pixel --}}
            @if(!empty($pixelsByPlatform['snapchat']))
            <script>
                (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s="script";r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,"https://sc-static.net/scevent.min.js");
                @foreach($pixelsByPlatform['snapchat'] as $id)
                    snaptr('init', '{{ $id }}');
                @endforeach
            </script>
            @endif

            {{-- Google Analytics --}}
            @if(!empty($pixelsByPlatform['google']))
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $pixelsByPlatform['google'][0] }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                @foreach($pixelsByPlatform['google'] as $id)
                    gtag('config', '{{ $id }}');
                @endforeach
            </script>
            @endif
        @endif
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
