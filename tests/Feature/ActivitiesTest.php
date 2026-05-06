<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivitiesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login()
    {
        $this->get(route('activities.index'))->assertRedirect(route('login'));
    }

    public function test_non_admin_users_cannot_access_activities()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->get(route('activities.index'))->assertStatus(403);
    }

    public function test_admin_users_can_access_activities_index()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $this->get(route('activities.index'))->assertOk();
    }

    public function test_admin_can_view_activity_details()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $activity = ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'visitor_created',
            'data' => ['visitor_name' => 'João Silva'],
        ]);

        $this->actingAs($admin);

        $this->get(route('activities.show', $activity))->assertOk();
    }

    public function test_activity_shows_user_who_performed_action()
    {
        $admin = User::factory()->create(['role' => 'admin', 'name' => 'Maria Admin']);
        $activity = ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'visitor_created',
            'data' => ['visitor_name' => 'João Silva'],
        ]);

        $this->actingAs($admin);

        $response = $this->get(route('activities.show', $activity));
        $response->assertSee('Maria Admin');
    }

    public function test_activities_index_shows_user_name_in_description()
    {
        $admin = User::factory()->create(['role' => 'admin', 'name' => 'João Manager']);
        $activity = ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'visitor_created',
            'data' => ['visitor_name' => 'Visitante Teste'],
        ]);

        $this->actingAs($admin);

        $response = $this->get(route('activities.index'));
        $response->assertSee('João Manager');
    }
}