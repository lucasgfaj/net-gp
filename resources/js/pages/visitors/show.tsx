import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import visitors from '@/routes/visitors';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { shortenName } from '@/lib/utils';
import { ArrowLeft, Edit, Mail, Calendar, Building, User, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

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
    const flash = props.flash;

    const handleResend = () => {
        console.log('CLICOU NO BOTÃO REENVIAR');
        router.post(
            visitors.resendPassword(visitor.id).url,
            { preserveState: false }
        );
    };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Visitantes', href: visitors.index.get().url },
        { title: shortenName(visitor.name), href: `/visitors/${visitor.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Visitante: ${shortenName(visitor.name)}`} />
            <Toaster />

            <div className="container mx-auto py-6 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href={visitors.index.get().url}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{shortenName(visitor.name)}</h1>
                            <p className="text-muted-foreground">Detalhes do visitante</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {visitor.email && (
                            <Button
                                variant="outline"
                                onClick={handleResend}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Reenviar
                            </Button>
                        )}
                        <Link href={visitors.edit.get(visitor.id)}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    </div>
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
                            {visitor.school && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Observação:</span>
                                    <span className="text-sm">{visitor.school}</span>
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