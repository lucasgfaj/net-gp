import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Form, Head, Link } from '@inertiajs/react';
import visitorImports from '@/routes/visitors/import/index';
import visitors from '@/routes/visitors';
import { type BreadcrumbItem } from '@/types';
import { FileUp, Download, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface VisitorImportProps {
    types: Array<{ id: number; name: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Visitantes', href: visitors.index.get().url },
    { title: 'Importar', href: '/visitors/import' },
];

export default function VisitorImport({ types }: VisitorImportProps) {
    const [expiresAt] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    });

    const downloadExample = () => {
        const data = [
            ['nome', 'cpf', 'email', 'telefone', 'motivo'],
            ['joao silva', '12345678901', 'joao@email.com', '41999999999', 'Evento'],
            ['maria santos', '98765432100', 'maria@email.com', '41988888899', 'Palestra'],
            ['pedro costa', '45612378901', 'pedro@email.com', '41988888888', 'Visita'],
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Visitantes');
        XLSX.writeFile(wb, 'modelo.xlsx');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Importar Visitantes" />

            <div className="container mx-auto py-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href={visitors.index.get().url}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Importar Visitantes</h1>
                            <p className="text-sm text-muted-foreground">
                                Importe visitantes em lote através de arquivo CSV ou Excel
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={downloadExample}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Baixar Modelo XLSX
                    </Button>
                </div>

                {/* Formulário */}
                <Card className="mb-6">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Padrões para os Visitantes</CardTitle>
                        <CardDescription>
                            Estes valores serão aplicados a todos os visitantes do arquivo quando não informados no CSV
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action={visitorImports.store.url()}
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="file" className="text-sm font-medium">
                                        Arquivo <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        className="cursor-pointer"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Formatos aceitos: CSV, XLSX, XLS
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="type_id" className="text-sm font-medium">
                                        Tipo de Visitante
                                    </Label>
                                    <Select name="type_id" defaultValue="3">
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((type) => (
                                                <SelectItem key={type.id} value={String(type.id)}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Tipo padrão quando não informado no CSV
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="expires_at" className="text-sm font-medium">
                                        Data de Validade
                                    </Label>
                                    <Input
                                        id="expires_at"
                                        name="expires_at"
                                        type="date"
                                        defaultValue={expiresAt}
                                        className="w-full"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Data padrão quando não informada no CSV
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" className="min-w-[200px]">
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Importar Visitantes
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>

                {/* Tabela de exemplo */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Formato do Arquivo</CardTitle>
                        <CardDescription>
                            O arquivo deve conter cabeçalho com os nomes das colunas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Coluna</TableHead>
                                        <TableHead className="font-semibold">Obrigatório</TableHead>
                                        <TableHead className="font-semibold">Descrição</TableHead>
                                        <TableHead className="font-semibold">Exemplo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">nome</TableCell>
                                        <TableCell><span className="text-red-500">Sim</span></TableCell>
                                        <TableCell>Nome completo do visitante</TableCell>
                                        <TableCell className="text-muted-foreground">João Silva</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">cpf</TableCell>
                                        <TableCell><span className="text-red-500">Sim</span></TableCell>
                                        <TableCell>CPF (somente números, 11 dígitos)</TableCell>
                                        <TableCell className="text-muted-foreground">12345678901</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">email</TableCell>
                                        <TableCell><span className="text-red-500">Sim</span></TableCell>
                                        <TableCell>Email do visitante (para enviar login/senha)</TableCell>
                                        <TableCell className="text-muted-foreground">joao@email.com</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">telefone</TableCell>
                                        <TableCell><span className="text-muted-foreground">Não</span></TableCell>
                                        <TableCell>Telefone com DDD</TableCell>
                                        <TableCell className="text-muted-foreground">41999999999</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">motivo</TableCell>
                                        <TableCell><span className="text-muted-foreground">Não</span></TableCell>
                                        <TableCell>Nome do evento ou motivo da visita</TableCell>
                                        <TableCell className="text-muted-foreground">Evento IEEE, Palestra</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-medium mb-2">Validações automático:</h4>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    CPF válido matematicamente
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    CPF único no sistema
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Email único no sistema
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Tipo automaticamente mapeado
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Processamento em background
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}