import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import visitorTypes from '@/routes/visitorTypes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Tag, Users } from 'lucide-react';

interface VisitorType {
    id: number;
    name: string;
    description: string | null;
    visitors_count: number;
}

export default function VisitorTypeShow() {
    const { props } = usePage<{ type: VisitorType }>();
    const { type } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tipos de Visitante', href: visitorTypes.index.get().url },
        { title: type.name, href: `/visitorTypes/${type.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tipo: ${type.name}`} />

            <div className="container mx-auto py-6 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={visitorTypes.index.get().url}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{type.name}</h1>
                            <p className="text-muted-foreground">Detalhes do tipo de visitante</p>
                        </div>
                    </div>
                    <Link href={visitorTypes.edit({ visitorType: type.id }).url}>
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
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Nome:</span>
                                <span className="text-sm font-medium">{type.name}</span>
                            </div>
                            {type.description && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Descrição:</span>
                                    <span className="text-sm">{type.description}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Visitantes vinculados:</span>
                                <span className="text-sm font-medium">{type.visitors_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
