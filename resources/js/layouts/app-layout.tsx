import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'
import { type BreadcrumbItem } from '@/types'
import { type ReactNode, useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { toast, Toaster } from 'sonner'

interface AppLayoutProps {
    children: ReactNode
    breadcrumbs?: BreadcrumbItem[]
}

interface PageProps {
    flash?: { success?: string; error?: string };
    errors?: { error?: string };
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { props: pageProps } = usePage<PageProps>();
    const { flash, errors } = pageProps

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success)
        }
        if (flash?.error) {
            toast.error(flash.error)
        }
        if (errors?.error) {
            toast.error(errors.error)
        }
    }, [flash, errors])

    return (
        <>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>

            <Toaster position="bottom-right" richColors />
        </>
    )
}
