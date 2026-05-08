import { ConfirmDialog } from "@/components/confrm-dialog";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import VisitorsFilters from "@/components/visitors/visitors-filters";
import AppLayout from "@/layouts/app-layout";
import visitors from "@/routes/visitors";
import visitorImports from "@/routes/visitors/import/index";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import debounce from "lodash.debounce";
import { Edit, Trash2, SlidersHorizontal, FileSpreadsheet } from "lucide-react";
import { shortenName } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function VisitorsIndex() {
    const { props }: any = usePage();
    const { visitors: paginated, filters, types } = props;

    const [search, setSearch] = useState(filters?.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [typing, setTyping] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(filters || {});

    const sort = filters?.sort || "id";
    const direction = filters?.direction || "desc";

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Visitantes", href: visitors.index.get().url },
    ];

    const liveSearch = debounce((value: string) => {
        setCurrentFilters(!!currentFilters)
        router.get(
            visitors.index.get().url,
            { ...currentFilters, search: value },
            { preserveState: false, preserveScroll: true }
        );
        setTyping(false);
    }, 300);

    useEffect(() => {
        if (typing) liveSearch(search);
    }, [search]);

    useEffect(() => {
        const hasExpiringSoon = paginated?.data?.some((v: any) => {
            if (!v.expires_at) return false;
            const daysUntilExpiry = (new Date(v.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
        });
        
        if (!hasExpiringSoon) {
            return;
        }
        
        const interval = setInterval(() => {
            router.reload({ only: ['visitors'] });
        }, 5000);
        return () => clearInterval(interval);
    }, [paginated?.data]);

    const handleSort = (column: string) => {
        const newDirection =
            sort === column && direction === "asc" ? "desc" : "asc";

        router.get(
            visitors.index.get().url,
            {
                ...currentFilters,
                search,
                sort: column,
                direction: newDirection,
            },
            { preserveState: false, preserveScroll: true }
        );
    };

    const handleFilterChange = (newFilters: any) => {
        setCurrentFilters(newFilters);
        router.get(visitors.index.get().url, newFilters, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const handleFilterClear = () => {
        setCurrentFilters({});
        router.get(visitors.index.get().url, {}, {
            preserveState: false,
            preserveScroll: true,
        });
        setSearch("");
    };

    const items = paginated.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Visitantes" />
            <Toaster />

            <div className="flex flex-col gap-4 p-4 sm:p-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    {/* BUSCA + BOTÃO FILTROS */}
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:w-auto">
                        <Input
                            placeholder="Pesquisar nome, email ou CPF..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setTyping(true);
                            }}
                            className="w-full sm:w-64"
                        />

                        <Button onClick={() => liveSearch.flush()}>Buscar</Button>

                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            {showFilters ? "Esconder filtros" : "Filtros"}
                        </Button>
                    </div>

                    {/* CRIAR + IMPORTAR */}
                    <div className="flex gap-2 mt-2 sm:mt-0">
                        <Link
                            href={visitorImports.index.url()}
                            className="w-full sm:w-auto"
                        >
                            <Button variant="outline" className="w-full sm:w-auto">
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Importação em Lote
                            </Button>
                        </Link>
                        <Link
                            href={visitors.create.get().url}
                            className="w-full sm:w-auto"
                        >
                            <Button className="w-full sm:w-auto">Criar Visitante</Button>
                        </Link>
                    </div>
                </div>

                {/* FILTROS EXPANDIDOS */}
                {showFilters && (
                    <VisitorsFilters
                        filters={currentFilters}
                        types={types}
                        onChange={handleFilterChange}
                        onClear={handleFilterClear}
                        userDepartmentId={props.user_department_id}
                        departments={props.departments}
                    />
                )}

                {/* TABELA */}
                <div className="overflow-x-auto rounded-xl border">
                    <Table className="min-w-[900px] w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead
                                    onClick={() => handleSort("name")}
                                    className="cursor-pointer select-none"
                                >
                                    Nome{" "}
                                    {sort === "name"
                                        ? direction === "asc"
                                            ? "↑"
                                            : "↓"
                                        : ""}
                                </TableHead>
                                <TableHead>CPF</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Criado por</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-6 text-center">
                                        Nenhum resultado encontrado.
                                    </TableCell>
                                </TableRow>
                            )}

                            {items.map((v: any, index: number) => (
                                <TableRow key={v.id}>
                                    <TableCell>{paginated.from + index}</TableCell>
                                    <TableCell>{shortenName(v.name)}</TableCell>
                                    <TableCell>{v.cpf}</TableCell>
                                    <TableCell>{v.email || "—"}</TableCell>
                                    <TableCell>{v.type?.name || "—"}</TableCell>
                                    <TableCell>{shortenName(v.creator?.name) || "—"}</TableCell>
                                    <TableCell>
                                        {new Date(v.created_at).toLocaleDateString("pt-BR")}
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Link href={visitors.edit({ visitor: v.id }).url}>
                                            <Button variant="outline" className="flex items-center gap-1">
                                                <Edit className="h-4 w-4" /> Editar
                                            </Button>
                                        </Link>

                                        <ConfirmDialog
                                            onConfirm={() =>
                                                router.delete(visitors.destroy(v.id).url, {
                                                    preserveScroll: true,
                                                    onSuccess: (page: any) => {
                                                        const success = page.props.flash?.success;
                                                        if (success) {
                                                            toast.success(success);
                                                        }
                                                    },
                                                    onError: (errors: any) => {
                                                        const firstError = Object.values(errors)[0];
                                                        if (firstError) {
                                                            toast.error(String(firstError));
                                                        }
                                                    },
                                                })
                                            }
                                            title="Excluir Visitante"
                                            description={`Tem certeza que deseja excluir "${v.name}"?`}
                                            trigger={
                                                <Button variant="destructive" className="flex items-center gap-1">
                                                    <Trash2 className="h-4 w-4" /> Excluir
                                                </Button>
                                            }
                                        />
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
