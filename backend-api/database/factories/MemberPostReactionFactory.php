<?php

namespace Database\Factories;

use App\Enums\ReactionType;
use App\Models\MemberPost;
use App\Models\MemberPostReaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MemberPostReactionFactory extends Factory
{
    protected $model = MemberPostReaction::class;

    public function definition(): array
    {
        return [
            'member_post_id' => MemberPost::factory(),
            'user_id' => User::factory(),
            'type' => $this->faker->randomElement(ReactionType::cases()),
        ];
    }
}
