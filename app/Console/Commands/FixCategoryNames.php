<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Console\Command;

class FixCategoryNames extends Command
{
    protected $signature = 'app:fix-category-names {--model=all : Fix only categories, subcategories, or all}';

    protected $description = 'Fix malformed category and subcategory names in the database';

    public function handle(): int
    {
        $model = $this->option('model');

        if ($model === 'all' || $model === 'categories') {
            $this->fixCategories();
        }

        if ($model === 'all' || $model === 'subcategories') {
            $this->fixSubCategories();
        }

        $this->info('Category names fixed successfully!');
        return 0;
    }

    private function fixCategories(): void
    {
        $this->info('Fixing categories...');

        $categories = Category::all();
        $fixed = 0;

        foreach ($categories as $category) {
            $name = $category->name;

            // Check if name needs fixing
            if ($name === null || $name === '' || !is_array($name) || empty(array_filter($name))) {
                $this->warn("Fixing category {$category->id}: '{$category->name}'");

                if (!is_array($name)) {
                    $stringValue = (string)($name ?? '');
                    $category->name = [
                        'fr' => $stringValue ?: 'Sans nom',
                        'ar' => 'بدون اسم',
                        'en' => 'No name'
                    ];
                } else {
                    $category->name = [
                        'fr' => $name['fr'] ?? 'Sans nom',
                        'ar' => $name['ar'] ?? 'بدون اسم',
                        'en' => $name['en'] ?? 'No name'
                    ];
                }

                $category->save();
                $fixed++;
            }
        }

        $this->info("Fixed {$fixed} categories");
    }

    private function fixSubCategories(): void
    {
        $this->info('Fixing subcategories...');

        $subCategories = SubCategory::all();
        $fixed = 0;

        foreach ($subCategories as $subCategory) {
            $name = $subCategory->name;

            // Check if name needs fixing
            if ($name === null || $name === '' || !is_array($name) || empty(array_filter($name))) {
                $this->warn("Fixing subcategory {$subCategory->id}: '{$subCategory->name}'");

                if (!is_array($name)) {
                    $stringValue = (string)($name ?? '');
                    $subCategory->name = [
                        'fr' => $stringValue ?: 'Sans nom',
                        'ar' => 'بدون اسم',
                        'en' => 'No name'
                    ];
                } else {
                    $subCategory->name = [
                        'fr' => $name['fr'] ?? 'Sans nom',
                        'ar' => $name['ar'] ?? 'بدون اسم',
                        'en' => $name['en'] ?? 'No name'
                    ];
                }

                $subCategory->save();
                $fixed++;
            }
        }

        $this->info("Fixed {$fixed} subcategories");
    }
}
