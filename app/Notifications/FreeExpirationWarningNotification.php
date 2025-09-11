<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FreeExpirationWarningNotification extends Notification
{
    use Queueable;

    public $daysLeft;
    public $notificationType;

    /**
     * Create a new notification instance.
     */
    public function __construct($daysLeft)
    {
        $this->daysLeft = $daysLeft;
        $this->notificationType = "plan_warning_{$daysLeft}";
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->daysLeft == 1 
                ? '¡Tu plan expira mañana!' 
                : "Tu plan expira en {$this->daysLeft} días")
            ->line($this->daysLeft == 1
                ? 'Tu plan de suscripción expira mañana. Recuerda que si no accedes a la plataforma antes de la expiración perderás el derecho a usar el plan Free.'
                : "Tu plan de suscripción expirará en {$this->daysLeft} días. Recuerda que si no accedes a la plataforma antes de la expiración perderás el derecho a usar el plan Free.")
            ->action('Ir a la plataforma', url('/'))
            ->line('¡Gracias por usar nuestro servicio!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'notificationType' => $this->notificationType,
            'expires_at' => $notifiable->plan_expires_at->toDateString(),
        ];
    }
}
