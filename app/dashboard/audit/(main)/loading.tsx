import AuditModuleSkeleton from '@/components/ui/skeletons/AuditModuleSkeleton';

export default function Loading() {
    return (
        <AuditModuleSkeleton
            tabs={['General', 'Módulos']}
            searchPlaceholder="Buscar por usuario, acción o detalle..."
            showSortButton={false}
        />
    );
}
