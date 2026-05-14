<?php

namespace Database\Factories;

use App\Models\MemberPost;
use App\Models\MemberPostComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MemberPostCommentFactory extends Factory
{
    protected $model = MemberPostComment::class;

    public function definition(): array
    {
        return [
            'member_post_id' => MemberPost::factory(),
            'user_id' => User::factory(),
            'text' => $this->faker->randomElement([
                'Amin! Terima kasih atas renungannya.',
                'Sangat memberkati, izin membagikan ya.',
                'Saya doakan juga ya, tetap kuat!',
                'Setuju sekali dengan poin ini.',
                'Sungguh luar biasa kebaikan Tuhan.',
            ]),
            'created_at' => now()->subMinutes(rand(1, 1440)),
        ];
    }
}
