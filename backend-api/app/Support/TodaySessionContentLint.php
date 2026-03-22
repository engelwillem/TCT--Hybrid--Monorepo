<?php

namespace App\Support;

class TodaySessionContentLint
{
    private const CONTRACT_VERSION = 'today.session.v1';

    /**
     * @var array<string, int>
     */
    private const MAX_LENGTHS = [
        'user.name' => 60,
        'user.avatarInitial' => 4,
        'greeting' => 80,
        'dateLabel' => 80,
        'openingLine' => 160,
        'verse.label' => 40,
        'verse.text' => 320,
        'verse.reference' => 80,
        'reflection.prompt' => 220,
        'reflection.placeholder' => 180,
        'reflection.ctaLabel' => 40,
        'reflection.sealedLabel' => 120,
        'prayer.label' => 40,
        'prayer.text' => 420,
        'prayer.ctaLabel' => 40,
        'prayer.completionLabel' => 120,
        'completion.title' => 120,
        'completion.body' => 280,
        'completion.softProgressLabel' => 80,
        'completion.progressValue' => 60,
        'completion.tomorrowCueLabel' => 40,
        'completion.tomorrowCueText' => 160,
    ];

    /**
     * Fields that should be present for stable UX contract.
     *
     * @var string[]
     */
    private const REQUIRED_FIELDS = [
        'contractVersion',
        'user.name',
        'openingLine',
        'verse.label',
        'verse.text',
        'verse.reference',
        'reflection.prompt',
        'reflection.placeholder',
        'reflection.ctaLabel',
        'reflection.sealedLabel',
        'prayer.label',
        'prayer.text',
        'prayer.ctaLabel',
        'prayer.completionLabel',
        'completion.title',
        'completion.body',
        'completion.softProgressLabel',
        'completion.progressValue',
        'completion.tomorrowCueLabel',
        'completion.tomorrowCueText',
    ];

    /**
     * Optional fields that frontend can derive/fallback locally.
     *
     * @var string[]
     */
    private const OPTIONAL_LOCAL_FIELDS = [
        'greeting',
        'dateLabel',
        'user.avatarInitial',
    ];

    /**
     * @param  array<string, mixed>  $payload
     * @return array{
     *     errors: list<string>,
     *     warnings: list<string>,
     *     infos: list<string>,
     *     summary: array{errorCount:int, warningCount:int, infoCount:int}
     * }
     */
    public function lint(array $payload): array
    {
        $errors = [];
        $warnings = [];
        $infos = [];

        foreach (['user', 'verse', 'reflection', 'prayer', 'completion'] as $section) {
            $value = data_get($payload, $section);
            if (! is_array($value)) {
                $errors[] = "Missing or invalid section: {$section} (must be object/array).";
            }
        }

        $contractVersion = data_get($payload, 'contractVersion');
        if (! is_string($contractVersion) || trim($contractVersion) === '') {
            $errors[] = 'Missing required field: contractVersion.';
        } elseif ($contractVersion !== self::CONTRACT_VERSION) {
            $errors[] = "contractVersion mismatch: expected '".self::CONTRACT_VERSION."', got '{$contractVersion}'.";
        }

        foreach (self::REQUIRED_FIELDS as $path) {
            $value = data_get($payload, $path);
            if (! is_string($value) || trim($value) === '') {
                $errors[] = "Missing or empty required field: {$path}.";
            }
        }

        foreach (self::OPTIONAL_LOCAL_FIELDS as $path) {
            $value = data_get($payload, $path);
            if (! is_string($value) || trim($value) === '') {
                $infos[] = "Optional local-derive field not provided: {$path}.";
            }
        }

        foreach (self::MAX_LENGTHS as $path => $maxLength) {
            $value = data_get($payload, $path);
            if (! is_string($value)) {
                continue;
            }

            $length = mb_strlen(trim($value));
            if ($length > $maxLength) {
                $warnings[] = "Field {$path} is too long ({$length}/{$maxLength}); consider shortening for calmer UX.";
            }
        }

        if ($errors === [] && $warnings === []) {
            $infos[] = 'Payload passed required shape checks with no critical issues.';
        }

        return [
            'errors' => $errors,
            'warnings' => $warnings,
            'infos' => $infos,
            'summary' => [
                'errorCount' => count($errors),
                'warningCount' => count($warnings),
                'infoCount' => count($infos),
            ],
        ];
    }
}

