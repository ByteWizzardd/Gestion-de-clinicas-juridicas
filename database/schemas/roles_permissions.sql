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
    supervisa, se_le_asigna
TO rol_coordinador;

-- Estudiantes y Profesores: CRUD en operativa (sujeto a FK)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE 
    casos, solicitantes, beneficiarios, citas, atienden, acciones, ejecutan, soportes
TO rol_profesor, rol_estudiante;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE viviendas, familias_y_hogares, asignadas_a TO rol_profesor, rol_estudiante;
GRANT SELECT, INSERT, DELETE ON TABLE cambio_estatus TO rol_profesor, rol_estudiante;

-- Tablas de asignación de equipo: La app asigna/desasigna profesores y estudiantes a casos
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE supervisa, se_le_asigna TO rol_profesor, rol_estudiante;

-- Permisos de Auditoría (Insert para todos, Select solo coordinador)
GRANT INSERT ON TABLE 
    auditoria_insercion_estados, auditoria_actualizacion_estados, auditoria_eliminacion_estados,
    auditoria_insercion_niveles_educativos, auditoria_actualizacion_niveles_educativos, auditoria_eliminacion_niveles_educativos,
    auditoria_insercion_condiciones_trabajo, auditoria_actualizacion_condiciones_trabajo, auditoria_eliminacion_condiciones_trabajo,
    auditoria_insercion_condiciones_actividad, auditoria_actualizacion_condiciones_actividad, auditoria_eliminacion_condiciones_actividad,
    auditoria_insercion_tipos_caracteristicas, auditoria_actualizacion_tipos_caracteristicas, auditoria_eliminacion_tipos_caracteristicas,
    auditoria_insercion_materias, auditoria_actualizacion_materias, auditoria_eliminacion_materias,
    auditoria_insercion_semestres, auditoria_actualizacion_semestres, auditoria_eliminacion_semestres,
    auditoria_insercion_usuarios, auditoria_actualizacion_usuarios, auditoria_eliminacion_usuario,
    auditoria_insercion_municipios, auditoria_actualizacion_municipios, auditoria_eliminacion_municipios,
    auditoria_insercion_parroquias, auditoria_actualizacion_parroquias, auditoria_eliminacion_parroquias,
    auditoria_insercion_nucleos, auditoria_actualizacion_nucleos, auditoria_eliminacion_nucleos,
    auditoria_insercion_solicitantes, auditoria_actualizacion_solicitantes, auditoria_eliminacion_solicitantes,
    auditoria_insercion_caracteristicas, auditoria_actualizacion_caracteristicas, auditoria_eliminacion_caracteristicas,
    auditoria_insercion_categorias, auditoria_actualizacion_categorias, auditoria_eliminacion_categorias,
    auditoria_insercion_subcategorias, auditoria_actualizacion_subcategorias, auditoria_eliminacion_subcategorias,
    auditoria_insercion_ambitos_legales, auditoria_actualizacion_ambitos_legales, auditoria_eliminacion_ambitos_legales,
    auditoria_insercion_estudiantes, auditoria_insercion_profesores,
    auditoria_insercion_casos, auditoria_actualizacion_casos, auditoria_eliminacion_casos,
    auditoria_actualizacion_equipo, auditoria_actualizacion_equipo_anterior, auditoria_actualizacion_equipo_nuevo,
    auditoria_insercion_citas, auditoria_actualizacion_citas, auditoria_eliminacion_citas,
    auditoria_insercion_acciones, auditoria_insercion_acciones_ejecutores,
    auditoria_actualizacion_acciones, auditoria_actualizacion_acciones_ejecutores,
    auditoria_eliminacion_acciones, auditoria_eliminacion_acciones_ejecutores,
    auditoria_insercion_soportes, auditoria_eliminacion_soportes, auditoria_descarga_soportes,
    auditoria_insercion_beneficiarios, auditoria_actualizacion_beneficiarios, auditoria_eliminacion_beneficiarios,
    auditoria_reportes
TO rol_coordinador, rol_profesor, rol_estudiante;

