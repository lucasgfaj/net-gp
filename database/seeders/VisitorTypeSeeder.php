<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VisitorType;

class VisitorTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['name' => 'Visitante',        'description' => 'Visitante comum.'],
            ['name' => 'Estagiário',       'description' => 'Vínculo de estágio.'],
            ['name' => 'Evento',           'description' => 'Participante de evento.'],
            ['name' => 'Terceirizado',     'description' => 'Colaborador terceirizado.'],
            ['name' => 'Servidor Externo', 'description' => 'Servidor de outro campus.'],
            ['name' => 'Curta Duração',    'description' => 'Visita rápida.'],
            ['name' => 'Prestador',        'description' => 'Prestador de serviço.'],
            ['name' => 'Aluno Externo',    'description' => 'Aluno de outra instituição.'],
            ['name' => 'Convidado',        'description' => 'Visitante convidado.'],
        ];

        foreach ($types as $type) {
            VisitorType::firstOrCreate(
                ['name' => $type['name']],
                ['description' => $type['description']]
            );
        }
    }
}
