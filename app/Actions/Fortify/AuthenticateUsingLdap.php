<?php

namespace App\Actions\Fortify;

use App\Contracts\ActivityLogInterface;
use App\Models\User;
use App\Services\LdapService;

class AuthenticateUsingLdap
{
    public function __construct(
        protected ActivityLogInterface $activityLogService
    ) {}

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
            $groupsList = implode(', ', $data['groups']);
            $message = 'Seu grupo (' . $groupsList . ') não tem acesso a este sistema. Favor verificar com a COGETI.';
            session()->flash('error', $message);
            return null;
        }

        $role = $ldap->mapRoleByGroups($data['groups']);

        $user = User::updateOrCreate(
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

        $this->activityLogService->logLogin($user);

        return $user;
    }
}