<?php

namespace App\Notifications;

use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PlanExpirationWarningNotification extends Notification
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
        $template1 = EmailTemplate::where('key', 'plan_one_day_left')->first();
        $template2 = EmailTemplate::where('key', 'plan_seven_days_left')->first();
        $url = config('app.frontend_url') . '/plans.html';

        $subject1 = $template1->subject;
        $subject2 = $template2->subject;
        $body_spanish1 = $template1->body_spanish;
        $button_text_spanish1 = $template1->button_text_spanish;
        $body_english1 = $template1->body_english;
        $button_text_english1 = $template1->button_text_english;
        $body_spanish2 = $template2->body_spanish;
        $button_text_spanish2 = $template2->button_text_spanish;
        $body_english2 = $template2->body_english;
        $button_text_english2 = $template2->button_text_english;

        if ($this->daysLeft == 1) {
            return (new MailMessage)
                ->subject($subject1)
                ->line($body_spanish1)
                ->line($body_english1)
                ->action($button_text_spanish1 . ' / ' . $button_text_english1, $url)
                ->salutation(env('APP_NAME'));
        } else {
            return (new MailMessage)
                ->subject($subject2)
                ->line($body_spanish2)
                ->line($body_english2)
                ->action($button_text_spanish2 . ' / ' . $button_text_english2, $url)
                ->salutation(env('APP_NAME'));
        }
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
