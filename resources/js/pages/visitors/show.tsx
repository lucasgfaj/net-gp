import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import visitors from '@/routes/visitors';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Calendar, Building, User } from 'lucide-react';

interface Visitor {
    id: number;
    name: string;
    cpf: string;
    email: string | null;
    phone: string | null;
    expires_at: string;
    created_at: string;
    enabled: boolean;
    email_sent: boolean;
    email_sent_at: string | null;
    type: {
        id: number;
        name: string;
    };
    voucher?: {
        id: number;
        login: string;
        expires_at: string;
    };
    creator?: {
        id: number;
        name: string;
        department?: {
            name: string;
        };
    };
}

interface Props {
    visitor: Visitor;
}

export default function VisitorShow() {
    const { props } = usePage<Props>();
    const { visitor } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Visitantes', href: visitors.index.get().url },
        { title: visitor.name, href: `/visitors/${visitor.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Visitante: ${visitor.name}`} />

            <div className="container mx-auto py-6 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={visitors.index.get().url}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{visitor.name}</h1>
                            <p className="text-muted-foreground">Detalhes do visitante</p>
                        </div>
                    </div>
                    <Link href={visitors.edit.get(visitor.id)}>
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
                                <span className="text-sm font-medium">{visitor.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">CPF:</span>
                                <span className="text-sm font-mono">{visitor.cpf}</span>
                            </div>
                            {visitor.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Email:</span>
                                    <span className="text-sm">{visitor.email}</span>
                                </div>
                            )}
                            {visitor.phone && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Telefone:</span>
                                    <span className="text-sm">{visitor.phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tipo e Validade</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Tipo:</span>
                                <span className="text-sm font-medium">{visitor.type.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Validade:</span>
                                <span className="text-sm">
                                    {visitor.expires_at 
                                        ? new Date(visitor.expires_at).toLocaleDateString('pt-BR')
                                        : '-'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Status:</span>
                                <span className={`text-sm ${visitor.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                    {visitor.enabled ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Credenciais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {visitor.voucher ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Login:</span>
                                        <span className="text-sm font-mono">{visitor.voucher.login}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Expira em:</span>
                                        <span className="text-sm">
                                            {new Date(visitor.voucher.expires_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Email:</span>
                                        <span className={`text-sm ${visitor.email_sent ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {visitor.email_sent ? 'Enviado' : 'Pendente'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">Sem voucher criado</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Criado por</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Usuário:</span>
                                <span className="text-sm">{visitor.creator?.name ?? '-'}</span>
                            </div>
                            {visitor.creator?.department && (
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Departamento:</span>
                                    <span className="text-sm">{visitor.creator.department.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Criado em:</span>
                                <span className="text-sm">
                                    {new Date(visitor.created_at).toLocaleString('pt-BR')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}