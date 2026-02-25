import AuditModuleSkeleton from '@/components/ui/skeletons/AuditModuleSkeleton';

export default function Loading() {
    return <AuditModuleSkeleton showHeaderSkeleton={true} tabs={['Creados', 'Actualizados', 'Eliminados']} />;
}
