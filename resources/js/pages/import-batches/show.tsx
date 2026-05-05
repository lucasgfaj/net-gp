import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confrm-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import importBatches from '@/routes/import-batches';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { Trash2, Mail, MailOpen, ArrowLeft, FileSpreadsheet, AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

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
    const { props, reload } = usePage<Props>();
    const { batch, visitors, errors } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Importações', href: importBatches.index.url() },
        { title: batch.filename, href: `/import-batches/${batch.id}` },
    ];

    useEffect(() => {
        if (batch.status === 'processing' || batch.status === 'partial') {
            const interval = setInterval(() => {
                reload();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [batch.status, reload]);

    const handleDeleteBatch = () => {
        if (confirm('Tem certeza que deseja excluir este lote? Todos os visitantes serão removidos.')) {
            router.delete(importBatches.destroy.url({ batch: batch.id }));
        }
    };

return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Importação: ${batch.filename}`} />

            <div className="container mx-auto py-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href={importBatches.index.url()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                {batch.filename}
                                {(batch.status === 'processing' || batch.status === 'partial') && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {new Date(batch.created_at).toLocaleDateString('pt-BR')} • {batch.creator?.name}
                            </p>
                        </div>
                    </div>
                    <ConfirmDialog
                        title="Excluir Lote"
                        description="Todos os visitantes e vouchers serão removidos."
                        onConfirm={handleDeleteBatch}
                    >
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </Button>
                    </ConfirmDialog>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card className="py-3">
                        <CardContent className="py-0">
                            <div className="text-2xl font-bold">{batch.total_rows}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardContent className="py-0">
                            <div className="text-2xl font-bold text-green-600">{batch.success_count}</div>
                            <div className="text-xs text-muted-foreground">Sucesso</div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardContent className="py-0">
                            <div className="text-2xl font-bold text-red-600">{batch.error_count}</div>
                            <div className="text-xs text-muted-foreground">Erros</div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardContent className="py-0">
                            <Badge variant={batch.status === 'completed' ? 'default' : batch.status === 'failed' ? 'destructive' : 'secondary'}>
                                {batch.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">Status</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Erros */}
                    {errors.length > 0 && (
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    Erros ({errors.length})
                                </CardTitle>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold w-16">Linha</TableHead>
                                        <TableHead className="font-semibold">Erro</TableHead>
                                        <TableHead className="font-semibold">Dados</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {errors.map((error) => (
                                        <TableRow key={error.id}>
                                            <TableCell className="font-mono text-sm">{error.line_number}</TableCell>
                                            <TableCell className="text-sm text-red-600">{error.error_message}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground font-mono">
                                                {error.row_data ? error.row_data.join(' | ') : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}

                    {/* Visitantes */}
                    <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-base">Visitantes ({visitors.total})</CardTitle>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Nome</TableHead>
                                <TableHead className="font-semibold w-32">CPF</TableHead>
                                <TableHead className="font-semibold">Email</TableHead>
                                <TableHead className="font-semibold w-24">Tipo</TableHead>
                                <TableHead className="font-semibold w-24">Validade</TableHead>
                                <TableHead className="font-semibold w-24">Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visitors.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                        Nenhum visitante importado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visitors.data.map((visitor) => (
                                    <TableRow key={visitor.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium text-sm">{visitor.name}</TableCell>
                                        <TableCell className="font-mono text-sm">{visitor.cpf}</TableCell>
                                        <TableCell className="text-sm truncate max-w-[150px]">{visitor.email ?? '-'}</TableCell>
                                        <TableCell className="text-sm">{visitor.type.name}</TableCell>
                                        <TableCell className="text-sm">
                                            {visitor.expires_at ? new Date(visitor.expires_at).toLocaleDateString('pt-BR') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {visitor.email_sent ? (
                                                <span className="text-xs text-green-600">Enviado</span>
                                            ) : visitor.email ? (
                                                <span className="text-xs text-yellow-600">Pendente</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}