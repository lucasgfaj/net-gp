<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            'ASCOM',
            'ASPLAD',
            'CALEM',
            'COECI',
            'COEME',
            'COGERH',
            'COGETI',
            'COINT',
            'COMIN',
            'DEBIB',
            'DEMAP',
            'DEOFI',
            'DEPEC',
            'DEPED',
            'DEPEX',
            'DEPRO',
            'DERAC',
            'DESEG',
            'DIEMI',
            'DIREC',
            'DIRGE',
            'DIRGRAD',
            'DIRPLAD',
            'DIRPPG',
            'GADIR',
            'PROEM',
            'SELIB',
            'SEGEA',
        ];

        foreach ($departments as $name) {
            Department::firstOrCreate([
                'name' => $name,
            ]);
        }
    }
}