<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\DeliveryType;
use App\Models\Commune;
use App\Models\DeliveryTariff;
use App\Models\Wilaya;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AlgeriaCitiesSeeder extends Seeder
{
    /**
     * URL du fichier source GitHub (raw content)
     */
    private const GITHUB_SOURCE_URL = 'https://raw.githubusercontent.com/othmanus/algeria-cities/master/php/algeria_cities.php';

    /**
     * Seed des wilayas et communes depuis GitHub
     */
    public function run(): void
    {
        $this->command->info('🇩🇿 Récupération des données depuis GitHub...');
        
        // Récupérer le contenu du fichier
        $citiesData = $this->fetchCitiesData();
        
        if (empty($citiesData)) {
            $this->command->error('❌ Impossible de récupérer les données depuis GitHub');
            return;
        }
        
        $this->command->info("✅ {$this->count($citiesData)} communes récupérées");
        
        DB::transaction(function () use ($citiesData) {
            // 1. Extraire et insérer les wilayas uniques
            $this->seedWilayas($citiesData);
            
            // 2. Insérer toutes les communes
            $this->seedCommunes($citiesData);
            
            // 3. Créer les entrées par défaut dans delivery_tariffs
            $this->createDefaultDeliveryTariffs();
        });
        
        $this->command->info('✅ Importation terminée avec succès!');
    }

    /**
     * Récupérer les données depuis le fichier local
     */
    private function fetchCitiesData(): array
    {
        $filePath = base_path('algeria_cities.php');
        
        if (!file_exists($filePath)) {
            $this->command->error("❌ Fichier algeria_cities.php introuvable à la racine du projet");
            $this->command->warn('⚠️  Utilisation des données de fallback');
            return $this->getFallbackData();
        }
        
        try {
            $this->command->info("📂 Chargement depuis: {$filePath}");
            
            // Charger directement le fichier PHP
            $cities = require $filePath;
            
            if (!is_array($cities) || empty($cities)) {
                $this->command->error("❌ Le fichier ne contient pas de données valides");
                return $this->getFallbackData();
            }
            
            return $cities;
            
        } catch (\Exception $e) {
            $this->command->error("❌ Erreur lors du chargement: {$e->getMessage()}");
            $this->command->warn('⚠️  Utilisation des données de fallback');
            return $this->getFallbackData();
        }
    }

    /**
     * Seed des wilayas uniques
     */
    private function seedWilayas(array $citiesData): void
    {
        $this->command->info('📍 Insertion des wilayas...');
        
        $wilayasMap = [];
        
        foreach ($citiesData as $city) {
            $code = $city['wilaya_code'];
            
            if (!isset($wilayasMap[$code])) {
                $wilayasMap[$code] = [
                    'code' => $code,
                    'name' => $city['wilaya_name_ascii'],
                    'name_ar' => $city['wilaya_name'],
                    'is_active' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        
        // Insertion par lots pour performance
        $chunks = array_chunk($wilayasMap, 10);
        foreach ($chunks as $chunk) {
            Wilaya::upsert(
                $chunk,
                ['code'], // Unique key
                ['name', 'name_ar', 'is_active', 'updated_at']
            );
        }
        
        $this->command->info("✅ {$this->count($wilayasMap)} wilayas insérées");
    }

    /**
     * Seed des communes
     */
    private function seedCommunes(array $citiesData): void
    {
        $this->command->info('🏘️  Insertion des communes...');
        
        // Récupérer les wilayas avec leur ID
        $wilayas = Wilaya::pluck('id', 'code')->toArray();
        
        $communesData = [];
        
        foreach ($citiesData as $city) {
            $wilayaCode = $city['wilaya_code'];
            
            if (isset($wilayas[$wilayaCode])) {
                $communesData[] = [
                    'wilaya_id' => $wilayas[$wilayaCode],
                    'name' => $city['commune_name_ascii'],
                    'name_ar' => $city['commune_name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        
        // Insertion par lots de 100 pour optimiser
        $chunks = array_chunk($communesData, 100);
        
        foreach ($chunks as $index => $chunk) {
            Commune::insert($chunk);
            $this->command->info("  → Lot " . ($index + 1) . "/" . count($chunks));
        }
        
        $this->command->info("✅ {$this->count($communesData)} communes insérées");
    }

    /**
     * Créer les entrées par défaut dans delivery_tariffs
     */
    private function createDefaultDeliveryTariffs(): void
    {
        $this->command->info('🚚 Création des tarifs de livraison par défaut...');
        
        $wilayas = Wilaya::all();
        $tariffs = [];
        
        foreach ($wilayas as $wilaya) {
            // Tarif DOMICILE par défaut (inactif, à configurer par admin)
            $tariffs[] = [
                'wilaya_id' => $wilaya->id,
                'type' => DeliveryType::DOMICILE->value, // ->value pour chaîne brute
                'price' => 0.00,
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            // Tarif BUREAU par défaut (inactif, à configurer par admin)
            $tariffs[] = [
                'wilaya_id' => $wilaya->id,
                'type' => DeliveryType::BUREAU->value, // ->value pour chaîne brute
                'price' => 0.00,
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        // Insertion par lots avec upsert sur contrainte unique
        $chunks = array_chunk($tariffs, 100);
        foreach ($chunks as $chunk) {
            DeliveryTariff::upsert(
                $chunk,
                ['wilaya_id', 'type'], // Contrainte unique
                ['price', 'is_active', 'updated_at']
            );
        }
        
        $this->command->info("✅ {$this->count($tariffs)} tarifs créés (inactifs, prix = 0)");
        $this->command->warn('⚠️  L\'admin doit configurer les tarifs via l\'interface');
    }

    /**
     * Données de fallback en cas d'échec GitHub (wilayas principales uniquement)
     */
    private function getFallbackData(): array
    {
        // Données minimales pour les 58 wilayas
        return [
            ['wilaya_code' => '01', 'wilaya_name' => 'أدرار', 'wilaya_name_ascii' => 'Adrar', 'commune_name' => 'أدرار', 'commune_name_ascii' => 'Adrar'],
            ['wilaya_code' => '02', 'wilaya_name' => 'الشلف', 'wilaya_name_ascii' => 'Chlef', 'commune_name' => 'الشلف', 'commune_name_ascii' => 'Chlef'],
            ['wilaya_code' => '03', 'wilaya_name' => 'الأغواط', 'wilaya_name_ascii' => 'Laghouat', 'commune_name' => 'الأغواط', 'commune_name_ascii' => 'Laghouat'],
            ['wilaya_code' => '04', 'wilaya_name' => 'أم البواقي', 'wilaya_name_ascii' => 'Oum El Bouaghi', 'commune_name' => 'أم البواقي', 'commune_name_ascii' => 'Oum El Bouaghi'],
            ['wilaya_code' => '05', 'wilaya_name' => 'باتنة', 'wilaya_name_ascii' => 'Batna', 'commune_name' => 'باتنة', 'commune_name_ascii' => 'Batna'],
            ['wilaya_code' => '16', 'wilaya_name' => 'الجزائر', 'wilaya_name_ascii' => 'Alger', 'commune_name' => 'الجزائر الوسطى', 'commune_name_ascii' => 'Alger Centre'],
            ['wilaya_code' => '31', 'wilaya_name' => 'وهران', 'wilaya_name_ascii' => 'Oran', 'commune_name' => 'وهران', 'commune_name_ascii' => 'Oran'],
            // ... (version minimale pour ne pas bloquer)
        ];
    }

    /**
     * Helper pour count compatible avec array
     */
    private function count(array $data): int
    {
        return count($data);
    }
}
