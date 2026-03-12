<?php

namespace Database\Factories;

use App\Enums\ChannelType;
use App\Models\Channel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ChannelFactory extends Factory
{
    protected $model = Channel::class;

    public function definition(): array
    {
        $title = $this->faker->unique()->words(2, true);
        return [
            'slug' => Str::slug($title),
            'title' => ucfirst($title),
            'description' => $this->faker->sentence(),
            'type' => ChannelType::PUBLIC ,
            'cover_image_url' => $this->faker->imageUrl(),
        ];
    }
}
