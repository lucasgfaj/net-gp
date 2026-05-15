import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function shortenName(fullName: string): string {
    if (!fullName) return '';
    
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length === 1) return parts[0];
    
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    
    return `${firstName} ${lastName}`;
}
