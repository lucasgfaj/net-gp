import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import visitorTypes from '@/routes/visitorTypes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreateVisitorType() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tipos de Visitantes', href: visitorTypes.index.get().url },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(visitorTypes.store.post().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Tipo de Visitante" />

            <div className="w-full max-w-4xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">
                    Criar Tipo de Visitante
                </h1>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label>
                            <h1 className="mb-3">Nome</h1>
                        </Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nome do Tipo do Visitante"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                        <div>
                        <Label>
                            <h1 className="mb-3">Descrição</h1>
                        </Label>
                        <Input
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Nome do Tipo do Visitante"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 flex justify-start gap-2">
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
