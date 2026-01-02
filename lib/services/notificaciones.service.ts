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

    // Insertar notificación para cada receptor válido
    for (const cedulaReceptor of validos) {
      await notificacionesQueries.create({
        cedulaReceptor,
        cedulaEmisor: input.cedulaEmisor,
        titulo: input.titulo,
        mensaje: input.mensaje,
      });
    }
    return { success: true, data: validos.map(cedulaReceptor => ({ cedulaReceptor })) };
  } catch (error) {
    return { success: false, error: { message: error instanceof Error ? error.message : 'Error al notificar', code: 'NOTIFICACION_ERROR' } };
  }
}
