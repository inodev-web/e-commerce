<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Product;

class MultiLanguageTestSeeder extends Seeder
{
    public function run(): void
    {
        // Create a test category
        $category = Category::create([
            'name' => [
                'fr' => 'Soins de la Peau',
                'ar' => 'العناية بالبشرة'
            ],
            'active' => true
        ]);

        // Create a subcategory
        $subCategory = SubCategory::create([
            'category_id' => $category->id,
            'name' => [
                'fr' => 'Crèmes Hydratantes',
                'ar' => 'كريمات مرطبة'
            ],
            'active' => true
        ]);

        // Create test products
        $products = [
            [
                'name' => [
                    'fr' => 'Crème Hydratante Puréva - Peaux Sensibles',
                    'ar' => 'كريم بوريفا المرطب - للبشرة الحساسة'
                ],
                'description' => [
                    'fr' => 'Une crème hydratante douce spécialement formulée pour les peaux sensibles. Enrichie en ingrédients naturels.',
                    'ar' => 'كريم مرطب لطيف مصمم خصيصًا للبشرة الحساسة. غني بالمكونات الطبيعية.'
                ],
                'price' => 2500,
                'stock' => 100
            ],
            [
                'name' => [
                    'fr' => 'Sérum Anti-Âge Puréva',
                    'ar' => 'سيروم بوريفا المضاد للشيخوخة'
                ],
                'description' => [
                    'fr' => 'Sérum concentré qui aide à réduire les signes du vieillissement. Résultats visibles en 4 semaines.',
                    'ar' => 'سيروم مركز يساعد على تقليل علامات الشيخوخة. نتائج ملحوظة خلال 4 أسابيع.'
                ],
                'price' => 3500,
                'stock' => 75
            ],
            [
                'name' => [
                    'fr' => 'Masque Purifiant Puréva',
                    'ar' => 'قناع بوريفا المنقي'
                ],
                'description' => [
                    'fr' => 'Masque à l\'argile qui purifie en profondeur et affine le grain de peau.',
                    'ar' => 'قناع بالطين ينظف بعمق ويحسن ملمس البشرة.'
                ],
                'price' => 1800,
                'stock' => 150
            ]
        ];

        foreach ($products as $productData) {
            Product::create([
                'sub_category_id' => $subCategory->id,
                'name' => $productData['name'],
                'description' => $productData['description'],
                'price' => $productData['price'],
                'stock' => $productData['stock'],
                'status' => 'ACTIF'
            ]);
        }
    }
}
