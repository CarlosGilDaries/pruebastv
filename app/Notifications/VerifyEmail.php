<?php

namespace App\Notifications;

use App\Models\EmailTemplate;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

class VerifyEmail extends VerifyEmailBase
{
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
    
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);
        $template = EmailTemplate::where('key', 'verify_email')->first();

        $subject = $template->subject;
        $body_spanish = $template->body_spanish;
        $button_text_spanish = $template->button_text_spanish;
        $body_english = $template->body_english;
        $button_text_english = $template->button_text_english;

        return (new MailMessage)
            ->subject($subject)
            ->line($body_spanish)
            ->line($body_english)
            ->action($button_text_spanish . ' / ' . $button_text_english, $verificationUrl)
            ->salutation(env('APP_NAME'));
    }
}
