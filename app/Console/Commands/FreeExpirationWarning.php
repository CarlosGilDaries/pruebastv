<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\FreeExpirationWarningNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class FreeExpirationWarning extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:free-expiration-warning';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía notificaciones de aviso de expiración del plan Free';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        // Usuarios con 2 días restantes (días naturales)
        $twoDaysUsers = User::with('plan')
            ->whereDate('plan_expires_at', $now->copy()->addDays(2)->format('Y-m-d'))
            ->whereHas('plan', function ($q) {
                $q->where('trimestral_price', '=', 0);
            })
            ->whereDoesntHave('notifications', function ($q) use ($now) {
                $q->where('type', FreeExpirationWarningNotification::class)
                    ->whereJsonContains('data->notificationType', 'plan_warning_2')
                    ->where('data->expires_at', $now->copy()->addDays(2)->toDateString());
            })
            ->get();


        // Usuarios con 1 día restante (días naturales)
        $oneDayUsers = User::with('plan')
            ->whereDate('plan_expires_at', $now->copy()->addDays(1)->format('Y-m-d'))
            ->whereHas('plan', function ($q) {
                $q->where('trimestral_price', '=', 0);
            })
            ->whereDoesntHave('notifications', function ($q) use ($now) {
                $q->where('type', FreeExpirationWarningNotification::class)
                ->where('data->notificationType', 'plan_warning_1')
                ->where('data->expires_at', $now->copy()->addDays(1)->toDateString());
            })
            ->get();

        // Enviar notificaciones
        foreach ($twoDaysUsers as $user) {
            $notification = new FreeExpirationWarningNotification(2);
            $user->notify($notification);
        }

        foreach ($oneDayUsers as $user) {
            $user->notify(new FreeExpirationWarningNotification(1));
        }

        $this->info('Notificaciones enviadas: '.
            count($twoDaysUsers).' avisos de 2 días, '.
            count($oneDayUsers).' avisos de 1 día.');
    }
}