GRANT SELECT ON TABLE 
    auditoria_insercion_estados, auditoria_actualizacion_estados, auditoria_eliminacion_estados,
    auditoria_insercion_niveles_educativos, auditoria_actualizacion_niveles_educativos, auditoria_eliminacion_niveles_educativos,
    auditoria_insercion_condiciones_trabajo, auditoria_actualizacion_condiciones_trabajo, auditoria_eliminacion_condiciones_trabajo,
    auditoria_insercion_condiciones_actividad, auditoria_actualizacion_condiciones_actividad, auditoria_eliminacion_condiciones_actividad,
    auditoria_insercion_tipos_caracteristicas, auditoria_actualizacion_tipos_caracteristicas, auditoria_eliminacion_tipos_caracteristicas,
    auditoria_insercion_materias, auditoria_actualizacion_materias, auditoria_eliminacion_materias,
    auditoria_insercion_semestres, auditoria_actualizacion_semestres, auditoria_eliminacion_semestres,
    auditoria_insercion_usuarios, auditoria_actualizacion_usuarios, auditoria_eliminacion_usuario,
    auditoria_insercion_municipios, auditoria_actualizacion_municipios, auditoria_eliminacion_municipios,
    auditoria_insercion_parroquias, auditoria_actualizacion_parroquias, auditoria_eliminacion_parroquias,
    auditoria_insercion_nucleos, auditoria_actualizacion_nucleos, auditoria_eliminacion_nucleos,
    auditoria_insercion_solicitantes, auditoria_actualizacion_solicitantes, auditoria_eliminacion_solicitantes,
    auditoria_insercion_caracteristicas, auditoria_actualizacion_caracteristicas, auditoria_eliminacion_caracteristicas,
    auditoria_insercion_categorias, auditoria_actualizacion_categorias, auditoria_eliminacion_categorias,
    auditoria_insercion_subcategorias, auditoria_actualizacion_subcategorias, auditoria_eliminacion_subcategorias,
    auditoria_insercion_ambitos_legales, auditoria_actualizacion_ambitos_legales, auditoria_eliminacion_ambitos_legales,
    auditoria_insercion_estudiantes, auditoria_insercion_profesores,
    auditoria_insercion_casos, auditoria_actualizacion_casos, auditoria_eliminacion_casos,
    auditoria_actualizacion_equipo, auditoria_actualizacion_equipo_anterior, auditoria_actualizacion_equipo_nuevo,
    auditoria_insercion_citas, auditoria_actualizacion_citas, auditoria_eliminacion_citas,
    auditoria_insercion_acciones, auditoria_insercion_acciones_ejecutores,
    auditoria_actualizacion_acciones, auditoria_actualizacion_acciones_ejecutores,
    auditoria_eliminacion_acciones, auditoria_eliminacion_acciones_ejecutores,
    auditoria_insercion_soportes, auditoria_eliminacion_soportes, auditoria_descarga_soportes,
    auditoria_insercion_beneficiarios, auditoria_actualizacion_beneficiarios, auditoria_eliminacion_beneficiarios,
    auditoria_reportes
TO rol_coordinador;

-- Accesos generales
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT ALL PRIVILEGES ON TABLE notificaciones, password_reset_tokens TO rol_coordinador, rol_profesor, rol_estudiante;

-- Auditoría de sesiones (login/logout de usuarios)
-- Coordinador puede ver el historial de sesiones
GRANT SELECT, INSERT, UPDATE ON TABLE auditoria_sesiones TO rol_coordinador;
-- Profesores y estudiantes solo pueden registrar sus propias sesiones (no ver)
GRANT INSERT, UPDATE ON TABLE auditoria_sesiones TO rol_profesor, rol_estudiante;

-- Permisos de ejecución de funciones
-- Todos los roles pueden eliminar casos físicamente (ya tienen DELETE en tablas)
GRANT EXECUTE ON FUNCTION eliminar_caso_fisico(INTEGER, VARCHAR, TEXT) TO rol_coordinador, rol_profesor, rol_estudiante;

-- Solo coordinador gestiona usuarios
GRANT EXECUTE ON FUNCTION eliminar_usuario_fisico(VARCHAR, VARCHAR, TEXT) TO rol_coordinador;
GRANT EXECUTE ON FUNCTION toggle_habilitado_usuario(VARCHAR, VARCHAR) TO rol_coordinador;
GRANT EXECUTE ON PROCEDURE update_all_by_cedula(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO rol_coordinador;

-- Permisos para auditoría de usuarios
GRANT ALL PRIVILEGES ON auditoria_insercion_usuarios TO rol_coordinador;
GRANT ALL PRIVILEGES ON auditoria_actualizacion_usuarios TO rol_coordinador;
GRANT ALL PRIVILEGES ON auditoria_eliminacion_usuario TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE auditoria_insercion_usuarios_id_seq TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE auditoria_actualizacion_usuarios_id_seq TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE auditoria_eliminacion_usuario_id_seq TO rol_coordinador;

-- Garantizar permisos completos sobre auditoría de eliminación de casos
GRANT ALL PRIVILEGES ON TABLE auditoria_eliminacion_casos TO rol_coordinador;
GRANT INSERT, SELECT ON TABLE auditoria_eliminacion_casos TO rol_profesor, rol_estudiante;
GRANT USAGE, SELECT ON SEQUENCE auditoria_eliminacion_casos_id_seq TO rol_coordinador, rol_profesor, rol_estudiante;
