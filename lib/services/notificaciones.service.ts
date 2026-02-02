import { notificacionesQueries } from '../db/queries/notificaciones.queries';
import { usuariosQueries } from '../db/queries/usuarios.queries';

export interface NotificarVariosUsuariosInput {
  cedulaEmisor: string;
  cedulasReceptores: string[];
  titulo: string;
  mensaje: string;
}

export interface NotificarVariosUsuariosResult {
  success: boolean;
  data?: Array<{ cedulaReceptor: string }>;
  error?: { message: string; code?: string };
}

/**
 * Notifica a varios usuarios, validando que existan antes de insertar.
 * Evita duplicados verificando si ya existe una notificación idéntica sin leer.
 */
export async function notificarVariosUsuariosService(input: NotificarVariosUsuariosInput): Promise<NotificarVariosUsuariosResult> {
  try {
    // Validar existencia de emisor
    const emisor = await usuariosQueries.getInfoByCedula(input.cedulaEmisor);
    if (!emisor) {
      return { success: false, error: { message: 'Emisor no existe', code: 'EMISOR_NO_EXISTE' } };
    }

    // Validar existencia de receptores
    const validos: string[] = [];
    for (const cedula of input.cedulasReceptores) {
      const usuario = await usuariosQueries.getInfoByCedula(cedula);
      if (usuario) validos.push(cedula);
    }
    if (validos.length === 0) {
      return { success: false, error: { message: 'Ningún receptor válido', code: 'RECEPTORES_INVALIDOS' } };
    }

    // Insertar notificación para cada receptor válido (evitando duplicados)
    const notificados: string[] = [];
    for (const cedulaReceptor of validos) {
      // Verificar si ya existe una notificación idéntica sin leer
      const existeDuplicada = await notificacionesQueries.existsUnread({
        cedulaReceptor,
        titulo: input.titulo,
        mensaje: input.mensaje,
      });

      // Solo crear si no existe una idéntica
      if (!existeDuplicada) {
        await notificacionesQueries.create({
          cedulaReceptor,
          cedulaEmisor: input.cedulaEmisor,
          titulo: input.titulo,
          mensaje: input.mensaje,
        });
        notificados.push(cedulaReceptor);
      }
    }
    return { success: true, data: notificados.map(cedulaReceptor => ({ cedulaReceptor })) };
  } catch (error) {
    return { success: false, error: { message: error instanceof Error ? error.message : 'Error al notificar', code: 'NOTIFICACION_ERROR' } };
  }
}

export interface NotificarDeshabilitacionUsuarioEnCasosInput {
  cedulaActor: string;
  cedulaUsuarioDeshabilitado: string;
}

export interface NotificarDeshabilitacionUsuarioEnCasosResult {
  success: boolean;
  data?: { receptoresNotificados: number };
  error?: { message: string; code?: string };
}

/**
 * Notifica a usuarios que participan en casos donde también participaba
 * el usuario deshabilitado (cuando habilitado_sistema pasa a false).
 */
export async function notificarDeshabilitacionUsuarioEnCasosService(
  input: NotificarDeshabilitacionUsuarioEnCasosInput
): Promise<NotificarDeshabilitacionUsuarioEnCasosResult> {
  try {
    const actor = await usuariosQueries.getInfoByCedula(input.cedulaActor);
    if (!actor) {
      return { success: false, error: { message: 'Actor no existe', code: 'ACTOR_NO_EXISTE' } };
    }

    const usuario = await usuariosQueries.getInfoByCedula(input.cedulaUsuarioDeshabilitado);
    if (!usuario) {
      return { success: false, error: { message: 'Usuario deshabilitado no existe', code: 'USUARIO_NO_EXISTE' } };
    }

    const receptores = await notificacionesQueries.getReceptoresPorCasosDelUsuario(
      input.cedulaUsuarioDeshabilitado
    );

    const receptoresFiltrados = receptores
      .filter(r => r !== input.cedulaActor)
      .filter(r => r !== input.cedulaUsuarioDeshabilitado);

    if (receptoresFiltrados.length === 0) {
      return { success: true, data: { receptoresNotificados: 0 } };
    }

    const titulo = 'Usuario deshabilitado';
    const mensaje = `El usuario ${usuario.nombre_completo}, con quien compartes casos, ha sido deshabilitado.`;

    for (const cedulaReceptor of receptoresFiltrados) {
      await notificacionesQueries.create({
        cedulaReceptor,
        cedulaEmisor: input.cedulaActor,
        titulo,
        mensaje,
      });
    }

    return { success: true, data: { receptoresNotificados: receptoresFiltrados.length } };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al notificar deshabilitación',
        code: 'NOTIFICACION_DESHABILITACION_ERROR',
      },
    };
  }
}
