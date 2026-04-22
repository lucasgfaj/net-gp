import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import visitorTypes from '@/routes/visitorTypes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

export default function EditVisitorType({ type }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tipos de Visitantes', href: visitorTypes.index.get().url },
        { title: 'Editar', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: type.name,
        description: type.description ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(visitorTypes.update({ visitorType: type.id }).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Tipo de Visitante" />

            <div className="w-full max-w-4xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">
                    Editar Tipo de Visitante
                </h1>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={visitorTypes.index.get().url}>
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