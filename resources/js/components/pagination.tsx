import { Link } from '@inertiajs/react';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export default function Pagination({ links }: PaginationProps) {
    return (
        <div className="flex justify-center mt-4 space-x-1">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || ''}
                    className={`px-3 py-1 border rounded text-sm
                        ${link.active ? 'bg-gray-200 font-semibold' : ''}
                        ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
