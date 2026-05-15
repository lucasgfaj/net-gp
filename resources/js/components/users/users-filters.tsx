import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface UsersFiltersProps {
    filters: Record<string, unknown>;
    departments: Array<{ id: number; name: string }>;
    onChange: (filters: Record<string, unknown>) => void;
    onClear: () => void;
}

export default function UsersFilters({
    filters,
    departments = [],
    onChange,
    onClear,
}: UsersFiltersProps) {
    const [search, setSearch] = useState(filters?.search ?? "");
    const [departmentId, setDepartmentId] = useState(
        filters?.department_id ?? "all"
    );
    const [orderName, setOrderName] = useState(
        filters?.order_name ?? "none"
    );
    const [orderCreated, setOrderCreated] = useState(
        filters?.order_created ?? "none"
    );

    function applyFilters() {
        const params: Record<string, unknown> = {};

        if (search.trim().length > 0) {
            params.search = search.trim();
        }

        if (departmentId !== "all") {
            params.department_id = departmentId;
        }

        if (orderName !== "none") {
            params.order_name = orderName;
        }

        if (orderCreated !== "none") {
            params.order_created = orderCreated;
        }

        onChange(params);
    }

    function clearFilters() {
        setSearch("");
        setDepartmentId("all");
        setOrderName("none");
        setOrderCreated("none");
        onClear();
    }

    return (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200 border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* BUSCA */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Buscar</label>
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nome ou email"
                />
            </div>

            {/* DEPARTAMENTO */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Departamento</label>
                <Select
                    value={departmentId}
                    onValueChange={setDepartmentId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {departments.map((d) => (
                            <SelectItem
                                key={d.id}
                                value={String(d.id)}
                            >
                                {d.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ORDENAR POR NOME */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Ordenar por Nome</label>
                <Select
                    value={orderName}
                    onValueChange={setOrderName}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Nome" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="asc">A → Z</SelectItem>
                        <SelectItem value="desc">Z → A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* ORDENAR POR DATA */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Ordenar por Data</label>
                <Select
                    value={orderCreated}
                    onValueChange={setOrderCreated}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Data" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="newest">Mais novos</SelectItem>
                        <SelectItem value="oldest">Mais antigos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* AÇÕES */}
            <div className="flex gap-2 sm:col-span-3">
                <Button variant="outline" onClick={clearFilters}>
                    Limpar
                </Button>
                <Button onClick={applyFilters}>
                    Aplicar
                </Button>
            </div>
        </div>
    );
}
