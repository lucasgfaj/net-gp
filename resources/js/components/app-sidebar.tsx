import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import departments from '@/routes/departments';
import users from '@/routes/users';
import visitors from '@/routes/visitors';
import vouchers from '@/routes/vouchers';
import importBatches from '@/routes/import-batches';
import activities from '@/routes/activities';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Boxes,
    Building,
    Folder,
    LayoutDashboard,
    Ticket,
    UserCircle,
    Users,
    FileSpreadsheet,
    Activity,
} from 'lucide-react';
import AppLogo from './app-logo';
import visitorTypes from '@/routes/visitorTypes';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Departamentos',
        href: departments.index(),
        icon: Building,
    },
    {
        title: 'Tipo de Visitante',
        href: visitorTypes.index(),
        icon: Boxes,
    },
    {
        title: 'Usuários',
        href: users.index(),
        icon: UserCircle,
    },
    {
        title: 'Visitantes',
        href: visitors.index(),
        icon: Users,
    },
    {
        title: 'Vouchers',
        href: vouchers.index(),
        icon: Ticket,
    },
    {
        title: 'Importações',
        href: importBatches.index(),
        icon: FileSpreadsheet,
    },

    {
        title: 'Atividades',
        href: activities.index(),
        icon: Activity,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/lucasgfaj/net-gp',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://wiki.gp.utfpr.edu.br/',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as unknown as { auth: { user: { role: string } } };
    const role = auth.user.role;

    const filterMainNavItems = mainNavItems.filter((item) => {
        if (role === 'operator') {
            return !['Departamentos', 'Usuários', 'Tipo de Visitante', 'Atividades'].includes(item.title);
        }
        if (role !== 'admin') {
            return !['Usuários', 'Atividades'].includes(item.title);
        }
        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filterMainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
