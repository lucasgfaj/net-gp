import { ConfirmDialog } from '@/components/confrm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import visitors from '@/routes/visitors';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

interface Visitor {
    id: number;
    name: string;
    cpf: string;
    phone?: string;
    email?: string;
    type_id: number;
    school?: string;
    expires_at?: string;
    enabled: boolean;
}

export default function EditVisitor({ visitor, types }: { visitor: Visitor; types: Array<{ id: number; name: string }> }) {
    const { props } = usePage<{ flash: { success?: string; error?: string } }>();
    const flash = props.flash;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.success, flash.error]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Visitantes', href: visitors.index.get().url },
        { title: 'Editar', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: visitor.name,
        cpf: visitor.cpf,
        phone: visitor.phone || '',
        email: visitor.email || '',
        type_id: String(visitor.type_id),
        school: visitor.school || '',
        expires_at: visitor.expires_at ? visitor.expires_at.substring(0, 10) : '',
        enabled: visitor.enabled ? '1' : '0',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.expires_at) {
            toast.error("Informe uma data de expiração.");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(data.expires_at + "T00:00:00");

        if (selectedDate < today) {
            toast.error("A data de expiração não pode ser menor que hoje.");
            return;
        }

        put(visitors.update({ visitor: visitor.id }).url, {
            preserveScroll: true,
            onSuccess: (page) => {
                const success = page.props.flash?.success;
                if (success) {
                    toast.success(success);
                }
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(String(firstError));
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Visitante" />
            <Toaster />

            <div className="w-full max-w-4xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">Editar Visitante</h1>

                <form onSubmit={submit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <Label>Nome</Label>
                            <Input
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div>
                            <Label>CPF</Label>
                            <Input
                                value={data.cpf}
                                onChange={e => setData('cpf', e.target.value)}
                            />
                            {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf}</p>}
                        </div>

                        <div>
                            <Label>Telefone</Label>
                            <Input
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Tipo</Label>
                            <Select
                                value={data.type_id}
                                onValueChange={(value) => setData('type_id', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Observação</Label>
                            <Input
                                value={data.school}
                                onChange={e => setData('school', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Expira em</Label>
                            <Input
                                type="date"
                                value={data.expires_at}
                                onChange={e => setData('expires_at', e.target.value)}
                            />
                        </div>

                        

                    </div>

                    {/* ====================== */}
                    {/* VOUCHER SEMPRE VISÍVEL */}
                    {/* ====================== */}

                    {/* <div className="border p-4 rounded-lg mt-6">
                        <h2 className="font-semibold mb-3 text-lg">Voucher</h2>

                        {voucher ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Usuário</Label>
                                    <Input value={voucher.login} disabled />
                                </div>

                                <div>
                                    <Label>Senha</Label>
                                    <Input value={voucher.password} disabled />
                                </div>

                                <div>
                                    <Label>Criação</Label>
                                    <Input
                                        disabled
                                        value={
                                            voucher.created_at
                                                ? voucher.created_at.substring(0, 10)
                                                : ''
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-600 text-sm">
                                Nenhum voucher encontrado para este visitante.
                            </p>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                            O voucher é atualizado automaticamente quando a validade é modificada.
                        </p>
                    </div> */}
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={visitors.index.get().url}>Cancelar</Link>
                        </Button>
                        <Button disabled={processing} type="submit">Salvar</Button>
                        <ConfirmDialog
                            title="Gerar nova senha"
                            description="Deseja realmente gerar uma nova senha para este visitante?"
                            onConfirm={() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const selectedDate = new Date(data.expires_at + "T00:00:00");

                                if (!data.expires_at || selectedDate < today) {
                                    toast.error("Ajuste a data de expiração para hoje ou posterior.");
                                    return;
                                }

                                router.post(
                                    visitors.generatePassword({ visitor: visitor.id }).url,
                                    { preserveState: false }
                                );
                            }}
                            trigger={
                                <Button type="button" disabled={processing}>
                                    Nova Senha
                                </Button>
                            }
                        />
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
