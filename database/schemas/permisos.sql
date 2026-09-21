-- Roles de la aplicación y permisos. Ejecutar al final.

-- Creación de roles si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_coordinador') THEN CREATE ROLE rol_coordinador; END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_profesor') THEN CREATE ROLE rol_profesor; END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_estudiante') THEN CREATE ROLE rol_estudiante; END IF;
END
$$;

-- Permitir al usuario owner/conexión cambiar a estos roles
GRANT rol_coordinador TO current_user;
GRANT rol_profesor TO current_user;
GRANT rol_estudiante TO current_user;

-- Los roles necesitan poder usar el esquema para acceder a sus tablas
GRANT USAGE ON SCHEMA public TO rol_coordinador, rol_profesor, rol_estudiante;


-- Permisos sobre catálogos
GRANT ALL PRIVILEGES ON TABLE 
    estados, municipios, parroquias, nucleos,
    niveles_educativos, condicion_trabajo, condicion_actividad, tipo_caracteristicas,
    materias, categorias, subcategorias, ambitos_legales,
    caracteristicas, semestres
TO rol_coordinador;

GRANT SELECT ON TABLE 
    estados, municipios, parroquias, nucleos,
    niveles_educativos, condicion_trabajo, condicion_actividad, tipo_caracteristicas,
    materias, categorias, subcategorias, ambitos_legales,
    caracteristicas, semestres
TO rol_profesor, rol_estudiante;

-- Gestión de usuarios
GRANT ALL PRIVILEGES ON TABLE usuarios, coordinadores, profesores, estudiantes TO rol_coordinador;
GRANT SELECT ON TABLE usuarios, estudiantes, profesores TO rol_profesor;

-- Permisos básicos de vista de usuarios para estudiantes
GRANT SELECT(cedula, nombres, apellidos, correo_electronico, tipo_usuario) ON TABLE usuarios TO rol_estudiante;
GRANT SELECT ON TABLE estudiantes, profesores TO rol_estudiante;

-- Operativa (Casos, Solicitantes, Citas, Acciones, Soportes)
GRANT ALL PRIVILEGES ON TABLE 
    casos, solicitantes, viviendas, familias_y_hogares, asignadas_a,
    beneficiarios, citas, atienden, acciones, ejecutan, soportes, cambio_estatus,
    supervisa, se_le_asigna, ocurren_en
TO rol_coordinador;

-- Estudiantes y Profesores: CRUD en operativa (sujeto a FK)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE 
    casos, solicitantes, beneficiarios, citas, atienden, acciones, ejecutan, soportes, ocurren_en
TO rol_profesor, rol_estudiante;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE viviendas, familias_y_hogares, asignadas_a TO rol_profesor, rol_estudiante;
GRANT SELECT, INSERT, DELETE ON TABLE cambio_estatus TO rol_profesor, rol_estudiante;

-- Tablas de asignación de equipo: La app asigna/desasigna profesores y estudiantes a casos
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE supervisa, se_le_asigna TO rol_profesor, rol_estudiante;

-- Permisos de Auditoría (Insert para todos, Select solo coordinador)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_coordinador, rol_profesor, rol_estudiante;

-- Permisos de ejecución de funciones
GRANT EXECUTE ON FUNCTION eliminar_caso_fisico(INTEGER, VARCHAR, TEXT) TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT EXECUTE ON FUNCTION eliminar_usuario_fisico(VARCHAR, VARCHAR, TEXT) TO rol_coordinador;
GRANT EXECUTE ON FUNCTION toggle_habilitado_usuario(VARCHAR, VARCHAR) TO rol_coordinador;

-- Notificaciones y recuperación de contraseña: la app las usa con el rol del usuario
GRANT ALL PRIVILEGES ON TABLE notificaciones, password_reset_tokens TO rol_coordinador, rol_profesor, rol_estudiante;

-- Permisos para la nueva tabla unificada de auditoría
GRANT INSERT, UPDATE ON auditoria_eventos TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT SELECT ON auditoria_eventos TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE auditoria_eventos_id_seq TO rol_coordinador, rol_profesor, rol_estudiante;

-- Sesiones, reportes y descargas de soportes viven en auditoria_eventos
-- (entidad='sesion'|'reporte'|'soporte') desde la migración
-- 20260910_120000_unificar_sesiones_reportes_soportes_en_auditoria_eventos.sql —
-- ya no tienen tablas propias (auditoria_sesiones, auditoria_reportes,
-- auditoria_descarga_soportes fueron eliminadas).
