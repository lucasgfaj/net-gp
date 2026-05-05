import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye } from 'lucide-react';

interface Activity {
    id: number;
    created_at: string;
    action: string;
    data: { name?: string; description?: string } | null;
    user: { name: string } | null;
}

interface Props {
    activities: {
        data: Activity[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function ActivitiesIndex({ activities }: Props) {
    const items = activities?.data || [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Atividades', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Atividades" />

            <div className="flex flex-col gap-4 p-4 sm:p-6">
                <div className="overflow-x-auto rounded-xl border">
                    <Table className="min-w-[800px] w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Acao</TableHead>
                                <TableHead className="text-right">Detalhes</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-6 text-center">
                                        Nenhum registro encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((activity: Activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {new Date(activity.created_at).toLocaleString('pt-BR')}
                                        </TableCell>
                                        <TableCell>{activity.user?.name || 'Sistema'}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                                                {activity.action}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/activities/${activity.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {activities?.links && activities.links.length > 0 && (
                    <div className="flex justify-center mt-4 space-x-1">
                        {activities.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1 rounded border text-sm ${
                                    link.active ? 'bg-secondary font-semibold' : ''
                                } ${!link.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}