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

export default function EditUsers({ user, authUser, departments }: any) {
    const isSelf = Number(authUser.id) === Number(user.id);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuários', href: users.index.get().url },
        { title: 'Editar', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id ? String(user.department_id) : '',
        password: '',
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
                    {/* Nome */}
                    <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email – desabilitado se for o próprio usuário */}
                    <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            disabled={isSelf}
                            className={isSelf ? 'opacity-50' : ''}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password opcional */}
                    <div>
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                            Preencha somente se quiser alterar a senha.
                        </p>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Role – desabilitado se for o próprio usuário */}
                    <div>
                        <Label>Função</Label>
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                            disabled={isSelf}
                        >
                            <SelectTrigger
                                className={`w-full ${isSelf ? 'opacity-50' : ''}`}
                            >
                                <SelectValue placeholder="Selecione o papel" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="operator">Operador</SelectItem>
                            </SelectContent>
                        </Select>

                        {errors.role && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    {/* Departamento – desabilitado se for o próprio usuário */}
                    <div>
                        <Label>Departamento</Label>
                        <Select
                            value={data.department_id}
                            onValueChange={(value) =>
                                setData('department_id', value)
                            }
                            disabled={isSelf}
                        >
                            <SelectTrigger
                                className={`w-full ${isSelf ? 'opacity-50' : ''}`}
                            >
                                <SelectValue placeholder="Selecione o departamento" />
                            </SelectTrigger>

                            <SelectContent>
                                {departments.map((d: any) => (
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
