import { getSolicitantesAction } from '@/app/actions/solicitantes';
import { getNucleosAction } from '@/app/actions/nucleos';
import ApplicantsClient from '@/components/applicants/ApplicantsClient';

export default async function ApplicantsPage() {
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