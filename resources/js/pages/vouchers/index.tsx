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
import VouchersFilters from "@/components/vouchers/vouchers-filters";
import AppLayout from "@/layouts/app-layout";
import visitors from "@/routes/visitors";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import debounce from "lodash.debounce";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

export default function VouchersIndex() {
    const { props }: any = usePage();
    const { vouchers: paginated, filters, creators } = props;

    const [search, setSearch] = useState(filters?.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [typing, setTyping] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(filters || {});

    const sort = filters?.sort || "id";
    const direction = filters?.direction || "desc";

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Vouchers", href: "/vouchers" },
    ];

    const liveSearch = debounce((value: string) => {
        router.get(
            "/vouchers",
            { ...currentFilters, search: value },
            { preserveState: false, preserveScroll: true }
        );
        setTyping(false);
    }, 300);

    useEffect(() => {
        if (typing) liveSearch(search);
    }, [search]);

    const handleSort = (column: string) => {
        const newDirection =
            sort === column && direction === "asc" ? "desc" : "asc";

        router.get(
            "/vouchers",
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
        router.get("/vouchers", newFilters, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const handleFilterClear = () => {
        setCurrentFilters({});
        router.get("/vouchers", {}, {
            preserveState: false,
            preserveScroll: true,
        });
        setSearch("");
    };

    const items = paginated.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vouchers" />

            <div className="flex flex-col gap-4 p-4 sm:p-6">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* BUSCA + FILTROS */}
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:w-auto">
                        <Input
                            placeholder="Pesquisar login, senha ou visitante..."
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
                            {showFilters ? "Esconder filtros" : "Filtros"}
                        </Button>
                    </div>
                </div>

                {/* FILTROS */}
                {showFilters && (
                    <VouchersFilters
                        filters={currentFilters}
                        creators={creators}
                        onChange={handleFilterChange}
                        onClear={handleFilterClear}
                        userDepartmentId={props.user_department_id}
                        departments={props.departments}
                    />
                )}

                {/* TABELA */}
                <div className="overflow-x-auto rounded-xl border">
                    <Table className="min-w-[900px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead
                                    onClick={() => handleSort("login")}
                                    className="cursor-pointer select-none"
                                >
                                    Login{" "}
                                    {sort === "login"
                                        ? direction === "asc"
                                            ? "↑"
                                            : "↓"
                                        : ""}
                                </TableHead>
                                {/* <TableHead>Senha</TableHead> */}
                                <TableHead>Visitante</TableHead>
                                <TableHead>Criado por</TableHead>
                                <TableHead>Departamento</TableHead>
                                <TableHead>Expira em</TableHead>
                                <TableHead>Ações</TableHead>

                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-6 text-center">
                                        Nenhum resultado encontrado.
                                    </TableCell>
                                </TableRow>
                            )}

                            {items.map((v: any, index: number) => (
                                <TableRow key={v.id}>
                                    <TableCell>{paginated.from + index}</TableCell>
                                    <TableCell>{v.login}</TableCell>
                                    {/* <TableCell>{v.password}</TableCell> */}
                                    <TableCell>{v.visitor?.name || "—"}</TableCell>
                                    <TableCell>{v.visitor?.creator?.name || "—"}</TableCell>
                                    <TableCell>{v.visitor?.creator?.department?.name || "—"}</TableCell>
                                    <TableCell>
                                        {v.expires_at
                                            ? new Date(v.expires_at).toLocaleDateString("pt-BR", {
                                                timeZone: "UTC",
                                            })
                                            : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <ConfirmDialog
                                            title="Gerar nova senha"
                                            description="Tem certeza que deseja reenviar o voucher para este visitante?"
                                            onConfirm={() =>
                                                router.post(
                                                    `/visitors/${v.visitor.id}/resend-password`,
                                                    {},
                                                    { preserveScroll: true }
                                                )
                                            }
                                            trigger={
                                                <Button type="button" disabled={!v.visitor?.email}>
                                                    Reenviar Voucher
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
                {paginated.total > paginated.per_page && (
                    <Pagination links={paginated.links} />
                )}
            </div>
        </AppLayout>
    );
}
