export type ErrorCode =
  | 'INVALID_NAME'
  | 'INVALID_CPF'
  | 'INVALID_CPF_LENGTH'
  | 'INVALID_EMAIL'
  | 'INVALID_DATE'
  | 'INVALID_PHONE'
  | 'DUPLICATE_CPF'
  | 'DUPLICATE_EMAIL'
  | 'SAMBA_USER_EXISTS'
  | 'SAMBA_CONNECTION_ERROR'
  | 'SAMBA_CREATE_ERROR'
  | 'SAMBA_PASSWORD_ERROR'
  | 'DB_ERROR'
  | 'INTERNAL_ERROR'

export interface ErrorMapping {
  title: string
  description: string
  variant: 'error' | 'warning' | 'info'
}

export const errorMapping: Record<ErrorCode, ErrorMapping> = {
  INVALID_NAME: {
    title: 'Nome inválido',
    description: 'O nome não pode estar vazio.',
    variant: 'error',
  },
  INVALID_CPF: {
    title: 'CPF inválido',
    description: 'O CPF possui dígitos verificadores incorretos.',
    variant: 'error',
  },
  INVALID_CPF_LENGTH: {
    title: 'CPF inválido',
    description: 'O CPF deve ter exatamente 11 dígitos.',
    variant: 'error',
  },
  INVALID_EMAIL: {
    title: 'Email inválido',
    description: 'O formato do email está incorreto.',
    variant: 'error',
  },
  INVALID_DATE: {
    title: 'Data inválida',
    description: 'A data de expiração está no formato incorreto.',
    variant: 'error',
  },
  INVALID_PHONE: {
    title: 'Telefone inválido',
    description: 'O telefone possui formato inválido.',
    variant: 'error',
  },
  DUPLICATE_CPF: {
    title: 'CPF já cadastrado',
    description: 'Este CPF já está cadastrado no sistema.',
    variant: 'error',
  },
  DUPLICATE_EMAIL: {
    title: 'Email já está em uso',
    description: 'Este email já está cadastrado.',
    variant: 'error',
  },
  SAMBA_USER_EXISTS: {
    title: 'Usuário já existe no sistema',
    description: 'Este login já existe no sistema de acesso. Não foi possível criar novamente.',
    variant: 'warning',
  },
  SAMBA_CONNECTION_ERROR: {
    title: 'Erro de conexão',
    description: 'Não foi possível conectar ao servidor de acesso. Tente novamente mais tarde.',
    variant: 'error',
  },
  SAMBA_CREATE_ERROR: {
    title: 'Erro ao criar usuário',
    description: 'Não foi possível criar o usuário no sistema de acesso.',
    variant: 'error',
  },
  SAMBA_PASSWORD_ERROR: {
    title: 'Senha inválida',
    description: 'A senha não atende os requisitos do sistema.',
    variant: 'error',
  },
  DB_ERROR: {
    title: 'Erro no banco de dados',
    description: 'Ocorreu um erro ao salvar os dados.',
    variant: 'error',
  },
  INTERNAL_ERROR: {
    title: 'Erro interno',
    description: 'Ocorreu um erro inesperado. Contate o suporte.',
    variant: 'error',
  },
}

export function getErrorMessage(code: ErrorCode): ErrorMapping {
  return errorMapping[code] ?? {
    title: 'Erro',
    description: 'Ocorreu um erro desconhecido.',
    variant: 'error',
  }
}

export function mapFieldError(field: string, message: string): { field: string; message: string } {
  const code = message.match(/([A-Z_]+)/)?.[1] as ErrorCode

  if (code && errorMapping[code]) {
    return {
      field,
      message: errorMapping[code].description,
    }
  }

  return { field, message }
}