<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],

            'password' => $this->passwordRules(),

            'department_id' => ['required', 'integer', 'exists:departments,id'],

            // agora o role não vem mais do input (opcional)
            'role' => ['nullable', 'string', Rule::in(['admin', 'operator'])],
        ])->validate();


        // 🛡 REGRA DE OURO:
        // Se o usuário logado é admin → ele decide o role
        // Se NÃO é admin → o role sempre será operator
        $role = 'operator';

        if (Auth::check() && Auth::user()->role === 'admin') {
            $role = $input['role'] ?? 'operator';
        }

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'], // hashed automaticamente pelo cast
            'department_id' => $input['department_id'],
            'role' => $role,
        ]);
    }
}
