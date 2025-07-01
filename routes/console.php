<?php

use Illuminate\Foundation\Console\ClosureCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    /** @var ClosureCommand $this */
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('streams:clean')->everyMinute();
Schedule::command('app:check-plans-expire-date')->everyMinute();
Schedule::command('app:plan-expiration-warnings')->everyMinute();

// php artisan schedule:work
