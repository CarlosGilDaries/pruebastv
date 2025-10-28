<?php

namespace App\Notifications;

use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FreeFirstWarningNotification extends Notification
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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $template = EmailTemplate::where('key', 'free_first_warning')->first();

        $subject = $template->subject;
        $body_spanish = $template->body_spanish;
        $button_text_spanish = $template->button_text_spanish;
        $body_english = $template->body_english;
        $button_text_english = $template->button_text_english;

        return (new MailMessage)
            ->subject($subject)
            ->line($body_spanish)
            ->line($body_english)
            ->action($button_text_spanish . ' / ' . $button_text_english, url('/'))
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
