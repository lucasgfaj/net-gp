import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { usePage, router, Link } from '@inertiajs/react';
import { shortenName } from '@/lib/utils';
import { Users, Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight, FileSpreadsheet, CheckCircle, XCircle, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    totalVisitors: number;
    totalVouchers: number;
    totalThisMonth: number;
    expiredVisitors: number;
}

interface DashboardImportStats {
    totalBatches: number;
    totalImported: number;
    totalErrors: number;
    totalSuccess: number;
    totalSkipped: number;
}

interface DashboardDept {
    id: number;
    name: string;
    count: number;
}

interface DashboardVoucher {
    id: number;
    login: string;
    expires_at: string;
    visitor?: {
        name: string;
        creator?: {
            department?: {
                name: string;
            };
        };
    };
}

interface DashboardVisitor {
    id: number;
    name: string;
    expires_at: string;
    creator?: {
        department?: {
            name: string;
        };
    };
}

interface DashboardActivity {
    id: number;
    action: string;
    user: string;
    user_role: string;
    department?: string;
    created_at: string;
}

interface DashboardImport {
    id: number;
    filename: string;
    total: number;
    creator: string;
    status: string;
    created_at: string;
}

interface DashboardPageProps {
    stats: DashboardStats;
    importStats: DashboardImportStats;
    visitorsByDepartment: DashboardDept[];
    nextToExpire: DashboardVoucher[];
    alreadyExpired: DashboardVisitor[];
    recentActivities: DashboardActivity[];
    recentImports: DashboardImport[];
    [key: string]: unknown;
}

