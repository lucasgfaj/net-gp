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
import visitorTypes from '@/routes/visitorTypes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import { Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VisitorType {
    id: number;
    name: string;
}

interface PageProps {
    visitorTypes: {
        data: VisitorType[];
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

export default function VisitorTypesIndex() {
    const { props } = usePage<{ props: PageProps }>();
    const { visitorTypes: paginated, filters } = props;

    const [search, setSearch] = useState(filters?.search || '');
    const [typing, setTyping] = useState(false);

    const sort = filters?.sort || 'id';
    const direction = filters?.direction || 'desc';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tipos de Visitantes', href: visitorTypes.index.get().url },
    ];

    const liveSearch = debounce((value: string) => {
        router.get(
            visitorTypes.index.get().url,
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
            visitorTypes.index.get().url,
            { search, sort: column, direction: newDirection },
            { preserveState: false },
        );
    };

    const items = paginated.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de Visitantes" />

            <div className="flex flex-col gap-4 p-4 sm:p-6">
                <div className="flex justify-between gap-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setTyping(true);
                            }}
                        />
                        <Button onClick={() => liveSearch.flush()}>
                            Buscar
                        </Button>
                    </div>

                    <Link href={visitorTypes.create.get().url}>
                        <Button>Criar Tipo</Button>
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead
                                    onClick={() => handleSort('name')}
                                    className="cursor-pointer"
                                >
                                    Nome
                                </TableHead>
                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {items.map((d, index: number) => (
                                <TableRow key={d.id}>
                                    <TableCell>
                                        {paginated.from + index}
                                    </TableCell>
                                    <TableCell>{d.name}</TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Link
                                            href={
                                                visitorTypes.edit({
                                                    visitorType: d.id,
                                                }).url
                                            }
                                        >
                                            <Button variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <ConfirmDialog
                                            onConfirm={() =>
                                                router.delete(
                                                    visitorTypes.destroy(d.id)
                                                        .url,
                                                    { preserveScroll: true },
                                                )
                                            }
                                            title="Excluir Tipo"
                                            description={`Tem certeza que deseja excluir "${d.name}"?`}
                                            trigger={
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
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