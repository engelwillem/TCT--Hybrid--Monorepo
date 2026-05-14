<?php

namespace App\Enums;

enum PostType: string
{
    case MEMBER_POST = 'member_post';
    case USER_POST = 'user_post';
    case REFLECTION = 'reflection';
    case PRAYER_REQUEST = 'prayer_request';
    case QUOTE = 'quote';
    case DISCUSSION_PROMPT = 'discussion_prompt';
    case EDITORIAL = 'editorial';
    case VERSE_REFLECTION = 'verse_reflection';
    case COMMUNITY_HIGHLIGHT = 'community_highlight';
    case IMAGE_POST = 'image_post';
    case TESTIMONY = 'testimony';

    public function label(): string
    {
        return match ($this) {
            self::MEMBER_POST => 'Postingan Member',
            self::USER_POST => 'Public Post',
            self::REFLECTION => 'Refleksi Harian',
            self::PRAYER_REQUEST => 'Permintaan Doa',
            self::QUOTE => 'Kutipan Bijak',
            self::DISCUSSION_PROMPT => 'Diskusi Komunitas',
            self::EDITORIAL => 'Pilihan Editor',
            self::VERSE_REFLECTION => 'Renungan Ayat',
            self::COMMUNITY_HIGHLIGHT => 'Sorotan Komunitas',
            self::IMAGE_POST => 'Kiriman Gambar',
            self::TESTIMONY => 'Kesaksian',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PRAYER_REQUEST => 'rose',
            self::TESTIMONY => 'emerald',
            self::REFLECTION => 'blue',
            self::QUOTE => 'amber',
            default => 'slate',
        };
    }

    /**
     * Define which interactions are allowed for this post type.
     */
    public function allowedInteractions(): array
    {
        return match ($this) {
            self::PRAYER_REQUEST => ['amin', 'comment', 'share'],
            self::VERSE_REFLECTION, self::REFLECTION, self::QUOTE => ['amin', 'comment', 'save', 'share'],
            self::EDITORIAL, self::COMMUNITY_HIGHLIGHT => ['amin', 'share'],
            self::TESTIMONY => ['amin', 'comment', 'share'],
            default => ['amin', 'comment', 'share'],
        };
    }
}
