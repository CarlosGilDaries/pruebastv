<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userEmail;
    public $subject;
    public $message;

    /**
     * Create a new message instance.
     */
    public function __construct($userEmail, $subject, $message)
    {
        $this->userEmail = $userEmail;
        $this->subject = $subject;
        $this->message = $message;
    }

    public function build()
    {
        return $this->from($this->userEmail)
                   ->subject($this->subject)
                   ->markdown('emails.contact-form')
                   ->with([
                       'messageContent' => $this->message,
                       'userEmail' => $this->userEmail
                   ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Contact Form Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'view.name',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
