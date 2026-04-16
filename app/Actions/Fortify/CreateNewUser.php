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

            'role' => ['nullable', 'string', Rule::in(['admin', 'operator'])],
        ])->validate();


        $role = 'operator';

        if (Auth::check() && Auth::user()->role === 'admin') {
            $role = $input['role'] ?? 'operator';
        }

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'department_id' => $input['department_id'],
            'role' => $role,
        ]);
    }
}