export default function Dashboard() {
    const { props } = usePage<DashboardPageProps & { auth: { user: { role: string } } }>();
    const {
        stats,
        importStats,
        visitorsByDepartment,
        nextToExpire,
        alreadyExpired,
        recentActivities,
        recentImports,
        auth,
    } = props;
    const isOperator = auth?.user?.role === 'operator';
    const [expiredPage, setExpiredPage] = useState(1);
    const [expiringPage, setExpiringPage] = useState(1);
    const [activityPage, setActivityPage] = useState(1);
    const [importPage, setImportPage] = useState(1);
    const perPage = 5;

    const totalExpiredPages = Math.ceil((alreadyExpired?.length || 0) / perPage);
    const paginatedExpired = alreadyExpired?.slice(
        (expiredPage - 1) * perPage,
        expiredPage * perPage
    );

    const totalExpiringPages = Math.ceil((nextToExpire?.length || 0) / perPage);
    const paginatedExpiring = nextToExpire?.slice(
        (expiringPage - 1) * perPage,
        expiringPage * perPage
    );

    const totalActivityPages = Math.ceil((recentActivities?.length || 0) / perPage);
    const paginatedActivities = recentActivities?.slice(
        (activityPage - 1) * perPage,
        activityPage * perPage
    );

    const totalImportPages = Math.ceil((recentImports?.length || 0) / perPage);
    const paginatedImports = recentImports?.slice(
        (importPage - 1) * perPage,
        importPage * perPage
    );

    useEffect(() => {
        const hasProcessingImports = recentImports?.some((r) => r.status === 'processing');
        
        if (!hasProcessingImports) {
            return;
        }
        
        const interval = setInterval(() => {
            router.reload({ only: ['stats', 'importStats', 'nextToExpire', 'alreadyExpired', 'recentActivities', 'recentImports'] });
        }, 3000);
        return () => clearInterval(interval);
    }, [recentImports]);

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
                                Total de Vouchers
                            </CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalVouchers}
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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Importações em Lote
                            </CardTitle>
                            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {importStats?.totalBatches || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {importStats?.totalImported || 0} importados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Erros de Importação
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {importStats?.totalErrors || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                    {importStats?.totalSuccess || 0} com sucesso
                                    {importStats?.totalSkipped > 0 && (
                                        <> • {importStats.totalSkipped} pulados</>
                                    )}
                                </p>
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
                                        (dept) => (
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
                                    {paginatedExpiring.map((voucher) => (
                                        <div
                                            key={voucher.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {shortenName(voucher.visitor?.name ?? '')}
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
                            {totalExpiringPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={() => setExpiringPage(p => Math.max(1, p - 1))}
                                        disabled={expiringPage === 1}
                                        className="px-2 py-1 border rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs text-muted-foreground">
                                        {expiringPage} de {totalExpiringPages}
                                    </span>
                                    <button
                                        onClick={() => setExpiringPage(p => Math.min(totalExpiringPages, p + 1))}
                                        disabled={expiringPage === totalExpiringPages}
                                        className="px-2 py-1 border rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
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
                            {paginatedExpired?.length > 0 ? (
                                <div className="space-y-2">
                                    {paginatedExpired.map((visitor) => (
                                        <div
                                            key={visitor.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {shortenName(visitor.name)}
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
                            {totalExpiredPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={() => setExpiredPage(p => Math.max(1, p - 1))}
                                        disabled={expiredPage === 1}
                                        className="px-2 py-1 border rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs text-muted-foreground">
                                        {expiredPage} de {totalExpiredPages}
                                    </span>
                                    <button
                                        onClick={() => setExpiredPage(p => Math.min(totalExpiredPages, p + 1))}
                                        disabled={expiredPage === totalExpiredPages}
                                        className="px-2 py-1 border rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {!isOperator && (
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Atividades Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                            {paginatedActivities?.length > 0 ? (
                                    <div className="space-y-2">
                                        {paginatedActivities.map((activity) => (
                                            <Link
                                                key={activity.id}
                                                href={`/activities/${activity.id}`}
                                                className="flex items-center justify-between hover:bg-muted/50 p-2 -mx-2 rounded transition-colors"
                                            >
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        {activity.department && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {activity.department}
                                                            </span>
                                                        )}
                                                        <span className="text-sm font-medium">
                                                            {activity.user}
                                                        </span>
                                                        {activity.user_role === 'admin' && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                                                admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {activity.action}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {activity.created_at}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhuma atividade recente
                                    </p>
                                )}
                                {totalActivityPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <button
                                            onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                                            disabled={activityPage === 1}
                                            className="px-2 py-1 border rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="text-xs text-muted-foreground">
                                            {activityPage} de {totalActivityPages}
                                        </span>
                                        <button
                                            onClick={() => setActivityPage(p => Math.min(totalActivityPages, p + 1))}
                                            disabled={activityPage === totalActivityPages}
                                            className="px-2 py-1 border rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Importações Recentes
                            </CardTitle>
                            {/* Botão de ver todas removido temporariamente */}
                        </CardHeader>
                        <CardContent>
                            {paginatedImports?.length > 0 ? (
                                    <div className="space-y-2">
                                        {paginatedImports.map((batch) => (
                                        <div
                                            key={batch.id}
                                            className="flex items-center justify-between hover:bg-muted/50 p-2 rounded"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {batch.filename}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {batch.total} importados • {batch.creator}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {batch.status === 'completed' && (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                )}
                                                {batch.status === 'failed' && (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                {batch.status === 'processing' && (
                                                    <Clock className="h-4 w-4 text-yellow-500" />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {batch.created_at}
                                                </span>
                                            </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhuma importação realizada
                                    </p>
                                )}
                                {totalImportPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <button
                                            onClick={() => setImportPage(p => Math.max(1, p - 1))}
                                            disabled={importPage === 1}
                                            className="px-2 py-1 border rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="text-xs text-muted-foreground">
                                            {importPage} de {totalImportPages}
                                        </span>
                                        <button
                                            onClick={() => setImportPage(p => Math.min(totalImportPages, p + 1))}
                                            disabled={importPage === totalImportPages}
                                            className="px-2 py-1 border rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}