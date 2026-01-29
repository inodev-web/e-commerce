<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PixelSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PixelSettingController extends Controller
{
    public function show()
    {
        $settings = PixelSetting::first();

        // If no settings exist, return default structure (or mock it in frontend, but better here)
        // Or create one effectively if singleton?
        // Let's just return what we have (null is fine, frontend handles it)
        
        return Inertia::render('Admin/Settings', [
            'pixelSettings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'meta_pixel_id' => 'nullable|string|max:50',
            'google_pixel_id' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $settings = PixelSetting::first();

        if ($settings) {
            $settings->update($validated);
        } else {
            PixelSetting::create($validated);
        }

        return redirect()->back()->with('success', 'Paramètres mis à jour.');
    }
}
