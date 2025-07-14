<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Rent;
use Carbon\Carbon;

class CheckRentsExpireDate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-rents-expire-date';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Comprueba la fecha de expiración de los alquileres';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        $expiredRents = Rent::where('expires_at', '<=', $now)
            ->get();

        if ($expiredRents->isNotEmpty()) {
            $rentsIds = $expiredRents->pluck('id')->toArray();

            Rent::whereIn('id', $rentsIds)
                ->delete();
        }

        $this->info('Proceso completado. ' . $expiredRents->count() . ' alquileres expirados.');
    }
}
