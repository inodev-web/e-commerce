<?php

namespace Tests\Feature;

use Tests\TestCase;

use Illuminate\Foundation\Testing\RefreshDatabase;

class SimpleTest extends TestCase
{
    use RefreshDatabase;
    /** @test */
    public function it_can_create_roles()
    {
        \Spatie\Permission\Models\Role::create(['name' => 'admin']);
        $this->assertTrue(true);
    }
}
