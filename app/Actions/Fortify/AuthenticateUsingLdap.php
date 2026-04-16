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

        // Falhou no AD → bloqueia login
        if (!$data) {
            return null;
        }

        // Descobre o departamento pelo grupo do AD
        $department = $ldap->mapDepartmentByGroups($data['groups']);

        // Usuário não pertence a nenhum grupo permitido
        if (!$department) {
            return null;
        }

        // Descobre o papel (admin/operator) pelo grupo
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