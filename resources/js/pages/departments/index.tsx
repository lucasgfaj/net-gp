import { ConfirmDialog } from '@/components/confrm-dialog';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import departments from '@/routes/departments';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import { Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Department {
    id: number;
    name: string;
}

interface PageProps {
    departments: {
        data: Department[];
        from: number;
        total: number;
        per_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export default function DepartmentsIndex() {
    const { props } = usePage<{ props: PageProps }>();
    const { departments: paginated, filters } = props;

    const [search, setSearch] = useState(filters?.search || '');
    const [typing, setTyping] = useState(false);

    const sort = filters?.sort || 'id';
    const direction = filters?.direction || 'desc';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Departamentos', href: departments.index.get().url },
    ];

    const liveSearch = debounce((value: string) => {
        router.get(
            departments.index.get().url,
            { search: value, sort, direction },
            { preserveState: false },
        );
        setTyping(false);
    }, 300);

    useEffect(() => {
        if (typing) liveSearch(search);
    }, [search, typing, liveSearch]);

    const handleSort = (column: string) => {
        const newDirection =
            sort === column && direction === 'asc' ? 'desc' : 'asc';
        router.get(
            departments.index.get().url,
            { search, sort: column, direction: newDirection },
            { preserveState: false},
        );
    };

    const items = paginated.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departamentos" />

            <div className="flex flex-col gap-4 p-4 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Input
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setTyping(true);
                            }}
                            className="w-full sm:w-64"
                        />
                        <Button onClick={() => liveSearch.flush()}>
                            Buscar
                        </Button>
                    </div>

                    <Link
                        href={departments.create.get().url}
                        className="mt-2 w-full sm:mt-0 sm:w-auto"
                    >
                        <Button className="w-full sm:w-auto">
                            Criar Departamento
                        </Button>
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <Table className="min-w-[500px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead
                                    onClick={() => handleSort('name')}
                                    className="cursor-pointer select-none"
                                >
                                    Nome{' '}
                                    {sort === 'name'
                                        ? direction === 'asc'
                                            ? ' ↑'
                                            : ' ↓'
                                        : ''}
                                </TableHead>
                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="py-6 text-center"
                                    >
                                        Nenhum resultado encontrado.
                                    </TableCell>
                                </TableRow>
                            )}

                            {items.map((d, index: number) => (
                                <TableRow key={d.id}>
                                    <TableCell>
                                        {paginated.from + index}
                                    </TableCell>
                                    <TableCell>{d.name}</TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Link
                                            href={
                                                departments.edit({
                                                    department: d.id,
                                                }).url
                                            }
                                            className="hidden sm:flex"
                                        >
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-1"
                                            >
                                                <span>Editar</span>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <Link
                                            href={
                                                departments.edit({
                                                    department: d.id,
                                                }).url
                                            }
                                            className="sm:hidden"
                                        >
                                            <Button
                                                variant="outline"
                                                size="icon"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <ConfirmDialog
                                            onConfirm={() =>
                                                router.delete(
                                                    departments.destroy(d.id)
                                                        .url,
                                                    { preserveScroll: true },
                                                )
                                            }
                                            title="Excluir Departamento"
                                            description={`Tem certeza que deseja excluir o departamento "${d.name}"?`}
                                            trigger={
                                                <Button
                                                    variant="destructive"
                                                    className="hidden gap-1 sm:flex"
                                                >
                                                    <span>Excluir</span>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            }
                                        />

                                        <ConfirmDialog
                                            onConfirm={() =>
                                                router.delete(
                                                    departments.destroy(d.id)
                                                        .url,
                                                    { preserveScroll: true },
                                                )
                                            }
                                            title="Excluir Departamento"
                                            description={`Tem certeza que deseja excluir o departamento "${d.name}"?`}
                                            trigger={
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="sm:hidden"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {paginated && paginated.total > paginated.per_page && (
                    <Pagination links={paginated.links} />
                )}
            </div>
        </AppLayout>
    );
}
