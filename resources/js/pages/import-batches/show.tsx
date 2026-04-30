import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confrm-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Trash2, CheckCircle, XCircle, Mail, MailOpen, AlertTriangle } from 'lucide-react';

interface Visitor {
    id: number;
    name: string;
    cpf: string;
    email: string | null;
    phone: string | null;
    expires_at: string;
    email_sent: boolean;
    email_sent_at: string | null;
    type: {
        id: number;
        name: string;
    };
}

interface ImportError {
    id: number;
    line_number: number;
    error_message: string;
    row_data: string[];
    created_at: string;
}

interface Batch {
    id: number;
    filename: string;
    total_rows: number;
    success_count: number;
    error_count: number;
    status: string;
    created_at: string;
    creator?: {
        id: number;
        name: string;
    };
}

interface Props {
    batch: Batch;
    visitors: {
        data: Visitor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    errors: ImportError[];
}

export default function ImportBatchShow() {
    const { props } = usePage<Props>();
    const { batch, visitors, errors } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Importações', href: '/import-batches' },
        { title: batch.filename, href: `/import-batches/${batch.id}` },
    ];

    const handleDeleteBatch = () => {
        if (confirm('Tem certeza que deseja excluir este lote? Todos os visitantes serão removidos.')) {
            router.delete(route('import-batches.destroy', batch.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Importação: ${batch.filename}`} />

            <div className="container mx-auto py-6">
                <div className="flex flex-col gap-4">
                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{batch.filename}</h1>
                            <p className="text-muted-foreground">
                                Importação realizada em {new Date(batch.created_at).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.get(route('import-batches.index'))}>
                                Voltar
                            </Button>
                            <ConfirmDialog
                                title="Excluir Lote"
                                description="Tem certeza que deseja excluir este lote? Todos os visitantes e vouchers serão removidos permanentemente."
                                onConfirm={handleDeleteBatch}
                            >
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir Lote
                                </Button>
                            </ConfirmDialog>
                        </div>
                    </div>

                    {/* ESTATÍSTICAS */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{batch.total_rows}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Processados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{batch.success_count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Erros</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{batch.error_count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{batch.status}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ERROS */}
                    {errors.length > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    Erros na Importação ({errors.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Linha</TableHead>
                                            <TableHead>Erro</TableHead>
                                            <TableHead>Dados</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {errors.map((error) => (
                                            <TableRow key={error.id} className="bg-red-50">
                                                <TableCell className="font-mono">{error.line_number}</TableCell>
                                                <TableCell className="text-red-700">{error.error_message}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {error.row_data ? error.row_data.join(', ') : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {/* TABELA DE VISITANTES */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Visitantes Importados ({visitors.total})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>CPF</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Validade</TableHead>
                                        <TableHead>Email Enviado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visitors.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Nenhum visitante encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        visitors.data.map((visitor) => (
                                            <TableRow key={visitor.id}>
                                                <TableCell className="font-medium">{visitor.name}</TableCell>
                                                <TableCell className="font-meno">{visitor.cpf}</TableCell>
                                                <TableCell>{visitor.email ?? '-'}</TableCell>
                                                <TableCell>{visitor.type.name}</TableCell>
                                                <TableCell>
                                                    {visitor.expires_at
                                                        ? new Date(visitor.expires_at).toLocaleDateString('pt-BR')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {visitor.email_sent ? (
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <MailOpen className="h-4 w-4" />
                                                            Enviado
                                                        </div>
                                                    ) : visitor.email ? (
                                                        <div className="flex items-center gap-1 text-yellow-600">
                                                            <Mail className="h-4 w-4" />
                                                            Pendente
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Sem email</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}