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
        $phone = '0540225128';
        
        // Créer l'admin s'il n'existe pas déjà
        if (!User::where('phone', $phone)->exists()) {
            try {
                $admin = User::create([
                    'phone' => $phone,
                    'password' => Hash::make('password'),
                    'role' => 'admin',
                    'status' => 'active',
                ]);
                $this->command->info("Admin user created: {$phone}");
            } catch (\Exception $e) {
                $this->command->error("Failed to create admin user: " . $e->getMessage());
                throw $e;
            }
        } else {
            $this->command->info("Admin user already exists: {$phone}");
        }
    }
}
