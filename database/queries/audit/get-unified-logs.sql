-- Obtener logs unificados de auditoría
SELECT * FROM (
    -- Sesiones (auditoria_sesiones)
    SELECT
        'Sesión' as entidad,
        CASE 
            WHEN t.fecha_cierre IS NOT NULL THEN 'Cierre de Sesión'
            WHEN t.exitoso = FALSE THEN 'Intento Fallido'
            ELSE 'Inicio de Sesión' 
        END as accion,
        COALESCE(t.fecha_inicio, t.fecha_cierre) as fecha,
        t.cedula_usuario as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.cedula_usuario), t.cedula_usuario) as usuario_nombre,
        'IP: ' || COALESCE(t.ip_direccion::text, 'N/A') as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_sesiones t

    UNION ALL

    -- Reportes (auditoria_reportes)
    SELECT
        'Reporte' as entidad,
        'Generación' as accion,
        t.fecha_generacion as fecha,
        t.id_usuario_genero as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_genero), t.id_usuario_genero) as usuario_nombre,
        'Tipo: ' || t.tipo_reporte as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_reportes t

    UNION ALL

    -- Casos (Inserción)
    SELECT
        'Caso' as entidad,
        'Creación' as accion,
        t.fecha_creacion as fecha,
        t.id_usuario_creo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre,
        'Caso creado' as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_insercion_casos t

    UNION ALL

    -- Casos (Actualización)
    SELECT
        'Caso' as entidad,
        'Actualización' as accion,
        t.fecha_actualizacion as fecha,
        t.id_usuario_actualizo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre,
        'Actualización de caso ' || t.id_caso as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_actualizacion_casos t

    UNION ALL

    -- Casos (Eliminación)
    SELECT
        'Caso' as entidad,
        'Eliminación' as accion,
        t.fecha as fecha,
        t.eliminado_por as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.eliminado_por), t.eliminado_por) as usuario_nombre,
        'Causa: ' || COALESCE(t.motivo, 'No especificada') as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_eliminacion_casos t

    UNION ALL

    -- Usuarios (Inserción)
    SELECT
        'Usuario' as entidad,
        'Creación' as accion,
        t.fecha_creacion as fecha,
        t.id_usuario_creo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre,
        'Usuario creado: ' || t.cedula as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_insercion_usuarios t

    UNION ALL

    -- Usuarios (Actualización)
    SELECT
        'Usuario' as entidad,
        'Actualización' as accion,
        t.fecha_actualizacion as fecha,
        t.id_usuario_actualizo as usuario_id,
        COALESCE(
            (SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), 
            t.id_usuario_actualizo,
            -- En caso de que el usuario que actualizó no se encuentre (ej. fue eliminado), 
            -- intentar buscar en las auditorías de eliminación o inserción si es necesario,
            -- pero para simplicidad mostramos el ID si no hay match.
            -- Ojo: t.id_usuario_actualizo es la CÉDULA aquí según esquema (verificado: auditoria_actualizacion_usuarios.id_usuario_actualizo)
            t.id_usuario_actualizo 
        ) as usuario_nombre,
        'Actualización de usuario ' || t.ci_usuario as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_actualizacion_usuarios t

    UNION ALL

    -- Usuarios (Eliminación)
    SELECT
        'Usuario' as entidad,
        'Eliminación' as accion,
        t.fecha as fecha,
        t.eliminado_por as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.eliminado_por), t.eliminado_por) as usuario_nombre,
        'Usuario eliminado: ' || t.usuario_eliminado as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_eliminacion_usuario t

    UNION ALL

    -- Solicitantes (Inserción)
    SELECT
        'Solicitante' as entidad,
        'Creación' as accion,
        t.fecha_creacion as fecha,
        t.id_usuario_creo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre,
        'Solicitante creado: ' || t.cedula as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_insercion_solicitantes t

    UNION ALL

    -- Solicitantes (Actualización)
    SELECT
        'Solicitante' as entidad,
        'Actualización' as accion,
        t.fecha_actualizacion as fecha,
        t.id_usuario_actualizo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre,
        'Actualización de solicitante ' || t.cedula_solicitante as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_actualizacion_solicitantes t

    UNION ALL

    -- Solicitantes (Eliminación)
    SELECT
        'Solicitante' as entidad,
        'Eliminación' as accion,
        t.fecha as fecha,
        t.eliminado_por as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.eliminado_por), t.eliminado_por) as usuario_nombre,
        'Solicitante eliminado: ' || t.solicitante_eliminado as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_eliminacion_solicitantes t

    UNION ALL

    -- Citas (Inserción)
    SELECT
        'Cita' as entidad,
        'Programación' as accion,
        t.fecha_creacion as fecha,
        t.id_usuario_creo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre,
        'Cita programada para ' || t.fecha_encuentro::text as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_insercion_citas t

    UNION ALL

    -- Citas (Actualización)
    SELECT
        'Cita' as entidad,
        'Actualización' as accion,
        t.fecha_actualizacion as fecha,
        t.id_usuario_actualizo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre,
        'Actualización de cita ' || t.num_cita || ' (Caso ' || t.id_caso || ')' as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_actualizacion_citas t

    UNION ALL

    -- Citas (Eliminación)
    SELECT
        'Cita' as entidad,
        'Eliminación' as accion,
        t.fecha_eliminacion as fecha,
        t.id_usuario_elimino as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre,
        'Eliminación de cita ' || t.num_cita || ' (Caso ' || t.id_caso || ')' as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_eliminacion_citas t

    UNION ALL

    -- Acciones (Inserción)
    SELECT
        'Acción' as entidad,
        'Registro' as accion,
        t.fecha_creacion as fecha,
        t.id_usuario_creo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre,
        'Acción registrada en caso ' || t.id_caso as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_insercion_acciones t

    UNION ALL

    -- Acciones (Actualización)
    SELECT
        'Acción' as entidad,
        'Actualización' as accion,
        t.fecha_actualizacion as fecha,
        t.id_usuario_actualizo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre,
        'Actualización de acción en caso ' || t.id_caso as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_actualizacion_acciones t

    UNION ALL

    -- Acciones (Eliminación)
    SELECT
        'Acción' as entidad,
        'Eliminación' as accion,
        t.fecha as fecha,
        t.eliminado_por as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.eliminado_por), t.eliminado_por) as usuario_nombre,
        'Acción eliminada del caso ' || t.id_caso as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_eliminacion_acciones t

    UNION ALL

    -- Beneficiarios (Inserción)
    SELECT
        'Beneficiario' as entidad,
        'Creación' as accion,
        t.fecha_registro as fecha,
        t.id_usuario_registro as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_registro), t.id_usuario_registro) as usuario_nombre,
        'Beneficiario agregado al caso ' || t.id_caso as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_insercion_beneficiarios t

    UNION ALL

    -- Beneficiarios (Actualización)
    SELECT
        'Beneficiario' as entidad,
        'Actualización' as accion,
        t.fecha_actualizacion as fecha,
        t.id_usuario_actualizo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre,
        'Actualización de beneficiario en caso ' || t.id_caso as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_actualizacion_beneficiarios t

    UNION ALL

    -- Beneficiarios (Eliminación)
    SELECT
        'Beneficiario' as entidad,
        'Eliminación' as accion,
        t.fecha_eliminacion as fecha,
        t.id_usuario_elimino as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre,
        'Beneficiario eliminado del caso ' || t.id_caso as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_eliminacion_beneficiarios t

    UNION ALL

    -- Equipo (Actualización)
    SELECT
        'Equipo' as entidad,
        'Actualización' as accion,
        t.fecha_actualizacion as fecha,
        t.id_usuario_modifico as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_modifico), t.id_usuario_modifico) as usuario_nombre,
        'Actualización de equipo del caso ' || t.id_caso as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_actualizacion_equipo t

    UNION ALL

    -- Soportes (Inserción)
    SELECT
        'Soporte' as entidad,
        'Subida' as accion,
        t.fecha_creacion as fecha,
        t.id_usuario_subio as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_subio), t.id_usuario_subio) as usuario_nombre,
        t.nombre_archivo as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_insercion_soportes t

    UNION ALL

    -- Soportes (Eliminación)
    SELECT
        'Soporte' as entidad,
        'Eliminación' as accion,
        t.fecha_eliminacion as fecha,
        t.id_usuario_elimino as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre,
        t.nombre_archivo as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_eliminacion_soportes t

    UNION ALL

    -- ========================================================
    -- CATÁLOGOS
    -- ========================================================

    -- Estados (Inserción)
    SELECT 'Estado' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nuevo estado: ' || t.nombre_estado as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_estados t

    UNION ALL

    -- Estados (Actualización)
    SELECT 'Estado' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización estado: ' || t.nombre_estado_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_estados t

    UNION ALL

    -- Estados (Eliminación)
    SELECT 'Estado' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación estado: ' || t.nombre_estado as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_estados t

    UNION ALL

    -- Municipios (Inserción)
    SELECT 'Municipio' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nuevo municipio: ' || t.nombre_municipio as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_municipios t

    UNION ALL

    -- Municipios (Actualización)
    SELECT 'Municipio' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización municipio: ' || t.nombre_municipio_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_municipios t

    UNION ALL

    -- Municipios (Eliminación)
    SELECT 'Municipio' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación municipio: ' || t.nombre_municipio as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_municipios t

    UNION ALL

    -- Parroquias (Inserción)
    SELECT 'Parroquia' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nueva parroquia: ' || t.nombre_parroquia as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_parroquias t

    UNION ALL
    
    -- Parroquias (Actualización)
    SELECT 'Parroquia' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización parroquia: ' || t.nombre_parroquia_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_parroquias t

    UNION ALL

    -- Parroquias (Eliminación)
    SELECT 'Parroquia' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación parroquia: ' || t.nombre_parroquia as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_parroquias t

    UNION ALL

    -- Núcleos (Inserción)
    SELECT 'Núcleo' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nuevo núcleo: ' || t.nombre_nucleo as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_nucleos t

    UNION ALL

    -- Núcleos (Actualización)
    SELECT 'Núcleo' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización núcleo: ' || t.nombre_nucleo_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_nucleos t

    UNION ALL

    -- Núcleos (Eliminación)
    SELECT 'Núcleo' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación núcleo: ' || t.nombre_nucleo as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_nucleos t

    UNION ALL

    -- Materias (Inserción)
    SELECT 'Materia' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nueva materia: ' || t.nombre_materia as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_materias t

    UNION ALL

    -- Materias (Actualización)
    SELECT 'Materia' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización materia: ' || t.nombre_materia_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_materias t

    UNION ALL

    -- Materias (Eliminación)
    SELECT 'Materia' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación materia: ' || t.nombre_materia as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_materias t

    UNION ALL

    -- Semestres (Inserción)
    SELECT 'Semestre' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nuevo semestre: ' || t.term as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_semestres t

    UNION ALL

    -- Semestres (Actualización)
    SELECT 'Semestre' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización semestre: ' || t.term as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_semestres t

    UNION ALL

    -- Semestres (Eliminación)
    SELECT 'Semestre' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación semestre: ' || t.term as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_semestres t

    UNION ALL

    -- Categorías (Inserción)
    SELECT 'Categoría' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nueva categoría: ' || t.nombre_categoria as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_categorias t

    UNION ALL

    -- Categorías (Actualización)
    SELECT 'Categoría' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización categoría: ' || t.nombre_categoria_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_categorias t

    UNION ALL

    -- Categorías (Eliminación)
    SELECT 'Categoría' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación categoría: ' || t.nombre_categoria as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_categorias t

    UNION ALL

    -- Subcategorías (Inserción)
    SELECT 'Subcategoría' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nueva subcategoría: ' || t.nombre_subcategoria as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_subcategorias t

    UNION ALL

    -- Subcategorías (Actualización)
    SELECT 'Subcategoría' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización subcategoría: ' || t.nombre_subcategoria_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_subcategorias t

    UNION ALL

    -- Subcategorías (Eliminación)
    SELECT 'Subcategoría' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación subcategoría: ' || t.nombre_subcategoria as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_subcategorias t

    UNION ALL

    -- Ámbitos Legales (Inserción)
    SELECT 'Ámbito Legal' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nuevo ámbito legal: ' || t.nombre_ambito_legal as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_ambitos_legales t

    UNION ALL

    -- Ámbitos Legales (Actualización)
    SELECT 'Ámbito Legal' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización ámbito legal: ' || t.nombre_ambito_legal_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_ambitos_legales t

    UNION ALL

    -- Ámbitos Legales (Eliminación)
    SELECT 'Ámbito Legal' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación ámbito legal: ' || t.nombre_ambito_legal as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_ambitos_legales t

    UNION ALL

    -- Niveles Educativos (Inserción)
    SELECT 'Nivel Educativo' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nuevo nivel educativo: ' || t.descripcion as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_niveles_educativos t

    UNION ALL

    -- Niveles Educativos (Actualización)
    SELECT 'Nivel Educativo' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización nivel educativo: ' || t.descripcion_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_niveles_educativos t

    UNION ALL

    -- Niveles Educativos (Eliminación)
    SELECT 'Nivel Educativo' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación nivel educativo: ' || t.descripcion as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_niveles_educativos t

    UNION ALL

    -- Condiciones Trabajo (Inserción)
    SELECT 'Condición Trabajo' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nueva condición trabajo: ' || t.nombre_trabajo as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_condiciones_trabajo t

    UNION ALL

    -- Condiciones Trabajo (Actualización)
    SELECT 'Condición Trabajo' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización condición trabajo: ' || t.nombre_trabajo_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_condiciones_trabajo t

    UNION ALL

    -- Condiciones Trabajo (Eliminación)
    SELECT 'Condición Trabajo' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación condición trabajo: ' || t.nombre_trabajo as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_condiciones_trabajo t

    UNION ALL

    -- Condiciones Actividad (Inserción)
    SELECT 'Condición Actividad' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nueva condición actividad: ' || t.nombre_actividad as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_condiciones_actividad t

    UNION ALL

    -- Condiciones Actividad (Actualización)
    SELECT 'Condición Actividad' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización condición actividad: ' || t.nombre_actividad_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_condiciones_actividad t

    UNION ALL

    -- Condiciones Actividad (Eliminación)
    SELECT 'Condición Actividad' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación condición actividad: ' || t.nombre_actividad as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_condiciones_actividad t

    UNION ALL

    -- Tipos Características (Inserción)
    SELECT 'Tipo Característica' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nuevo tipo característica: ' || t.nombre_tipo_caracteristica as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_tipos_caracteristicas t

    UNION ALL

    -- Tipos Características (Actualización)
    SELECT 'Tipo Característica' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización tipo característica: ' || t.nombre_tipo_caracteristica_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_tipos_caracteristicas t

    UNION ALL

    -- Tipos Características (Eliminación)
    SELECT 'Tipo Característica' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación tipo característica: ' || t.nombre_tipo_caracteristica as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_tipos_caracteristicas t

    UNION ALL

    -- Características (Inserción)
    SELECT 'Característica' as entidad, 'Creación' as accion, t.fecha_creacion as fecha, t.id_usuario_creo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_creo), t.id_usuario_creo) as usuario_nombre, 'Nueva característica: ' || t.descripcion as detalles, row_to_json(t.*)::text as metadata FROM auditoria_insercion_caracteristicas t

    UNION ALL

    -- Características (Actualización)
    SELECT 'Característica' as entidad, 'Actualización' as accion, t.fecha_actualizacion as fecha, t.id_usuario_actualizo as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_actualizo), t.id_usuario_actualizo) as usuario_nombre, 'Actualización característica: ' || t.descripcion_anterior as detalles, row_to_json(t.*)::text as metadata FROM auditoria_actualizacion_caracteristicas t

    UNION ALL

    -- Características (Eliminación)
    SELECT 'Característica' as entidad, 'Eliminación' as accion, t.fecha_eliminacion as fecha, t.id_usuario_elimino as usuario_id, COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_elimino), t.id_usuario_elimino) as usuario_nombre, 'Eliminación característica: ' || t.descripcion as detalles, row_to_json(t.*)::text as metadata FROM auditoria_eliminacion_caracteristicas t

) AS unified_logs
ORDER BY fecha DESC
LIMIT $1 OFFSET $2;
