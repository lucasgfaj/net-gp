<?php

namespace App\Services;

use App\Models\Department;

class LdapService
{
    private function connect()
    {
        $ldap = ldap_connect(
            config('ldap.host'),
            config('ldap.port')
        );

        ldap_set_option($ldap, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($ldap, LDAP_OPT_REFERRALS, 0);
        ldap_set_option($ldap, LDAP_OPT_NETWORK_TIMEOUT, 5);

        return $ldap;
    }

    public function authenticate(string $username, string $password): ?array
    {
        $ldap = $this->connect();

        $userDn = $username . '@' . config('ldap.domain');

        if (!@ldap_bind($ldap, $userDn, $password)) {
            ldap_close($ldap);
            return null;
        }

        $safeUsername = ldap_escape($username, '', LDAP_ESCAPE_FILTER);

        $search = @ldap_search(
            $ldap,
            config('ldap.base_dn'),
            "(samaccountname={$safeUsername})",
            [
                'memberof',
                'displayName',
                'userPrincipalName',
                'sAMAccountName',
                'distinguishedName',
            ]
        );

        if (!$search) {
            ldap_close($ldap);
            return null;
        }

        $entries = ldap_get_entries($ldap, $search);
        ldap_close($ldap);

        if ($entries['count'] == 0) {
            return null;
        }

        $groups = $this->extractGroupCNs($entries[0]['memberof'] ?? []);

        return [
            'username' => $entries[0]['samaccountname'][0],
          'dn' => $entries[0]['distinguishedname'][0],
            'name' => $entries[0]['displayname'][0],
            'email'    => $entries[0]['samaccountname'][0] . '@utfpr.edu.br',
            'groups' => $groups, 
        ];
    }

    /**
     * Extrai apenas o CN dos grupos do AD
     */
    private function extractGroupCNs(array $rawGroups): array
    {
        $cns = [];

        foreach ($rawGroups as $key => $dn) {
            if (is_int($key) && preg_match('/CN=([^,]+)/', $dn, $matches)) {
                $cns[] = strtoupper($matches[1]);
            }
        }

        return $cns;
    }

    /**
     * Mapeia departamento pelo NOME (igual ao CN do grupo)
     */
    public function mapDepartmentByGroups(array $groupCNs): ?Department
    {
        return Department::whereIn('name', $groupCNs)->first();
    }

    /**
     * COGETI é administrador global
     */
    public function mapRoleByGroups(array $groupCNs): string
    {
        return in_array('COGETI', $groupCNs)
            ? 'admin'
            : 'operator';
    }

    
}
