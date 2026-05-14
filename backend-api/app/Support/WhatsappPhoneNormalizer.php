<?php

namespace App\Support;

class WhatsappPhoneNormalizer
{
    public static function normalize(string $rawPhone, ?string $defaultCountryCode = null): ?string
    {
        $value = trim($rawPhone);
        if ($value === '') {
            return null;
        }

        if (preg_match('/[A-Za-z]/', $value)) {
            return null;
        }

        if (! preg_match('/^[0-9+\s\-\(\)]+$/', $value)) {
            return null;
        }

        if (substr_count($value, '+') > 1) {
            return null;
        }

        if (str_contains($value, '+') && ! str_starts_with($value, '+')) {
            return null;
        }

        $compact = preg_replace('/[\s\-\(\)]/', '', $value) ?? '';
        if ($compact === '') {
            return null;
        }

        $explicitPlus = str_starts_with($compact, '+');
        if ($explicitPlus) {
            $compact = substr($compact, 1);
        }

        if (! preg_match('/^\d+$/', $compact)) {
            return null;
        }

        if (str_starts_with($compact, '00')) {
            $compact = ltrim(substr($compact, 2), '0');
        } elseif (! $explicitPlus && str_starts_with($compact, '0')) {
            $local = ltrim($compact, '0');
            if ($local === '') {
                return null;
            }
            $countryCode = self::normalizeCountryCode($defaultCountryCode);
            $compact = $countryCode.$local;
        }

        if ($compact === '' || str_starts_with($compact, '0')) {
            return null;
        }

        $len = strlen($compact);
        if ($len < 8 || $len > 15) {
            return null;
        }

        return $compact;
    }

    private static function normalizeCountryCode(?string $countryCode): string
    {
        $digits = preg_replace('/\D+/', '', (string) $countryCode) ?? '';
        $digits = ltrim($digits, '0');

        return $digits !== '' ? $digits : '62';
    }
}

