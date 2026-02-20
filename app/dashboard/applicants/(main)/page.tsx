import { getSolicitantesAction } from '@/app/actions/solicitantes';
import { getNucleosAction } from '@/app/actions/nucleos';
import ApplicantsClient from '@/components/applicants/ApplicantsClient';
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function ApplicantsPage() {
  // Permitir a todos los roles autenticados
  await authorizeRole(['coordinator', 'professor', 'student']);

  // Cargar datos en el servidor
  const [solicitantesResult, nucleosResult] = await Promise.all([
    getSolicitantesAction(),
    getNucleosAction(),
  ]);

  const solicitantes = solicitantesResult.success ? solicitantesResult.data || [] : [];
  const nucleos = nucleosResult.success ? nucleosResult.data || [] : [];

  return (
    <ApplicantsClient 
      initialSolicitantes={solicitantes}
      initialNucleos={nucleos}
    />
  );
}