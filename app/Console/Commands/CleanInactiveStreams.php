<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ActiveStream;
use Carbon\Carbon;

class CleanInactiveStreams extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'streams:clean';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Elimina streams inactivos después de 1 minuto sin actividad';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredTime = Carbon::now()->subMinutes(1);

        $deleted = ActiveStream::where('last_active_at', '<', $expiredTime)->delete();

        $this->info("Streams inactivos eliminados: $deleted");
    }
}
