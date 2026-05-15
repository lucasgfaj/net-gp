import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface User {
    id: number;
    role: string;
    active: boolean | string;
    name: string;
    email: string;
    username: string;
    department: { name: string };
}

interface AuthUser {
    id: number;
}

export default function EditUsers({ user, authUser }: { user: User; authUser: AuthUser }) {
    const isSelf = Number(authUser.id) === Number(user.id);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuários', href: users.index.get().url },
        { title: 'Editar', href: '#' },
    ];

    const { data, setData, put, errors } = useForm({
        role: user.role,
        active: user.active ? '1' : '0',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(users.update({ user: user.id }).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Usuário" />

            <div className="w-full max-w-4xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">Editar Usuário</h1>

                <form onSubmit={submit} className="space-y-4">

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
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                            disabled={isSelf}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="operator">Operador</SelectItem>
                            </SelectContent>
                        </Select>

                        {errors.role && (
                            <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                        )}
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button asChild>
                            <Link href={users.index.get().url}>Voltar</Link>
                        </Button>

                        {/* <Button disabled={processing} type="submit">
                            Salvar alterações
                        </Button> */}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}