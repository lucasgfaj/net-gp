import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { UserPlus, Users, Calendar, Clock, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { props }: any = usePage();
    const {
        stats,
        visitorsByDepartment,
        visitorsByMonth,
        nextToExpire,
        alreadyExpired,
        recentActivities,
    } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Visitantes
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalVisitors}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Criados este Mês
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalThisMonth}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Expirados
                            </CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.expiredVisitors}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Visitantes por Departamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {visitorsByDepartment?.length > 0 ? (
                                <div className="space-y-2">
                                    {visitorsByDepartment.map(
                                        (dept: any) => (
                                            <div
                                                key={dept.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {dept.name}
                                                    </span>
                                                </div>
                                                <Badge variant="secondary">
                                                    {dept.count}
                                                </Badge>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum visitante encontrado
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Próximos a Expirar (7 dias)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nextToExpire?.length > 0 ? (
                                <div className="space-y-2">
                                    {nextToExpire.map((voucher: any) => (
                                        <div
                                            key={voucher.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {voucher.visitor?.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {voucher.visitor
                                                        ?.creator?.department
                                                        ?.name || 'N/A'}{' '}
                                                    •{' '}
                                                    {voucher.login}
                                                </span>
                                            </div>
                                            <Badge variant="outline">
                                                {new Date(
                                                    voucher.expires_at
                                                ).toLocaleDateString('pt-BR')}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum voucher próximo de expirar
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Visitantes Expirados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {alreadyExpired?.length > 0 ? (
                                <div className="space-y-2">
                                    {alreadyExpired.map((visitor: any) => (
                                        <div
                                            key={visitor.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {visitor.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {visitor.creator?.department
                                                        ?.name || 'N/A'}
                                                </span>
                                            </div>
                                            <Badge variant="destructive">
                                                {new Date(
                                                    visitor.expires_at
                                                ).toLocaleDateString('pt-BR')}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum visitante expirado
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Atividades Recentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentActivities?.length > 0 ? (
                                <div className="space-y-2">
                                    {recentActivities.map((activity: any) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {activity.department && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {activity.department}
                                                            </span>
                                                        )}{' '}
                                                        {activity.user}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {activity.action}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {activity.created_at}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Nenhuma atividade recente
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}