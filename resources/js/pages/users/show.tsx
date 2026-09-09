import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, User, Mail, Building, Shield } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    department?: {
        id: number;
        name: string;
    };
    created_at: string;
}

export default function UserShow() {
    const { props } = usePage<{ user: User }>();
    const { user } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuários', href: users.index.get().url },
        { title: user.name, href: `/users/${user.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuário: ${user.name}`} />

            <div className="container mx-auto py-6 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={users.index.get().url}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <p className="text-muted-foreground">Detalhes do usuário</p>
                        </div>
                    </div>
                    <Link href={users.edit({ user: user.id }).url}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Dados Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Nome:</span>
                                <span className="text-sm font-medium">{user.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Email:</span>
                                <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Username:</span>
                                <span className="text-sm font-mono">{user.username}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Vínculo Institucional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Função:</span>
                                <span className="text-sm font-medium capitalize">{user.role === 'admin' ? 'Administrador' : 'Operador'}</span>
                            </div>
                            {user.department && (
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Departamento:</span>
                                    <span className="text-sm font-medium">{user.department.name}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
