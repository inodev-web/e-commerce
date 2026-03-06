<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\SubCategory;
use App\Enums\ProductStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SearchTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create a Pharmacy Category
        $pharmacyCategory = Category::create([
            'name' => [
                'fr' => 'Pharmacie & Santé',
                'ar' => 'صيدلية وصحة',
            ],
            'active' => true,
        ]);

        // Subcategory: Médicaments
        $medsSubCategory = SubCategory::create([
            'category_id' => $pharmacyCategory->id,
            'name' => [
                'fr' => 'Médicaments',
                'ar' => 'أدوية',
            ],
            'active' => true,
        ]);

        // Products for Médicaments
        Product::create([
            'sub_category_id' => $medsSubCategory->id,
            'name' => [
                'fr' => 'Doliprane 1000mg Comprimés',
                'ar' => 'دوليبران 1000 ملغ أقراص',
            ],
            'description' => [
                'fr' => 'Paracétamol pour le soulagement de la douleur et de la fièvre.',
                'ar' => 'باراسيتامول لتخفيف الألم والحمى.',
            ],
            'price' => 250.00,
            'stock' => 100,
            'status' => ProductStatus::ACTIF,
            'free_shipping' => false,
        ]);

        Product::create([
            'sub_category_id' => $medsSubCategory->id,
            'name' => [
                'fr' => 'Smecta poudre pour suspension buvable',
                'ar' => 'سميكتا مسحوق لمعلق للشرب',
            ],
            'description' => [
                'fr' => 'Traitement des diarrhées aiguës.',
                'ar' => 'علاج الإسهال الحاد.',
            ],
            'price' => 350.00,
            'stock' => 50,
            'status' => ProductStatus::ACTIF,
            'free_shipping' => false,
        ]);

        // Subcategory: Premiers Secours
        $firstAidSubCategory = SubCategory::create([
            'category_id' => $pharmacyCategory->id,
            'name' => [
                'fr' => 'Premiers Secours',
                'ar' => 'الإسعافات الأولية',
            ],
            'active' => true,
        ]);

        // Products for Premiers Secours
        Product::create([
            'sub_category_id' => $firstAidSubCategory->id,
            'name' => [
                'fr' => 'Pansements Urgo Résistants',
                'ar' => 'ضمادات أورغو مقاومة',
            ],
            'description' => [
                'fr' => 'Boîte de 20 pansements imperméables et résistants.',
                'ar' => 'علبة بـ 20 ضمادة مقاومة للماء وقوية.',
            ],
            'price' => 450.00,
            'stock' => 200,
            'status' => ProductStatus::ACTIF,
            'free_shipping' => false,
        ]);

        Product::create([
            'sub_category_id' => $firstAidSubCategory->id,
            'name' => [
                'fr' => 'Bétadine Dermique 10%',
                'ar' => 'بيتادين جلدي 10%',
            ],
            'description' => [
                'fr' => 'Antiseptique local pour le traitement des plaies.',
                'ar' => 'مطهر موضعي لعلاج الجروح.',
            ],
            'price' => 600.00,
            'stock' => 80,
            'status' => ProductStatus::ACTIF,
            'free_shipping' => false,
        ]);


        // 2. Create a Parapharmacy Category
        $parapharmacyCategory = Category::create([
            'name' => [
                'fr' => 'Parapharmacie',
                'ar' => 'شبه صيدلية',
            ],
            'active' => true,
        ]);

        // Subcategory: Compléments Alimentaires
        $supplementsSubCategory = SubCategory::create([
            'category_id' => $parapharmacyCategory->id,
            'name' => [
                'fr' => 'Compléments Alimentaires Test',
                'ar' => 'مكملات غذائية اختبار',
            ],
            'active' => true,
        ]);

        // Products for Compléments Alimentaires
        Product::create([
            'sub_category_id' => $supplementsSubCategory->id,
            'name' => [
                'fr' => 'Magnésium Marin B6 Juvamine',
                'ar' => 'مغنيسيوم بحري ب6 جوفامين',
            ],
            'description' => [
                'fr' => 'Complément pour réduire la fatigue, contient du magnésium marin et de la vitamine B6.',
                'ar' => 'مكمل لتقليل التعب، يحتوي على مغنيسيوم بحري وفيتامين ب6.',
            ],
            'price' => 1200.00,
            'stock' => 40,
            'status' => ProductStatus::ACTIF,
            'free_shipping' => true,
        ]);

        Product::create([
            'sub_category_id' => $supplementsSubCategory->id,
            'name' => [
                'fr' => 'Vitamine C 1000mg Effervescente',
                'ar' => 'فيتامين سي 1000 ملغ فوار',
            ],
            'description' => [
                'fr' => 'Pour un coup de boost immédiat. Arôme orange.',
                'ar' => 'للحصول على دفعة فورية. نكهة البرتقال.',
            ],
            'price' => 800.00,
            'stock' => 150,
            'status' => ProductStatus::ACTIF,
            'free_shipping' => false,
        ]);

        // Subcategory: Dermo-Cosmétique
        $dermoSubCategory = SubCategory::create([
            'category_id' => $parapharmacyCategory->id,
            'name' => [
                'fr' => 'Dermo-Cosmétique',
                'ar' => 'مستحضرات التجميل الجلدية',
            ],
            'active' => true,
        ]);

        // Products for Dermo-Cosmétique
        Product::create([
            'sub_category_id' => $dermoSubCategory->id,
            'name' => [
                'fr' => 'Cerave Crème Hydratante Visage & Corps',
                'ar' => 'سيرافي كريم مرطب للوجه والجسم',
            ],
            'description' => [
                'fr' => 'Crème hydratante riche pour les peaux sèches avec Acide Hyaluronique.',
                'ar' => 'كريم مرطب غني للبشرة الجافة مع حمض الهيالورونيك.',
            ],
            'price' => 3500.00,
            'stock' => 30,
            'status' => ProductStatus::ACTIF,
            'free_shipping' => true,
        ]);

        Product::create([
            'sub_category_id' => $dermoSubCategory->id,
            'name' => [
                'fr' => 'Bioderma Sensibio H2O Eau Micellaire',
                'ar' => 'بيوديرما سينسيبيو ماء ميسيلار',
            ],
            'description' => [
                'fr' => 'Eau micellaire démaquillante apaisante pour peaux sensibles.',
                'ar' => 'ماء ميسيلار مزيل للمكياج مهدئ للبشرة الحساسة.',
            ],
            'price' => 2800.00,
            'stock' => 60,
            'status' => ProductStatus::ACTIF,
            'free_shipping' => false,
        ]);
        
        $this->command->info('Search test pharmaceutical data seeded successfully!');
    }
}
