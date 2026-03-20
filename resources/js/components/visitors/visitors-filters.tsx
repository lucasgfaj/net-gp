import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface VisitorsFiltersProps {
    filters: any;
    types: Array<{ id: number; name: string }>;
    onChange: (filters: any) => void;
    onClear: () => void;
    userDepartmentId: number;
    departments: any;
}

export default function VisitorsFilters({
    filters,
    types,
    onChange,
    onClear,
    userDepartmentId,
    departments,
}: VisitorsFiltersProps) {
    const [typeId, setTypeId] = useState(filters?.type_id ?? "all");
    const [orderName, setOrderName] = useState(filters?.order_name ?? "none");
    const [orderCreated, setOrderCreated] = useState(
        filters?.order_created ?? "none"
    );
    const [orderDepartment, setOrderDepartment] = useState(
        filters?.order_department ?? "none"
    );

    function applyFilters() {
        const params: any = {};

        if (typeId !== "all") {
            params.type_id = typeId;
        }

        if (orderName !== "none") {
            params.order_name = orderName;
        }

        if (orderCreated !== "none") {
            params.order_created = orderCreated;
        }

        if (userDepartmentId === 1 && orderDepartment !== "none") {
            params.order_department = orderDepartment;
        }

        onChange(params);
    }

    function clearFilters() {
        setTypeId("all");
        setOrderName("none");
        setOrderCreated("none");
        setOrderDepartment("none");
        onClear();
    }

    return (
        <div className="mt-4 border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* TIPO */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Tipo</label>
                <Select value={typeId} onValueChange={setTypeId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {types.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* NOME */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Ordenar por Nome</label>
                <Select value={orderName} onValueChange={setOrderName}>
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

            {/* DATA */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Cadastro</label>
                <Select value={orderCreated} onValueChange={setOrderCreated}>
                    <SelectTrigger>
                        <SelectValue placeholder="Cadastro" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="newest">Mais novos</SelectItem>
                        <SelectItem value="oldest">Mais antigos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* DEPARTAMENTO */}
            {userDepartmentId === 1 && (
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm">Departamento</label>
                    <Select
                        value={orderDepartment}
                        onValueChange={setOrderDepartment}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Todos</SelectItem>
                            {departments.map((d: any) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* AÇÕES */}
            <div className="flex gap-2 sm:col-span-3">
                <Button variant="outline" onClick={clearFilters}>
                    Limpar
                </Button>
                <Button onClick={applyFilters}>Aplicar</Button>
            </div>
        </div>
    );
}
