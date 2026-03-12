<?php

namespace Database\Factories;

use App\Enums\PostType;
use App\Models\MemberPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MemberPostFactory extends Factory
{
    protected $model = MemberPost::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => PostType::USER_POST,
            'title' => $this->faker->sentence(3),
            'text' => $this->faker->paragraph(),
            'created_at' => now()->subHours(rand(0, 168)),
        ];
    }

    /**
     * Indicate that the post is a spiritual reflection.
     */
    public function reflection(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => PostType::REFLECTION,
            'title' => 'Renungan: ' . $this->faker->word(),
            'text' => 'Hari ini saya merenungkan ayat ' . $this->faker->randomElement(['Mazmur 23', 'Filipi 4:13', 'Yohanes 3:16']) . '. ' . $this->faker->paragraph(),
        ]);
    }

    /**
     * Indicate that the post is a prayer request.
     */
    public function prayerRequest(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => PostType::PRAYER_REQUEST,
            'title' => 'Mohon Dukungan Doa',
            'text' => $this->faker->randomElement([
                'Mohon doakan kesehatan orang tua saya yang sedang sakit.',
                'Tolong doakan pergumulan pekerjaan saya ke depan.',
                'Doakan untuk kedamaian hati dalam menghadapi ujian kehidupan minggu ini.',
            ]),
            'expires_at' => now()->addDays(7),
        ]);
    }

    /**
     * Indicate that the post is an inspirational quote.
     */
    public function quote(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => PostType::QUOTE,
            'text' => '"' . $this->faker->randomElement([
                'Tuhan tidak pernah menjanjikan jalan yang rata, tapi Dia menjanjikan kekuatan.',
                'Iman adalah percaya pada apa yang belum kita lihat.',
                'Tetaplah berdoa, karena doa mengubah segalanya.',
            ]) . '"',
        ]);
    }

    /**
     * Indicate that the post is a community discussion prompt.
     */
    public function discussion(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => PostType::DISCUSSION_PROMPT,
            'title' => 'Diskusi: ' . $this->faker->sentence(),
            'text' => 'Menurut teman-teman, bagaimana cara kita tetap setia di tengah kesibukan dunia?',
        ]);
    }
}
