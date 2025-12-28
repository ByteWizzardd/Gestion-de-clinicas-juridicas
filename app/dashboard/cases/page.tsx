import { Suspense } from 'react';
import { getCasosAction } from '@/app/actions/casos';
import CasesClient from '@/components/cases/CasesClient';

export const dynamic = 'force-dynamic';

export default async function CasesPage() {
  // Cargar casos en el servidor
  const result = await getCasosAction();
  const casos = result.success ? result.data || [] : [];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CasesClient initialCasos={casos} />
    </Suspense>
  );
}
