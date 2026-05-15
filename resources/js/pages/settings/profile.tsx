import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configurações de perfil',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurações de perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Informações do perfil"
                        description="Dados do usuário fornecidos pelo domínio institucional"
                    />

                    {/* SOMENTE LEITURA */}
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={auth.user.name}
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Endereço de e-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={auth.user.email}
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                        </div>

                          <div className="grid gap-2">
                            <Label htmlFor="name">Departamento</Label>
                            <Input
                                id="name"
                                value={auth.user.department}
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {mustVerifyEmail &&
                        auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Seu endereço de e-mail não foi verificado.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline underline-offset-4"
                                    >
                                        Clique aqui para reenviar o e-mail de verificação.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        Um novo link de verificação foi enviado para seu e-mail.
                                    </div>
                                )}
                            </div>
                        )}

                </div>
            </SettingsLayout>
        </AppLayout>
    );
}