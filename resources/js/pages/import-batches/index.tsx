import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/pagination';
import AppLayout from '@/layouts/app-layout';
import importBatches from '@/routes/import-batches';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Eye, FileSpreadsheet } from 'lucide-react';
import { useEffect } from 'react';
import { shortenName } from '@/lib/utils';

interface ImportBatch {
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
    batches: {
        data: ImportBatch[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Importações', href: importBatches.index.url() },
];

export default function ImportBatchesIndex() {
    const { props } = usePage<Props>();
    const { batches } = props;

    useEffect(() => {
        const hasProcessing = batches.data.some((b: ImportBatch) => b.status === 'processing');
        
        if (!hasProcessing) {
            return;
        }
        
        const interval = setInterval(() => {
            router.reload({ only: ['batches'] });
        }, 3000);
        return () => clearInterval(interval);
    }, [batches.data]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            completed: 'default',
            failed: 'destructive',
            processing: 'secondary',
            partial: 'outline',
            deleted: 'outline',
        };
        
        const labels: Record<string, string> = {
            completed: 'Concluído',
            failed: 'Falhou',
            processing: 'Processando',
            partial: 'Parcial',
            deleted: 'Excluído',
        };

        return (
            <Badge variant={variants[status] as 'default' | 'destructive' | 'secondary' | 'outline'}>
                {labels[status] || status}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Importações" />

            <div className="flex flex-col gap-4 p-4 sm:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold">Importações</h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie as importações de visitantes em lote
                    </p>
                </div>

                {/* Tabela */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table className="min-w-[600px] sm:min-w-[700px]">
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm">Arquivo</TableHead>
                                    <TableHead className="font-semibold text-center whitespace-nowrap text-xs sm:text-sm">Total</TableHead>
                                    <TableHead className="font-semibold text-center whitespace-nowrap text-xs sm:text-sm">Sucesso</TableHead>
                                    <TableHead className="font-semibold text-center whitespace-nowrap text-xs sm:text-sm">Erros</TableHead>
                                    <TableHead className="font-semibold text-center whitespace-nowrap text-xs sm:text-sm">Status</TableHead>
                                    <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm">Responsável</TableHead>
                                    <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm">Data</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                            Nenhuma importação encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    batches.data.map((batch) => (
                                        <TableRow key={batch.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">{batch.filename}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-sm">{batch.total_rows}</TableCell>
                                            <TableCell className="text-center text-sm text-green-600 font-medium">{batch.success_count}</TableCell>
                                            <TableCell className="text-center text-sm">
                                                <span className={batch.error_count > 0 ? 'text-red-600 font-medium' : ''}>
                                                    {batch.error_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(batch.status)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-[120px]">
                                                {shortenName(batch.creator?.name ?? '') || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                {new Date(batch.created_at).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={importBatches.show.url({ batch: batch.id })}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Paginação */}
                <Pagination links={batches.links} />

                {/* Mensagem vazia */}
                {batches.data.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma importação realizada</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}