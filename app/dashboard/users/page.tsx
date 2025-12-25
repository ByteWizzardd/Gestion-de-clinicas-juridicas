import UsersClient from '@/components/users/UsersClient';
import { getUsuariosAction } from '@/app/actions/usuarios';

export default async function UsersPage() {
    const usuariosResult = await getUsuariosAction();
    const usuarios = usuariosResult.success ? usuariosResult.data || [] : [];

    return <UsersClient initialUsuarios={usuarios} />;
}