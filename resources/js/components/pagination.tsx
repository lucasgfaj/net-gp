import { Link } from '@inertiajs/react';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    paginated?: {
        links?: LinkItem[];
    };
    links?: LinkItem[];
}

export default function Pagination(props: PaginationProps) {
    let paginationLinks: LinkItem[] = [];

    if (props.paginated?.links) {
        paginationLinks = props.paginated.links;
    } else if (props.links) {
        paginationLinks = props.links;
    }

    if (!Array.isArray(paginationLinks) || paginationLinks.length === 0) {
        return null;
    }

    return (
        <div className="flex justify-center mt-4 space-x-1">
            {paginationLinks.map((link: LinkItem, index: number) => (
                <Link
                    key={index}
                    href={link?.url || '#'}
                    className={`px-3 py-1 border rounded text-sm ${
                        link?.active ? 'bg-gray-200 font-semibold' : ''
                    } ${!link?.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link?.label || '' }}
                />
            ))}
        </div>
    );
}