<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\PlanExpirationWarningNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class PlanExpirationWarnings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:plan-expiration-warnings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía notificaciones de aviso de expiración de planes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        // Usuarios con 7 días restantes (días naturales)
        $sevenDaysUsers = User::whereDate('plan_expires_at', $now->copy()->addDays(7)->format('Y-m-d'))
            ->whereDoesntHave('notifications', function ($q) use ($now) {
                $q->where('type', PlanExpirationWarningNotification::class)
                ->whereJsonContains('data->notificationType', 'plan_warning_7')
                ->where('data->expires_at', $now->copy()->addDays(7)->toDateString());
            })
            ->get();

        // Usuarios con 1 día restante (días naturales)
        $oneDayUsers = User::whereDate('plan_expires_at', $now->copy()->addDays(1)->format('Y-m-d'))
            ->whereDoesntHave('notifications', function ($q) use ($now) {
                $q->where('type', PlanExpirationWarningNotification::class)
                ->where('data->notificationType', 'plan_warning_1')
                ->where('data->expires_at', $now->copy()->addDays(1)->toDateString());
            })
            ->get();

        // Enviar notificaciones
        foreach ($sevenDaysUsers as $user) {
            $notification = new PlanExpirationWarningNotification(7);
            $user->notify($notification);
        }

        foreach ($oneDayUsers as $user) {
            $user->notify(new PlanExpirationWarningNotification(1));
        }

        $this->info('Notificaciones enviadas: '.
            count($sevenDaysUsers).' avisos de 7 días, '.
            count($oneDayUsers).' avisos de 1 día.');
    }
}
