<?php

namespace App\Exceptions;

use App\Enums\VisitorError;
use Exception;

class VisitorException extends Exception
{
    protected VisitorError $error;

    public function __construct(VisitorError $error, ?string $details = null)
    {
        $message = $error->message();
        
        if ($details) {
            $message .= ": {$details}";
        }
        
        $this->error = $error;
        parent::__construct($message);
    }

    public function getError(): VisitorError
    {
        return $this->error;
    }

    public function getCodeEnum(): string
    {
        return $this->error->value;
    }

    public function getField(): ?string
    {
        return $this->error->field();
    }

    public function toArray(): array
    {
        return [
            'code' => $this->error->value,
            'message' => $this->getMessage(),
            'field' => $this->getField(),
        ];
    }

    public static function invalidCpf(?string $details = null): self
    {
        return new self(VisitorError::INVALID_CPF, $details);
    }

    public static function invalidCpfLength(?string $details = null): self
    {
        return new self(VisitorError::INVALID_CPF_LENGTH, $details);
    }

    public static function duplicateCpf(?string $details = null): self
    {
        return new self(VisitorError::DUPLICATE_CPF, $details);
    }

    public static function duplicateEmail(?string $details = null): self
    {
        return new self(VisitorError::DUPLICATE_EMAIL, $details);
    }

    public static function sambaUserExists(?string $details = null): self
    {
        return new self(VisitorError::SAMBA_USER_EXISTS, $details);
    }

    public static function sambaConnectionError(?string $details = null): self
    {
        return new self(VisitorError::SAMBA_CONNECTION_ERROR, $details);
    }

    public static function invalidName(?string $details = null): self
    {
        return new self(VisitorError::INVALID_NAME, $details);
    }

    public static function invalidEmail(?string $details = null): self
    {
        return new self(VisitorError::INVALID_EMAIL, $details);
    }

    public static function invalidPhone(?string $details = null): self
    {
        return new self(VisitorError::INVALID_PHONE, $details);
    }

    public static function invalidDate(?string $details = null): self
    {
        return new self(VisitorError::INVALID_DATE, $details);
    }
}