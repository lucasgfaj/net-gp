import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { shortenName } from '@/lib/utils';

interface Activity {
    id: number;
    user: string | null;
    department: string | null;
    user_role: string | null;
    action_label: string;
    action: string;
    created_at: string;
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
                    <Table className="min-w-[700px] sm:min-w-[900px] w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">Data/Hora</TableHead>
                                <TableHead className="whitespace-nowrap">Usuario</TableHead>
                                <TableHead className="whitespace-nowrap">Ação</TableHead>
                                <TableHead className="text-right whitespace-nowrap">Detalhes</TableHead>
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
                                        <TableCell className="whitespace-nowrap text-muted-foreground text-xs sm:text-sm">
                                            {activity.created_at}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-xs sm:text-sm">{shortenName(activity.user) || 'Sistema'}</span>
                                                {activity.department && (
                                                    <span className="text-xs text-muted-foreground hidden sm:inline">
                                                        {activity.department}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 min-w-[120px]">
                                                <Badge variant="secondary" className="w-fit text-xs">
                                                    {activity.action_label}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground whitespace-normal break-words max-w-[200px]">
                                                    {activity.action}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/activities/${activity.id}`}>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
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