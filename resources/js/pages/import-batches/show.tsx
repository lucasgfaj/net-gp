import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confrm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import importBatches from '@/routes/import-batches';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { shortenName } from '@/lib/utils';
import { Trash2, ArrowLeft, FileSpreadsheet, RefreshCw, Pencil, SkipForward, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    skipped: boolean;
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

interface VisitorType {
    id: number;
    name: string;
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
    importErrors: ImportError[];
    types: VisitorType[];
    [key: string]: unknown;
}

export default function ImportBatchShow() {
    const { props } = usePage<Props>();
    const { batch, visitors, importErrors, types } = props;
    const validationErrors = usePage().props.errors as Record<string, string>;
    const [editingError, setEditingError] = useState<ImportError | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', cpf: '', email: '', phone: '', reason: '', expires_at: '', type_id: '' });

    const openEdit = (error: ImportError) => {
        setEditForm({
            name: error.row_data?.[0] ?? '',
            cpf: error.row_data?.[1] ?? '',
            email: error.row_data?.[2] ?? '',
            phone: error.row_data?.[3] ?? '',
            reason: error.row_data?.[4] ?? '',
            expires_at: error.row_data?.[5] ?? '',
            type_id: String(types?.[0]?.id ?? ''),
        });
        setEditingError(error);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingError) return;
        router.put(`/import-errors/${editingError.id}`, editForm, {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Importações', href: importBatches.index.url() },
        { title: batch.filename, href: `/import-batches/${batch.id}` },
    ];

    useEffect(() => {
        if (batch.status === 'processing') {
            const interval = setInterval(() => {
                router.reload({ only: ['batch', 'visitors', 'importErrors'] });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [batch.status]);

    const handleDeleteBatch = () => {
        setDeleting(true);
        router.delete(importBatches.destroy.url({ batch: batch.id }), {
            onFinish: () => setDeleting(false),
        });
    };

return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Importação: ${batch.filename}`} />

            <div className="flex flex-col gap-4 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={importBatches.index.url()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 shrink-0" />
                                <span className="truncate max-w-[150px] sm:max-w-[300px]">{batch.filename}</span>
                                {batch.status === 'processing' && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {new Date(batch.created_at).toLocaleDateString('pt-BR')} • {shortenName(batch.creator?.name ?? '')}
                            </p>
                        </div>
                    </div>
                    {batch.status !== 'deleted' && (
                        <ConfirmDialog
                            title="Excluir Lote"
                            description="Todos os visitantes e vouchers serão removidos."
                            onConfirm={handleDeleteBatch}
                            trigger={
                                <Button variant="destructive" size="sm" disabled={deleting}>
                                    {deleting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    <span>{deleting ? 'Excluindo...' : 'Excluir'}</span>
                                </Button>
                            }
                        />
                    )}
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
                            <Badge variant={batch.status === 'completed' ? 'default' : batch.status === 'failed' ? 'destructive' : 'secondary'} className="whitespace-nowrap text-xs">
                                {batch.status === 'completed' ? 'Completo' : batch.status === 'processing' ? 'Processando' : batch.status === 'failed' ? 'Falhou' : batch.status === 'deleted' ? 'Deletado' : batch.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">Status</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Erros */}
                    {importErrors.length > 0 && (
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    Erros ({importErrors.length})
                                </CardTitle>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold w-16">Linha</TableHead>
                                        <TableHead className="font-semibold">Erro</TableHead>
                                        <TableHead className="font-semibold">Dados</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {importErrors.map((error) => (
                                        <TableRow key={error.id} className={error.skipped ? 'opacity-60' : ''}>
                                            <TableCell className="font-mono text-sm">{error.line_number}</TableCell>
                                            <TableCell className="text-sm">
                                                {error.skipped ? (
                                                    <Badge variant="secondary">Pulado</Badge>
                                                ) : (
                                                    <span className="text-red-600">{error.error_message}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground font-mono truncate max-w-[200px]">
                                                {error.row_data ? error.row_data.join(' | ') : '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {error.skipped ? (
                                                    <span className="text-xs text-muted-foreground">Pulado</span>
                                                ) : (
                                                    <div className="flex justify-center gap-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(error)}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Editar erro</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.post(`/import-errors/${error.id}/skip`, {}, { preserveScroll: true })}>
                                                                        <SkipForward className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Pular erro</TooltipContent>
                                                            </Tooltip>
                                                            <ConfirmDialog
                                                                title="Remover Erro"
                                                                description="Tem certeza que deseja remover este erro?"
                                                                onConfirm={() => { router.delete(`/import-errors/${error.id}`); }}
                                                                trigger={
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Deletar erro</TooltipContent>
                                                                    </Tooltip>
                                                                }
                                                            />
                                                        </TooltipProvider>
                                                    </div>
                                                )}
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
                                        <TableCell className="font-medium text-sm">{shortenName(visitor.name)}</TableCell>
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
            {/* Modal de edição de erro */}
            <Dialog open={!!editingError} onOpenChange={(open) => !open && setEditingError(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Registro</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        {validationErrors?.edit_error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                {validationErrors.edit_error}
                            </div>
                        )}
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input id="cpf" value={editForm.cpf} onChange={e => setEditForm(f => ({ ...f, cpf: e.target.value }))} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reason">Motivo</Label>
                                <Input id="reason" value={editForm.reason} onChange={e => setEditForm(f => ({ ...f, reason: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipo</Label>
                                <Select value={editForm.type_id} onValueChange={v => setEditForm(f => ({ ...f, type_id: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types?.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="expires_at">Expira em</Label>
                                <Input id="expires_at" type="date" value={editForm.expires_at} onChange={e => setEditForm(f => ({ ...f, expires_at: e.target.value }))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingError(null)}>Cancelar</Button>
                            <Button type="submit">Salvar e Reenviar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}