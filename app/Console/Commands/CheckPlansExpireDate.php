<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserSession;
use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Notifications\ExpiredPlan;

class CheckPlansExpireDate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-plans-expire-date';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Desactiva planes que han expirado por fecha.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        $expiredUsers = User::where('plan_expires_at', '<=', $now)
            ->whereNotNull('plan_id')
            ->get();

        if ($expiredUsers->isNotEmpty()) {
            $userIds = $expiredUsers->pluck('id')->toArray();

            // Desactivar planes
            User::whereIn('id', $userIds)
                ->update([
                    'plan_id' => null,
                    'plan_expires_at' => null
                ]);

            // Eliminar sesiones
            UserSession::whereIn('user_id', $userIds)->delete();

            // Enviar notificaciones
            foreach ($expiredUsers as $user) {
                $user->notify(new ExpiredPlan());
            }
        }

        $this->info('Proceso completado. ' . $expiredUsers->count() . ' usuarios actualizados.');
    }
}
