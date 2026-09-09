import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Key, Calendar, User, Building, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/confrm-dialog';

interface Voucher {
    id: number;
    login: string;
    expires_at: string;
    created_at: string;
    visitor?: {
        id: number;
        name: string;
        cpf: string;
        email: string;
        type?: {
            name: string;
        };
    };
    creator?: {
        name: string;
        department?: {
            name: string;
        };
    };
}

export default function VoucherShow() {
    const { props } = usePage<{ voucher: Voucher }>();
    const { voucher } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vouchers', href: '/vouchers' },
        { title: voucher.login, href: `/vouchers/${voucher.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Voucher: ${voucher.login}`} />

            <div className="container mx-auto py-6 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/vouchers">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{voucher.login}</h1>
                            <p className="text-muted-foreground">Detalhes do voucher</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <ConfirmDialog
                            title="Excluir voucher"
                            description="Tem certeza que deseja excluir este voucher? Esta ação irá remover o usuário do Samba."
                            onConfirm={() =>
                                router.delete(`/vouchers/${voucher.id}`, { preserveState: false })
                            }
                            trigger={
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                </Button>
                            }
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Credenciais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Login:</span>
                                <span className="text-sm font-mono font-medium">{voucher.login}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Expira em:</span>
                                <span className="text-sm">
                                    {new Date(voucher.expires_at).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {voucher.visitor && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Visitante</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Nome:</span>
                                    <Link href={`/visitors/${voucher.visitor.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                        {voucher.visitor.name}
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">CPF:</span>
                                    <span className="text-sm font-mono">{voucher.visitor.cpf}</span>
                                </div>
                                {voucher.visitor.type && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Tipo:</span>
                                        <span className="text-sm">{voucher.visitor.type.name}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {voucher.creator && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Criado por</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Usuário:</span>
                                    <span className="text-sm">{voucher.creator.name}</span>
                                </div>
                                {voucher.creator.department && (
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Departamento:</span>
                                        <span className="text-sm">{voucher.creator.department.name}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
