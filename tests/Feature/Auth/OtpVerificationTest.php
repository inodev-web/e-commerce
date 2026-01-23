<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\SmsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class OtpVerificationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_generates_and_stores_otp_correctly()
    {
        $user = User::factory()->create();
        
        // Mock the Log to verify SMS sending
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message) use ($user) {
                return str_contains($message, "SMS to {$user->phone}");
            });

        $smsService = app(SmsService::class);
        $smsService->sendOtp($user);

        $user->refresh();
        
        $this->assertNotNull($user->otp_code);
        $this->assertEquals(6, strlen($user->otp_code));
        
        // Verify code is numeric
        $this->assertTrue(is_numeric($user->otp_code));
    }

    #[Test]
    public function it_prevents_sending_sms_too_frequently()
    {
        $user = User::factory()->create();
        $smsService = app(SmsService::class);

        // First send should work
        $smsService->sendOtp($user);

        // Second send within 2 minutes should fail
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Veuillez attendre 2 minutes avant de renvoyer un SMS.");

        $smsService->sendOtp($user);
    }

    #[Test]
    public function it_allows_sending_sms_after_rate_limit_expires()
    {
        $user = User::factory()->create();
        $smsService = app(SmsService::class);

        $smsService->sendOtp($user);
        
        // Simulate time passing (clearing cache)
        Cache::forget('sms_otp_rate_limit:' . $user->id);

        // Should successfully send again
        try {
            $smsService->sendOtp($user);
            $this->assertTrue(true);
        } catch (\Exception $e) {
            $this->fail("Should verify rate limit expiration: " . $e->getMessage());
        }
    }

    #[Test]
    public function it_verifies_valid_otp_correctly()
    {
        $user = User::factory()->create();
        $smsService = app(SmsService::class);
        
        // Manually set OTP to avoid rate limits / mocking
        $user->otp_code = '123456';
        $user->save();

        $result = $smsService->verifyOtp($user, '123456');

        $this->assertTrue($result);
        $this->assertNotNull($user->phone_verified_at);
        $this->assertNull($user->otp_code); // Code should be cleared
    }

    #[Test]
    public function it_rejects_invalid_otp()
    {
        $user = User::factory()->create();
        $smsService = app(SmsService::class);
        
        $user->otp_code = '123456';
        $user->save();

        $result = $smsService->verifyOtp($user, '654321');

        $this->assertFalse($result);
        $this->assertNull($user->phone_verified_at);
        $this->assertEquals('123456', $user->otp_code); // Code should remain
    }
}
