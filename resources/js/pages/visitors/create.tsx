import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/helper';
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
import { maskCPF, maskPhone } from '@/utils/masks';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';


export default function CreateVisitor({ types }: any) {

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Visitantes', href: visitors.index.get().url },
        { title: 'Criar', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        type_id: types.length ? String(types[0].id) : '',
        school: '',
        expires_at: '',
        enabled: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.expires_at) {
            toast("Informe uma data de expiração.");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(data.expires_at + "T00:00:00");

        if (selectedDate < today) {
            toast("A data de expiração não pode ser menor que hoje.");
            return;
        }

        post(visitors.store.post().url);
    };

    useEffect(() => {
        const firstErrorField = Object.keys(errors)[0];
        if (!firstErrorField) return;

        const el = document.querySelector(
            `[name="${firstErrorField}"]`,
        ) as HTMLElement | null;

        el?.focus();
    }, [errors]);

    const generatedLogin = data.cpf ? data.cpf.replace(/\D/g, '') : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Visitante" />

            <div className="w-full p-4 md:p-6">
                <h1 className="mb-6 text-2xl font-semibold">Criar Visitante</h1>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                        <div>
                            <Label>Nome</Label>
                            <Input
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                               placeholder="Nome"
                            />
                            <FieldError message={errors.name} />
                        </div>

                        <div>
                            <Label>CPF</Label>
                            <Input
                                name="cpf"
                                value={maskCPF(data.cpf)}
                                onChange={(e) => setData('cpf', e.target.value)}
                                placeholder="11023843912"
                            />
                            <FieldError message={errors.cpf} />

                            {generatedLogin && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Login gerado:{' '}
                                    <strong>{generatedLogin}</strong>
                                </p>
                            )}
                        </div>

                        <div>
                            <Label>Telefone</Label>
                            <Input
                                name="phone"
                                value={data.phone}
                                onChange={(e) => {
                                    setData('phone', maskPhone(e.target.value));
                                }}
                                inputMode="numeric"
                                placeholder="(42) 92361-7241"
                            />
                            <FieldError message={errors.phone} />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                name="email"
                                type="email"
                                value={data.email}
                                placeholder="usuarios@email.com"
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            <FieldError message={errors.email} />
                        </div>

                        <div>
                            <Label>Tipo</Label>

                            <Select
                                value={String(data.type_id)}
                                onValueChange={(value) => setData('type_id', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>

                                <SelectContent className="max-h-60 overflow-y-auto">
                                    {types.map((t: any) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <FieldError message={errors.type_id} />
                        </div>

                        <div>
                            <Label>Instituição / Vínculo</Label>
                            <Input
                                name="school"
                                value={data.school}
                                onChange={(e) =>
                                    setData('school', e.target.value)
                                }
                                placeholder="Instituição / Vínculo"
                            />
                            <FieldError message={errors.school} />
                        </div>

                        <div>
                            <Label>Expira em</Label>
                            <Input
                                name="expires_at"
                                type="date"
                                value={data.expires_at}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) =>
                                    setData('expires_at', e.target.value)
                                }
                            />
                            <FieldError message={errors.expires_at} />

                            <p className="mt-1 text-xs text-gray-500">
                                A senha será gerada automaticamente.
                            </p>
                        </div>

                        {/* STATUS */}
                        <div>
                            <Label>Status</Label>
                            <Select
                                value={data.enabled ? '1' : '0'}
                                onValueChange={(value) =>
                                    setData('enabled', value === '1')
                                }
                            >
                                <SelectTrigger
                                    className="w-full"
                                    name="enabled"
                                >
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Ativo</SelectItem>
                                    <SelectItem value="0">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.enabled} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" asChild>
                            <Link href={visitors.index.get().url}>
                                Cancelar
                            </Link>
                        </Button>

                        <Button disabled={processing} type="submit">
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
