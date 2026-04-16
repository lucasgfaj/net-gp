<?php

return [
    'host' => env('LDAP_HOST'),
    'port' => env('LDAP_PORT', 389),
    'base_dn' => env('LDAP_BASE_DN'),
    'domain' => env('LDAP_DOMAIN'),
    'email_domain' => env('LDAP_EMAIL_DOMAIN'),
    'admin_group' => env('LDAP_ADMIN_GROUP'),
];