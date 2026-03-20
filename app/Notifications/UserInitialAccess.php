<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class UserInitialAccess extends Notification
{
    public function __construct(
        public string $email,
        public string $password
    ) {}

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Dados de acesso ao sistema')
            ->greeting('Olá!')
            ->line('Seu acesso ao sistema foi criado.')
            ->line('Utilize os dados abaixo para realizar o primeiro login:')
            ->line('E-mail: ' . $this->email)
            ->line('Senha inicial: ' . $this->password)
            ->line('⚠️ Recomendamos fortemente que você altere sua senha após o primeiro acesso.')
            ->action('Acessar o sistema', url('/login'))
            ->line('Caso você não reconheça este acesso, entre em contato com o suporte.')
            ->salutation('Equipe de TI');
    }
}
