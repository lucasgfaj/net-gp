import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface VouchersFiltersProps {
    filters: Record<string, unknown>;
    creators: Array<{ id: number; name: string }>;
    onChange: (filters: Record<string, unknown>) => void;
    onClear: () => void;
    isAdmin: boolean;
    departments: Array<{ id: number; name: string }>;
}

export default function VouchersFilters({
    filters,
    creators,
    onChange,
    onClear,
    isAdmin,
    departments,
}: VouchersFiltersProps) {
    const [creatorId, setCreatorId] = useState(filters?.creator_id ?? "all");
    const [orderExpire, setOrderExpire] = useState(filters?.expire_sort ?? "none");
    const [orderCreated, setOrderCreated] = useState(filters?.created_sort ?? "none");
    const [orderDepartment, setOrderDepartment] = useState(
        filters?.order_department ?? "none"
    );

    function applyFilters() {
        const params: Record<string, unknown> = {};

        if (creatorId !== "all") params.creator_id = creatorId;
        if (orderExpire !== "none") params.expire_sort = orderExpire;
        if (orderCreated !== "none") params.created_sort = orderCreated;
        if (isAdmin && orderDepartment !== "none") {
            params.order_department = orderDepartment;
        }

        onChange(params);
    }

    function clearFilters() {
        setCreatorId("all");
        setOrderExpire("none");
        setOrderCreated("none");
        setOrderDepartment("none");
        onClear();
    }

    return (
        <div className="mt-4 border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* CRIADOR */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Criado por</label>
                <Select value={creatorId} onValueChange={setCreatorId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Criador" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {creators.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* EXPIRAÇÃO */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">Expiração</label>
                <Select value={orderExpire} onValueChange={setOrderExpire}>
                    <SelectTrigger>
                        <SelectValue placeholder="Expiração" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="closest">Mais próximo</SelectItem>
                        <SelectItem value="furthest">Mais distante</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* CADASTRO */}
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
            {isAdmin && (
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm">Departamento</label>
                    <Select value={orderDepartment} onValueChange={setOrderDepartment}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Todos</SelectItem>
                            {departments.map((d) => (
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
