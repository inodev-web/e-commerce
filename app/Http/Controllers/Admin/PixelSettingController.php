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
        $settings = PixelSetting::all();
        
        return Inertia::render('Admin/Settings', [
            'pixelSettings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'pixels' => 'array',
            'pixels.*.platform' => 'required|string',
            'pixels.*.pixel_id' => 'required|string',
            'pixels.*.is_active' => 'boolean',
            'pixels.*.name' => 'nullable|string',
        ]);

        // Clear and re-insert for simplicity (or use upsert)
        PixelSetting::truncate();

        foreach ($request->pixels as $pixelData) {
            PixelSetting::create($pixelData);
        }

        return redirect()->back()->with('success', 'Paramètres des pixels mis à jour.');
    }
}
