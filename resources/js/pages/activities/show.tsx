import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User, Building, Clock, Globe, Monitor } from 'lucide-react';

interface UserInfo {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: {
        id: number;
        name: string;
    };
}

interface ActivityData {
    visitor_id?: number;
    visitor_name?: string;
    department_id?: number;
    department_name?: string;
    type_id?: number;
    type_name?: string;
    old?: Record<string, unknown>;
    new?: Record<string, unknown>;
}

interface Props {
    activity: {
        id: number;
        created_at: string;
        action: string;
        data: ActivityData | null;
        user: UserInfo | null;
    };
}

export default function ActivityShow({ activity }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Atividades', href: '/activities' },
        { title: 'Detalhes', href: '#' },
    ];

    const getActionLabel = (action: string): string => {
        const labels: Record<string, string> = {
            visitor_created: 'Visitante Criado',
            visitor_updated: 'Visitante Atualizado',
            visitor_deleted: 'Visitante Excluído',
            visitor_password_generated: 'Senha Gerada',
            visitor_expired: 'Visitante Expirado',
            user_login: 'Login de Usuário',
            department_created: 'Departamento Criado',
            department_deleted: 'Departamento Excluído',
            visitor_type_created: 'Tipo de Visitante Criado',
            visitor_type_deleted: 'Tipo de Visitante Excluído',
        };
        return labels[action] || action;
    };

    const getActionDescription = (action: string): string => {
        const descriptions: Record<string, string> = {
            visitor_created: 'Novo visitante foi criado no sistema',
            visitor_updated: 'Dados do visitante foram atualizados',
            visitor_deleted: 'Visitante foi removido do sistema',
            visitor_password_generated: 'Nova senha foi gerada para o visitante',
            visitor_expired: 'Acesso do visitante expirou',
            user_login: 'Usuário realizou login no sistema',
            department_created: 'Novo departamento foi criado',
            department_deleted: 'Departamento foi removido',
            visitor_type_created: 'Novo tipo de visitante foi criado',
            visitor_type_deleted: 'Tipo de visitante foi removido',
        };
        return descriptions[action] || 'Ação registrada no sistema';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalhes da Atividade" />

            <div className="flex flex-col gap-4 p-4 sm:p-6">
                <div className="flex items-center gap-4">
                    <Link href="/activities">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-semibold">Detalhes da Atividade</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {getActionLabel(activity.action)}
                        </CardTitle>
                        <CardDescription>
                            {getActionDescription(activity.action)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Data/Hora</span>
                                <p className="text-sm font-medium">
                                    {new Date(activity.created_at).toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">ID do Registro</span>
                                <p className="text-sm font-mono">#{activity.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Usuário Responsável
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Nome</span>
                                <p className="text-sm">{activity.user?.name || 'Sistema'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Email</span>
                                <p className="text-sm">{activity.user?.email || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Papel</span>
                                <p className="text-sm capitalize">{activity.user?.role || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Departamento</span>
                                <p className="text-sm">{activity.user?.department?.name || 'Sem departamento'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {activity.data && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Dados da Ação
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="max-h-60 overflow-auto rounded-md bg-muted p-4 text-sm">
                                {JSON.stringify(activity.data, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Informações Técnicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Endereço IP</span>
                                <p className="text-sm font-mono">{activity.data?.ip || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Navegador</span>
                                <p className="text-sm truncate">{activity.data?.user_agent || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}