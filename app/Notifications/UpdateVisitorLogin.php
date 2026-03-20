<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class UpdateVisitorLogin extends Notification
{
    public function __construct(
        public string $email,
        public string $password,
        public string $expiresAt
    ) {}

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Acesso temporário à rede UTFPR - GP')
            ->greeting('Olá! Foi Atualizado sua Senha!')
            ->line('Seu acesso temporário atual é:')
            ->line('Login: ' . $this->email)
            ->line('Senha: ' . $this->password)
            ->line('Validade do acesso: ' . $this->expiresAt)
            ->line('Após o vencimento, o acesso será automaticamente bloqueado.')
            ->salutation('COGETI-GP');
    }
}

