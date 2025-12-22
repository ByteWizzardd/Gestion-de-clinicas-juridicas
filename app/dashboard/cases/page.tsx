import { getCasosAction } from '@/app/actions/casos';
import CasesClient from '@/components/cases/CasesClient';

export default async function CasesPage() {
  // Cargar casos en el servidor
  const result = await getCasosAction();
  const casos = result.success ? result.data || [] : [];

  return <CasesClient initialCasos={casos} />;
}
