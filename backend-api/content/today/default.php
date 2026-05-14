<?php

use Illuminate\Support\Carbon;

$timezone = 'Asia/Jakarta';
$anchorDate = Carbon::create(2026, 5, 14, 0, 0, 0, $timezone);
$dateOverride = trim((string) config('today.date_override', ''));

if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateOverride) === 1) {
    $today = Carbon::createFromFormat('Y-m-d', $dateOverride, $timezone);
} else {
    $today = Carbon::now($timezone)->startOfDay();
}

$dailyVerses = [
    [
        'text' => 'Commit your way to the LORD; trust in Him, and He will act.',
        'reference' => 'Psalm 37:5',
    ],
    [
        'text' => 'The steadfast love of the LORD never ceases; His mercies never come to an end.',
        'reference' => 'Lamentations 3:22',
    ],
    [
        'text' => 'Be still, and know that I am God.',
        'reference' => 'Psalm 46:10',
    ],
    [
        'text' => 'Cast all your anxiety on Him because He cares for you.',
        'reference' => '1 Peter 5:7',
    ],
    [
        'text' => 'Your word is a lamp to my feet and a light to my path.',
        'reference' => 'Psalm 119:105',
    ],
    [
        'text' => 'Come to Me, all who labor and are heavy laden, and I will give you rest.',
        'reference' => 'Matthew 11:28',
    ],
    [
        'text' => 'Trust in the LORD with all your heart, and do not lean on your own understanding.',
        'reference' => 'Proverbs 3:5',
    ],
    [
        'text' => 'My grace is sufficient for you, for My power is made perfect in weakness.',
        'reference' => '2 Corinthians 12:9',
    ],
    [
        'text' => 'I can do all things through Him who strengthens me.',
        'reference' => 'Philippians 4:13',
    ],
    [
        'text' => 'The LORD is my shepherd; I shall not want.',
        'reference' => 'Psalm 23:1',
    ],
    [
        'text' => 'Do not fear, for I am with you; do not be dismayed, for I am your God.',
        'reference' => 'Isaiah 41:10',
    ],
    [
        'text' => 'Let the peace of Christ rule in your hearts.',
        'reference' => 'Colossians 3:15',
    ],
];

$totalVerses = count($dailyVerses);
$daysDiff = $anchorDate->diffInDays($today, false);
$index = (($daysDiff % $totalVerses) + $totalVerses) % $totalVerses;
$selectedVerse = $dailyVerses[$index];

return [
    'contractVersion' => 'today.session.v1',
    'user' => [
        'name' => 'Friend',
        'avatarInitial' => 'F',
    ],
    'greeting' => 'Welcome back, friend.',
    'dateLabel' => $today->format('l, j F Y'),
    'openingLine' => 'Take a slow breath. God is present with you in today\'s rhythm.',
    'verse' => [
        'label' => 'Today\'s Verse',
        'text' => $selectedVerse['text'],
        'reference' => $selectedVerse['reference'],
    ],
    'reflection' => [
        'prompt' => 'What is one thing you want to entrust to God today?',
        'placeholder' => 'Write your short reflection here...',
        'ctaLabel' => 'Amen',
        'sealedLabel' => 'Your reflection is now held in today\'s prayer.',
    ],
    'prayer' => [
        'label' => 'Today\'s Prayer',
        'text' => 'Lord, guide my steps today. Teach me to walk by faith, not by fear. Amen.',
        'ctaLabel' => 'Amen',
        'completionLabel' => 'Today\'s prayer has been affirmed.',
    ],
    'completion' => [
        'title' => 'Peace for Today',
        'body' => 'You have completed today\'s ritual. Let Christ\'s peace remain in every decision you make.',
        'softProgressLabel' => 'Faith journey progress',
        'progressValue' => 'Day 1 of 7',
        'tomorrowCueLabel' => 'Tomorrow',
        'tomorrowCueText' => 'We will return with a new verse and a new prayer.',
    ],
];
