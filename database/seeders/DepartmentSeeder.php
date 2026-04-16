<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            'COGETI',
            'ASCOM',
            'DIRGRAD',
            'COINT',
            'PROPPG',
            'PROREC',
            'PROPLAD',
            'PROGRAD',
        ];

        foreach ($departments as $name) {
            Department::firstOrCreate([
                'name' => $name,
            ]);
        }
    }
}