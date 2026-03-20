import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import departments from '@/routes/departments';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

export default function EditDepartment({ department }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Departamentos', href: departments.index.get().url },
        { title: 'Editar', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: department.name,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(departments.update({ department: department.id }).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Departamento" />

            {/* Aumentei o tamanho do container */}
            <div className="w-full max-w-4xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">
                    Editar Departamento
                </h1>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label>
                            <h1 className="mb-3">Nome</h1>
                        </Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 flex justify-start gap-2">
                        <Button variant="outline" asChild>
                            <Link href={departments.index.get().url}>
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
