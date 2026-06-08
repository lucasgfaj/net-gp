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

export default function CreateUser({ departments }: { departments: Array<{ id: number; name: string }> }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuários', href: users.index.get().url },
        { title: 'Criar', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        department_id: departments.length ? String(departments[0].id) : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(users.store.post().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Usuário" />

            <div className="w-full max-w-4xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">Criar Usuário</h1>

                <form onSubmit={submit} className="space-y-4">
                    {/* Nome */}
                    <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            placeholder="Nome do usuário"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="E-mail do usuário"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Senha do usuário"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Departamento */}
                    <div>
                        <Label htmlFor="department_id">Departamento</Label>
                        <Select
                            value={String(data.department_id)}
                            onValueChange={(value) => setData('department_id', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.department_id && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.department_id}
                            </p>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="mt-4 flex justify-start gap-2">
                        <Button variant="outline" asChild>
                            <Link href={users.index.get().url}>Cancelar</Link>
                        </Button>
                        <Button disabled={processing} type="submit">
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
