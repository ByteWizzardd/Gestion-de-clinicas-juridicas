'use client';

import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import ActionMenu from '@/components/ui/ActionMenu';

interface CatalogActionsMenuProps {
    item: any;
    onView?: () => void;
    onEdit: () => void;
    onToggleHabilitado: () => void;
    onDelete: () => void;
    canDelete?: boolean;
}

export default function CatalogActionsMenu({
    item,
    onView,
    onEdit,
    onToggleHabilitado,
    onDelete,
    canDelete = true
}: CatalogActionsMenuProps) {
    const isHabilitado = item.habilitado !== false;

    const toggleAction = {
        label: (
            <div className="flex items-center gap-3">
                {isHabilitado ? (
                    <>
                        <PowerOff className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
                        <span>Deshabilitar</span>
                    </>
                ) : (
                    <>
                        <Power className="w-4 h-4 text-green-500 group-hover:text-green-700 transition-colors" />
                        <span className="text-green-600 group-hover:text-green-700">Habilitar</span>
                    </>
                )}
            </div>
        ),
        onClick: onToggleHabilitado
    };

    return (
        <ActionMenu
            onView={onView}
            onEdit={onEdit}
            onDelete={canDelete ? onDelete : undefined}
            customActions={[toggleAction]}
        />
    );
}
