import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, FileSpreadsheet, CheckCircle, XCircle, Clock } from 'lucide-react';

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
    };
}

export default function ImportBatchesIndex() {
    const { props } = usePage<Props>();
    const { batches } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Importações', href: '/import-batches' },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'processing':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Concluído';
            case 'failed':
                return 'Falhou';
            case 'processing':
                return 'Processando';
            default:
                return status;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Importações em Lote" />

            <div className="container mx-auto py-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Importações em Lote</h1>
                            <p className="text-muted-foreground">
                                Visualize e gerencie as importações de visitantes via CSV
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Arquivo</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Sucesso</TableHead>
                                        <TableHead>Erros</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Criado por</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                Nenhuma importação encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        batches.data.map((batch) => (
                                            <TableRow key={batch.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <FileSpreadsheet className="h-4 w-4" />
                                                        {batch.filename}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{batch.total_rows}</TableCell>
                                                <TableCell className="text-green-600">{batch.success_count}</TableCell>
                                                <TableCell className="text-red-600">{batch.error_count}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(batch.status)}
                                                        {getStatusLabel(batch.status)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{batch.creator?.name ?? '-'}</TableCell>
                                                <TableCell>{new Date(batch.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                                <TableCell>
                                                    <Link href={route('import-batches.show', batch.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
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