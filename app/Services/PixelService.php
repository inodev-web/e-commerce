<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\PixelSetting;
use Illuminate\Support\Facades\Log;

class PixelService
{
    /**
     * Track a purchase event
     */
    public function trackPurchase(Order $order): void
    {
        $settings = PixelSetting::where('is_active', true)->first();

        if (!$settings) {
            return;
        }

        // Simuler le tracking (Log pour l'instant, pourrait être une queue vers Facebook/Google API)
        if ($settings->meta_pixel_id) {
            Log::info("Pixel: Tracking Meta Purchase for Order #{$order->id}", [
                'pixel_id' => $settings->meta_pixel_id,
                'value' => $order->total_price,
                'currency' => 'DZD',
            ]);
        }

        if ($settings->google_pixel_id) {
            Log::info("Pixel: Tracking Google Purchase for Order #{$order->id}", [
                'pixel_id' => $settings->google_pixel_id,
                'value' => $order->total_price,
                'currency' => 'DZD',
            ]);
        }
    }
}
