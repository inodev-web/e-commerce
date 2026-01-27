<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer l'admin s'il n'existe pas déjà
        if (!User::where('phone', '0000000000')->exists()) {
            $admin = User::create([
                'phone' => '0540225128',
                'password' => Hash::make('password'), // Mot de passe par défaut sécurisé en prod
                'role' => 'admin',
                'status' => 'active', // Assurez-vous que UserStatus::ACTIVE correspond à 'active' ou utilisez l'enum
            ]);
            
            // Si vous utilisez Spatie Laravel Permission
            // $admin->assignRole('admin'); 
        }
    }
}
