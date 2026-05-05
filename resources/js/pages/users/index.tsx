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
import UsersFilters from '@/components/users/users-filters';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import { Edit, Trash2, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UsersIndex() {
    const { props }: any = usePage();
    const { users: paginated, filters, departments } = props;

    const [search, setSearch] = useState(filters?.search || '');
    const [typing, setTyping] = useState(false);

    const [showFilters, setShowFilters] = useState(false);

    const sort = filters?.sort || 'id';
    const direction = filters?.direction || 'desc';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuários', href: users.index.get().url },
    ];

    const liveSearch = debounce((value: string) => {
        router.get(
            users.index.get().url,
            {
                ...filters,
                search: value,
            },
            { preserveState: false, preserveScroll: true },
        );
        setTyping(false);
    }, 300);

    useEffect(() => {
        if (typing) liveSearch(search);
    }, [search]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['users'] });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSort = (column: string) => {
        const newDirection =
            sort === column && direction === 'asc' ? 'desc' : 'asc';

        router.get(
            users.index.get().url,
            {
                ...filters,
                search,
                sort: column,
                direction: newDirection,
            },
            { preserveState: false, preserveScroll: true },
        );
    };

    const items = paginated.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuários" />

            <div className="flex flex-col gap-4 p-4 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        
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

                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            {showFilters ? 'Esconder filtros' : 'Filtros'}
                        </Button>
                    </div>

                    {/* <Link
                        href={users.create.get().url}
                        className="mt-2 w-full sm:mt-0 sm:w-auto"
                    >
                        <Button className="w-full sm:w-auto">
                            Criar Usuário
                        </Button>
                    </Link> */}
                </div>

                {showFilters && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <UsersFilters
                            filters={filters}
                            departments={departments}
                            onChange={(newFilters) => {
                                router.get('/users', newFilters, {
                                    preserveState: false,
                                    preserveScroll: true,
                                });
                            }}
                            onClear={() => {
                                router.get('/users', {}, {
                                    preserveState: false,
                                    preserveScroll: true,
                                });
                            }}
                        />
                    </div>
                )}

                <div className="overflow-x-auto rounded-xl border">
                    <Table className="min-w-[600px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>

                                <TableHead
                                    onClick={() => handleSort('name')}
                                    className="cursor-pointer select-none"
                                >
                                    Nome{' '}
                                    {filters?.sort === 'name'
                                        ? filters?.direction === 'asc'
                                            ? '↑'
                                            : '↓'
                                        : ''}
                                </TableHead>

                                <TableHead>E-mail</TableHead>
                                <TableHead>Departamento</TableHead>
                                <TableHead>Papel</TableHead>

                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-6 text-center"
                                    >
                                        Nenhum resultado encontrado.
                                    </TableCell>
                                </TableRow>
                            )}

                            {items.map((d: any, index: number) => (
                                <TableRow key={d.id}>
                                    <TableCell>
                                        {paginated.from + index}
                                    </TableCell>
                                    <TableCell>{d.name}</TableCell>
                                    <TableCell>{d.email}</TableCell>
                                    <TableCell>
                                        {d.department?.name || '—'}
                                    </TableCell>
                                    <TableCell>
                                        {d.role.charAt(0).toUpperCase() +
                                            d.role.slice(1)}
                                    </TableCell>

                                    <TableCell className="flex justify-end gap-2">
                                        <Link
                                            href={users.edit({ user: d.id }).url}
                                        >
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-1"
                                            >
                                                <Edit className="h-4 w-4" /> Visualizar
                                            </Button>
                                        </Link>

                                        {/* <ConfirmDialog
                                            onConfirm={() =>
                                                router.delete(
                                                    users.destroy(d.id).url,
                                                    { preserveScroll: true },
                                                )
                                            }
                                            title="Excluir Usuário"
                                            description={`Tem certeza que deseja excluir "${d.name}"?`}
                                            trigger={
                                                <Button
                                                    variant="destructive"
                                                    className="flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-4 w-4" /> Excluir
                                                </Button>
                                            }
                                        /> */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* PAGINAÇÃO */}
                {paginated && paginated.total > paginated.per_page && (
                    <Pagination links={paginated.links} />
                )}
            </div>
        </AppLayout>
    );
}
