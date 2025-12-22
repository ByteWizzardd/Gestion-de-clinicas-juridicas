-- Script: Eliminar usuario con correo siguzman.23@est.ucab.edu.ve
-- Fecha: 2025-01-XX
-- Descripción: Elimina el usuario y todas sus relaciones de forma segura

DO $$
DECLARE
    usuario_cedula VARCHAR(20);
    usuario_rol VARCHAR(20);
    secciones_count INTEGER;
BEGIN
    -- Paso 1: Obtener la cédula del usuario por su correo
    SELECT c.cedula, u.rol_sistema INTO usuario_cedula, usuario_rol
    FROM clientes c
    INNER JOIN usuarios u ON c.cedula = u.cedula
    WHERE c.correo_electronico = 'siguzman.23@est.ucab.edu.ve';
    
    -- Verificar si el usuario existe
    IF usuario_cedula IS NULL THEN
        RAISE NOTICE 'No se encontró usuario con el correo siguzman.23@est.ucab.edu.ve';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuario encontrado: Cédula = %, Rol = %', usuario_cedula, usuario_rol;
    
    -- Paso 2: Verificar y eliminar referencias en secciones (si es profesor o coordinador)
    -- Nota: Las secciones tienen NOT NULL, así que debemos eliminarlas si existen
    -- Primero eliminamos estudiantes de esas secciones, luego las secciones
    SELECT COUNT(*) INTO secciones_count
    FROM secciones
    WHERE cedula_profesor = usuario_cedula OR cedula_coordinador = usuario_cedula;
    
    IF secciones_count > 0 THEN
        RAISE WARNING 'El usuario tiene % sección(es) asignada(s). Estas se eliminarán también.', secciones_count;
        
        -- Eliminar estudiantes de las secciones que se van a eliminar
        DELETE FROM estudiantes
        WHERE (num_seccion, nrc_materia, term_semestre) IN (
            SELECT num_seccion, nrc_materia, term_semestre
            FROM secciones
            WHERE cedula_profesor = usuario_cedula OR cedula_coordinador = usuario_cedula
        );
        
        IF FOUND THEN
            RAISE NOTICE 'Estudiantes eliminados de las secciones afectadas';
        END IF;
        
        -- Ahora eliminar las secciones
        DELETE FROM secciones 
        WHERE cedula_profesor = usuario_cedula OR cedula_coordinador = usuario_cedula;
        
        RAISE NOTICE 'Secciones eliminadas';
    END IF;
    
    -- Paso 3: Eliminar referencias en supervisa y se_le_asigna (si es estudiante o profesor)
    -- Nota: La tabla asignaciones ya no existe, se usa supervisa y se_le_asigna
    DELETE FROM supervisa 
    WHERE cedula_profesor = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Referencias eliminadas de la tabla supervisa';
    END IF;
    
    DELETE FROM se_le_asigna 
    WHERE cedula_estudiante = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Referencias eliminadas de la tabla se_le_asigna';
    END IF;
    
    -- Paso 4: Eliminar referencias en acciones
    DELETE FROM acciones 
    WHERE cedula_usuario_registra = usuario_cedula OR cedula_usuario_ejecuta = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Referencias eliminadas de la tabla acciones';
    END IF;
    
    -- Paso 5: Eliminar referencias en cambios_estatus
    DELETE FROM cambios_estatus 
    WHERE cedula_usuario = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Referencias eliminadas de la tabla cambios_estatus';
    END IF;
    
    -- Paso 6: Eliminar referencias en orientaciones
    DELETE FROM orientaciones 
    WHERE cedula_usuario = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Referencias eliminadas de la tabla orientaciones';
    END IF;
    
    -- Paso 7: Eliminar de estudiantes si existe
    DELETE FROM estudiantes 
    WHERE cedula_estudiante = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Usuario eliminado de la tabla estudiantes';
    END IF;
    
    -- Paso 8: Eliminar de profesores si existe
    DELETE FROM profesores 
    WHERE cedula_profesor = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Usuario eliminado de la tabla profesores';
    END IF;
    
    -- Paso 9: Eliminar de coordinadores si existe
    DELETE FROM coordinadores 
    WHERE cedula_coordinador = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Usuario eliminado de la tabla coordinadores';
    END IF;
    
    -- Paso 10: Eliminar de usuarios
    DELETE FROM usuarios 
    WHERE cedula = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Usuario eliminado de la tabla usuarios';
    END IF;
    
    -- Paso 11: Eliminar de clientes (esto eliminará el registro completo)
    DELETE FROM clientes 
    WHERE cedula = usuario_cedula;
    
    IF FOUND THEN
        RAISE NOTICE 'Cliente eliminado de la tabla clientes';
        RAISE NOTICE 'Usuario con correo siguzman.23@est.ucab.edu.ve eliminado exitosamente';
    ELSE
        RAISE WARNING 'No se pudo eliminar el cliente con cédula %', usuario_cedula;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al eliminar usuario: %', SQLERRM;
END $$;

