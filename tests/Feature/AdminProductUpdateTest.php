<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Specification;
use App\Models\SubCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminProductUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup permissions
        Role::firstOrCreate(['name' => 'admin']);
    }

    /** @test */
    public function it_can_update_product_with_string_specification_ids()
    {
        $this->withoutExceptionHandling();
        
        // 1. Create Admin User
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // 2. Create Category and SubCategory
        $category = Category::factory()->create();
        $subCategory = SubCategory::factory()->create(['category_id' => $category->id]);

        // 3. Create Specification for SubCategory
        $specification = Specification::create([
            'sub_category_id' => $subCategory->id,
            'name' => ['en' => 'Color', 'fr' => 'Couleur'],
            'required' => false,
            'values' => [],
        ]);

        // 4. Create Product
        $product = Product::factory()->create([
            'sub_category_id' => $subCategory->id,
            'price' => 100,
            'stock' => 10,
        ]);

        // 5. Prepare Update Data
        // Emulate form data where IDs might be strings
        $updateData = [
            'sub_category_id' => $subCategory->id,
            'name' => ['fr' => 'Updated Product Name'],
            'description' => ['fr' => 'Updated Description'],
            'price' => 200,
            'stock' => 20,
            'status' => 'active',
            'specifications' => [
                [
                    'id' => (string) $specification->id, // Send as string to reproduce bug
                    'value' => 'Red',
                ]
            ],
        ];

        // 6. Act: Send Update Request
        $response = $this->actingAs($admin)
            ->put(route('admin.products.update', $product->id), $updateData);

        // 7. Assertions
        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'price' => 200,
            'stock' => 20,
        ]);

        $this->assertDatabaseHas('product_specification_values', [
            'product_id' => $product->id,
            'specification_id' => $specification->id,
            'value' => 'Red',
        ]);
    }
}
