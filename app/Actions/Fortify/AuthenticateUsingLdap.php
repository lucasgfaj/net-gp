<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Services\LdapService;

class AuthenticateUsingLdap
{
    public function __invoke($request)
    {
        $ldap = new LdapService();

        $data = $ldap->authenticate(
            $request->email,
            $request->password
        );

        if (!$data) {
            return null;
        }

        $department = $ldap->mapDepartmentByGroups($data['groups']);

        if (!$department) {
            session()->flash('error', 'Seu departamento não tem acesso a este sistema. Favor verificar com a COGETI.');
            return null;
        }

        $role = $ldap->mapRoleByGroups($data['groups']);

        return User::updateOrCreate(
            ['username' => $data['username']],
            [
                'ldap_dn' => $data['dn'],
                'email' => $data['email'],
                'name' => $data['name'],
                'password' => '$ldap$',
                'department_id' => $department->id,
                'role' => $role,
            ]
        );
    }
}