'use client';

import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react';

interface CatalogActionsMenuProps {
    item: any;
    onEdit: () => void;
    onToggleHabilitado: () => void;
    onDelete: () => void;
    canDelete?: boolean;
}

export default function CatalogActionsMenu({
    item,
    onEdit,
    onToggleHabilitado,
    onDelete,
    canDelete = true
}: CatalogActionsMenuProps) {
    const isHabilitado = item.habilitado !== false;

    return (
        <div className="flex flex-col justify-center items-center gap-2">
            {/* Edit Button */}
            <button
                onClick={onEdit}
                className="group flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Editar"
            >
                <Pencil className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Editar</span>
            </button>

            {/* Toggle Habilitado Button */}
            <button
                onClick={onToggleHabilitado}
                className="group flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={isHabilitado ? "Deshabilitar" : "Habilitar"}
            >
                {isHabilitado ? (
                    <>
                        <PowerOff className="w-4 h-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Deshabilitar</span>
                    </>
                ) : (
                    <>
                        <Power className="w-4 h-4 text-green-500 group-hover:text-green-700 transition-colors" />
                        <span className="text-sm text-green-600 group-hover:text-green-700 transition-colors">Habilitar</span>
                    </>
                )}
            </button>

            {/* Delete Button */}
            {canDelete && (
                <button
                    onClick={onDelete}
                    className="group flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Eliminar"
                >
                    <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                    <span className="text-sm text-gray-600 group-hover:text-red-600 transition-colors">Eliminar</span>
                </button>
            )}
        </div>
    );
}
