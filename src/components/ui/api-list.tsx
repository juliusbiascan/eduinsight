"use client"

import { useOrigin } from '@/hooks/use-origin';
import { useParams } from 'next/navigation';
import { ApiAlert } from '@/components/ui/api-alert';

interface ApiListProps {
    entityName: string;
    entityIdName: string;
}

export const ApiList: React.FC<ApiListProps> = ({
    entityIdName,
    entityName
}) => {
    const params = useParams();
    const origin = useOrigin();

    const baseUrl = `${origin}/api/${params.labId}`;

    const endpoints = [
        {
            method: 'GET',
            path: `/${entityName}`,
            description: 'List all records',
            type: 'read'
        },
        {
            method: 'GET',
            path: `/${entityName}/{${entityIdName}}`,
            description: 'Get single record',
            type: 'read'
        },
        {
            method: 'POST',
            path: `/${entityName}`,
            description: 'Create new record',
            type: 'write'
        },
        {
            method: 'PATCH',
            path: `/${entityName}/{${entityIdName}}`,
            description: 'Update existing record',
            type: 'write'
        },
        {
            method: 'DELETE',
            path: `/${entityName}/{${entityIdName}}`,
            description: 'Delete record',
            type: 'write'
        }
    ];

    return (
        <div className="grid gap-4">
            {endpoints.map((endpoint) => (
                <ApiAlert
                    key={endpoint.path}
                    title={endpoint.method}
                    description={`${baseUrl}${endpoint.path}`}
                    variant={endpoint.type as 'read' | 'write'}
                    info={endpoint.description}
                />
            ))}
        </div>
    );
}