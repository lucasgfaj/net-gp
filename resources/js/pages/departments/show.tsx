import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import departments from '@/routes/departments';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Building, Users } from 'lucide-react';

interface Department {
    id: number;
    name: string;
    users_count: number;
}

export default function DepartmentShow() {
    const { props } = usePage<{ department: Department }>();
    const { department } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Departamentos', href: departments.index.get().url },
        { title: department.name, href: `/departments/${department.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Departamento: ${department.name}`} />

            <div className="container mx-auto py-6 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={departments.index.get().url}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{department.name}</h1>
                            <p className="text-muted-foreground">Detalhes do departamento</p>
                        </div>
                    </div>
                    <Link href={departments.edit({ department: department.id }).url}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Nome:</span>
                                <span className="text-sm font-medium">{department.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Usuários vinculados:</span>
                                <span className="text-sm font-medium">{department.users_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
