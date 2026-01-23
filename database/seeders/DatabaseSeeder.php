<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Système de localisation complet depuis GitHub
        // Import des 58 wilayas + ~1500 communes + tarifs par défaut
        $this->call(AlgeriaCitiesSeeder::class);
        
        // 2. Rôles et permissions Spatie
        $this->call(RolesSeeder::class);
    }
}
