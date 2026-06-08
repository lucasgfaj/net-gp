import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    role: string;
    name: string;
    email: string;
    username: string;
    department: { name: string };
}

export default function EditUsers({ user }: { user: User }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuários', href: users.index.get().url },
        { title: 'Editar', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Usuário" />

            <div className="w-full max-w-4xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">Editar Usuário</h1>

                <div className="space-y-4">
                    <div>
                        <Label>Nome</Label>
                        <Input value={user.name} readOnly className="opacity-70" />
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input value={user.email} readOnly className="opacity-70" />
                    </div>

                    <div>
                        <Label>Username</Label>
                        <Input value={user.username} readOnly className="opacity-70" />
                    </div>

                    <div>
                        <Label>Departamento</Label>
                        <Input value={user.department.name} readOnly className="opacity-70" />
                    </div>

                    <div>
                        <Label>Função no sistema</Label>
                        <Input
                            value={user.department.name === 'COGETI' ? 'Administrador' : 'Operador'}
                            readOnly
                            className="opacity-70"
                        />
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button asChild>
                            <Link href={users.index.get().url}>Voltar</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}