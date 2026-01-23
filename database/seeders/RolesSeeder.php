<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    /**
     * Seed des rôles Spatie
     */
    public function run(): void
    {
        // Créer les rôles
        $admin = Role::create(['name' => 'admin']);
        $client = Role::create(['name' => 'client']);

        // Créer les permissions
        $permissions = [
            // Products
            'manage_products',
            'view_products',
            
            // Orders
            'manage_orders',
            'view_own_orders',
            
            // Users/Clients
            'manage_users',
            
            // Delivery
            'manage_delivery_tariffs',
            
            // Statistics
            'view_dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Attribuer les permissions
        $admin->givePermissionTo([
            'manage_products',
            'view_products',
            'manage_orders',
            'manage_users',
            'manage_delivery_tariffs',
            'view_dashboard',
        ]);

        $client->givePermissionTo([
            'view_products',
            'view_own_orders',
        ]);
    }
}
