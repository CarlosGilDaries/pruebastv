<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\EmailTemplate;

class ExpiredPlan extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = config('app.frontend_url') . '/plans.html';
        $template = EmailTemplate::where('key', 'expired_plan')->first();

        if (!$template) {
        $subject = 'Plan Expirado';
        $body_spanish = 'Tu plan de suscripción ha expirado. Haga click en el botón de abajo para elegir un nuevo plan.';
        $body_english = 'Your subscription plan has expired. Click on the button below to choose a new plan.';
        $button_text_spanish = 'Elegir plan';
        $button_text_english = 'Choose plan';
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

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
