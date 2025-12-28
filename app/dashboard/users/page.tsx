import UsersClient from '@/components/users/UsersClient';
import { getUsuariosAction } from '@/app/actions/usuarios';
import { authorizeRole } from '@/lib/utils/auth-utils';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    // Solo permitir al Coordinador (coordinator)
    await authorizeRole(['coordinator']);

    const usuariosResult = await getUsuariosAction();
    const usuarios = usuariosResult.success ? usuariosResult.data || [] : [];

    return <UsersClient initialUsuarios={usuarios} />;
}