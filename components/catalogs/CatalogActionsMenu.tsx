'use client';

import { useState } from 'react';
import { Power, PowerOff } from 'lucide-react';
import ActionMenu from '@/components/ui/ActionMenu';
import ConfirmModal from '@/components/ui/feedback/ConfirmModal';

interface CatalogActionsMenuProps {
    item: any;
    onView?: () => void;
    onEdit: () => void;
    onToggleHabilitado: () => void;
    onDelete: (motivo?: string) => void;
    canDelete?: boolean;
    titleField?: string;
}

export default function CatalogActionsMenu({
    item,
    onView,
    onEdit,
    onToggleHabilitado,
    onDelete,
    canDelete = true,
    titleField = 'nombre'
}: CatalogActionsMenuProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteMotivo, setDeleteMotivo] = useState('');
    const isHabilitado = item.habilitado !== false;

    // Intentar encontrar un nombre para mostrar en el mensaje de confirmación
    const itemName = item[titleField] || item.nombre_materia || item.nombre_categoria || item.nombre_subcategoria || item.nombre_ambito_legal || item.nombre_nucleo || item.nombre_estado || item.nombre_municipio || item.nombre_parroquia || item.nombre_caracteristica || item.nombre_tipo_caracteristica || item.nombre_nivel_educativo || item.nombre_condicion_trabajo || item.nombre_condicion_actividad || item.nombre_semestre || 'este elemento';

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
        <>
            <ActionMenu
                onView={onView}
                onEdit={onEdit}
                onDelete={canDelete ? () => setShowDeleteConfirm(true) : undefined}
                customActions={[toggleAction]}
            />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteMotivo('');
                }}
                onConfirm={(motivo) => {
                    onDelete(motivo);
                    setShowDeleteConfirm(false);
                    setDeleteMotivo('');
                }}
                title="Eliminar elemento del catálogo"
                message={
                    <div className="space-y-4">
                        <p>
                            ¿Estás seguro de que deseas eliminar <strong>"{itemName}"</strong>?
                        </p>
                        <p className="text-red-600 font-semibold">
                            Esta acción es irreversible y solo se podrá realizar si no existen registros asociados.
                        </p>
                    </div>
                }
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                confirmVariant="danger"
                showMotive={true}
                motiveValue={deleteMotivo}
                onMotiveChange={setDeleteMotivo}
                motivePlaceholder="Indique el motivo de la eliminación..."
            />
        </>
    );
}
