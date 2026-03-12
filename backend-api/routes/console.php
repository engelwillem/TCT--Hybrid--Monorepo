<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:publish-due-posts')
    ->hourly()
    ->withoutOverlapping();

Schedule::command('app:daily-maintenance')
    ->dailyAt('05:00')
    ->withoutOverlapping();

Schedule::command('app:recalculate-user-metrics')
    ->dailyAt('00:15')
    ->withoutOverlapping();

Schedule::command('app:bridge-daily-content')
    ->dailyAt('04:00')
    ->withoutOverlapping();

Schedule::command('app:generate-pulse')
    ->twiceDaily(9, 18)
    ->withoutOverlapping();
