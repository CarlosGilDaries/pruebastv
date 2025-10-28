<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;
use App\Models\EmailTemplate;

class CustomResetPassword extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = config('app.frontend_url') . '/reset-password.html?token=' . $this->token . '&email=' . urlencode($notifiable->email);
        $template = EmailTemplate::where('key', 'reset_password')->first();

        if (!$template) {
        $subject = 'Restaurar Contraseña';
        $body_spanish = 'Estás recibiendo este email porque hemos recibido una petición de restauración de contraseña desde esta cuenta.';
        $button_text_spanish = 'Restaurar Contraseña';
        //$footer = 'El enlace expirará en :count minutos.';
        } else {
            $subject = $template->subject;
            $body_spanish = $template->body_spanish;
            $button_text_spanish = $template->button_text_spanish;
            $body_english = $template->body_english;
            $button_text_english = $template->button_text_english;
            //$footer = 'El enlace expirará en :count minutos.';
        }

        return (new MailMessage)
        ->subject($subject)
        ->line($body_spanish)
        ->line($body_english)
        ->action($button_text_spanish . ' / ' . $button_text_english, $url)
        //->line(str_replace(':count', config('auth.passwords.'.config('auth.defaults.passwords').'.expire'), $footer))
        ->salutation(env('APP_NAME'));
    }
}