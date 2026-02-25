import AuditModuleSkeleton from '@/components/ui/skeletons/AuditModuleSkeleton';
export default function Loading() {
    return <AuditModuleSkeleton tabs={['Creados', 'Con Campos Modificados', 'Habilitados/Deshabilitados', 'Eliminados']} />;
}
