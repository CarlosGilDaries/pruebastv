<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateDefaultUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'create:default-user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crea dos usuarios predeterminados si la tabla de usuarios está vacía';

    /**
     * Ejecuta el comando.
     *
     * @return void
     */
    public function handle()
    {
        if (Plan::all()->count() == 0) {
            Plan::create([
                'name' => 'admin',
                'price' => 0,
                'max_devices' => 100,
                'max_streams' => 100,
                'ads' => true,
            ]);

            $this->info('Plan Admin creado exitosamente.');
        } else {
            $this->info('Plan admin ya existe.');
        }

        if (!User::where('rol', 'admin')->exists()) {

            User::create([
                'name' => 'admin',
                'surnames' => 'admin',
                'email' => 'admin@gmail.com',
                'plan_id' => 5,
                'rol' => 'admin',
                'dni' => '24397291F',
                'address' => 'Calle Alboraya patio 14 pta 19',
                'city' => 'Valencia',
                'country' => 'España',
                'birthday' => '1993-01-29',
                'gender' => 'man',
                'password' => Hash::make('admin'),
            ]);

            $this->info('Admin creado exitosamente.');
        } else {
            $this->info('Admin ya existe.');
        }
    }
}

