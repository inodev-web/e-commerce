<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Specification;
use App\Models\Product;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('backfill:translations', function () {
    $updated = 0;

    Category::all()->each(function (Category $category) use (&$updated) {
        if (empty($category->getTranslations('name'))) {
            $category->update([
                'name' => [
                    'fr' => "Catégorie #{$category->id}",
                    'ar' => '',
                ],
            ]);
            $updated++;
        }
    });

    SubCategory::all()->each(function (SubCategory $subCategory) use (&$updated) {
        if (empty($subCategory->getTranslations('name'))) {
            $subCategory->update([
                'name' => [
                    'fr' => "Sous-catégorie #{$subCategory->id}",
                    'ar' => '',
                ],
            ]);
            $updated++;
        }
    });

    Specification::all()->each(function (Specification $specification) use (&$updated) {
        if (empty($specification->getTranslations('name'))) {
            $specification->update([
                'name' => [
                    'fr' => "Spécification #{$specification->id}",
                    'ar' => '',
                ],
            ]);
            $updated++;
        }
    });

    Product::all()->each(function (Product $product) use (&$updated) {
        if (empty($product->getTranslations('name'))) {
            $product->update([
                'name' => [
                    'fr' => "Produit #{$product->id}",
                    'ar' => '',
                ],
                'description' => empty($product->getTranslations('description'))
                    ? ['fr' => '', 'ar' => '']
                    : $product->getTranslations('description'),
            ]);
            $updated++;
        }
    });

    $this->info("Backfill terminé. Enregistrements mis à jour: {$updated}");
})->purpose('Backfill empty translation fields for categories, subcategories, specifications, and products');
