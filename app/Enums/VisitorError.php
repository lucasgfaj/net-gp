<?php

namespace App\Enums;

enum VisitorError: string
{
    case INVALID_NAME = 'INVALID_NAME';
    case INVALID_CPF = 'INVALID_CPF';
    case INVALID_CPF_LENGTH = 'INVALID_CPF_LENGTH';
    case INVALID_EMAIL = 'INVALID_EMAIL';
    case INVALID_DATE = 'INVALID_DATE';
    case INVALID_PHONE = 'INVALID_PHONE';

    case DUPLICATE_CPF = 'DUPLICATE_CPF';
    case DUPLICATE_EMAIL = 'DUPLICATE_EMAIL';

    case SAMBA_USER_EXISTS = 'SAMBA_USER_EXISTS';
    case SAMBA_CONNECTION_ERROR = 'SAMBA_CONNECTION_ERROR';
    case SAMBA_CREATE_ERROR = 'SAMBA_CREATE_ERROR';
    case SAMBA_PASSWORD_ERROR = 'SAMBA_PASSWORD_ERROR';

    case DB_ERROR = 'DB_ERROR';
    case INTERNAL_ERROR = 'INTERNAL_ERROR';

    public function message(): string
    {
        return match ($this) {
            self::INVALID_NAME => 'Nome inválido ou vazio',
            self::INVALID_CPF => 'CPF inválido (dígito verificador incorreto)',
            self::INVALID_CPF_LENGTH => 'CPF deve ter 11 dígitos',
            self::INVALID_EMAIL => 'Email com formato inválido',
            self::INVALID_DATE => 'Data de expiração inválida',
            self::INVALID_PHONE => 'Telefone com formato inválido',

            self::DUPLICATE_CPF => 'CPF já cadastrado no sistema',
            self::DUPLICATE_EMAIL => 'Email já está em uso',

            self::SAMBA_USER_EXISTS => 'Usuário já existe no sistema de acesso (Samba/AD)',
            self::SAMBA_CONNECTION_ERROR => 'Erro de conexão com o servidor de acesso',
            self::SAMBA_CREATE_ERROR => 'Erro ao criar usuário no sistema de acesso',
            self::SAMBA_PASSWORD_ERROR => 'Senha não atende requisitos do sistema',

            self::DB_ERROR => 'Erro ao salvar no banco de dados',
            self::INTERNAL_ERROR => 'Erro interno do servidor',
        };
    }

    public function field(): ?string
    {
        return match ($this) {
            self::INVALID_NAME => 'name',
            self::INVALID_CPF, self::INVALID_CPF_LENGTH => 'cpf',
            self::INVALID_EMAIL => 'email',
            self::INVALID_DATE => 'expires_at',
            self::INVALID_PHONE => 'phone',
            self::DUPLICATE_CPF => 'cpf',
            self::DUPLICATE_EMAIL => 'email',
            self::SAMBA_USER_EXISTS => 'cpf',
            self::SAMBA_CONNECTION_ERROR, self::SAMBA_CREATE_ERROR, self::SAMBA_PASSWORD_ERROR => null,
            self::DB_ERROR, self::INTERNAL_ERROR => null,
        };
    }

    public static function fromSambaResult(array $result): ?self
    {
        $error = $result['error'] ?? '';

        if (str_contains($error, 'already exists')) {
            return self::SAMBA_USER_EXISTS;
        }

        if (str_contains($error, 'Unable to connect') || str_contains($error, 'connection')) {
            return self::SAMBA_CONNECTION_ERROR;
        }

        return self::SAMBA_CREATE_ERROR;
    }
}