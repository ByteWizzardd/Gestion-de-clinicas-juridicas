-- Triggers (sincronización de semestres, estatus inicial, auditoría). Requiere funciones.sql.

-- Tabla: usuarios
DROP TRIGGER IF EXISTS trigger_assign_nombre_usuario ON usuarios;
CREATE TRIGGER trigger_assign_nombre_usuario BEFORE INSERT OR UPDATE ON public.usuarios FOR EACH ROW WHEN (((new.nombre_usuario IS NULL) OR ((new.nombre_usuario)::text = ''::text))) EXECUTE FUNCTION assign_nombre_usuario_from_email();

-- Tabla: casos
DROP TRIGGER IF EXISTS trigger_crear_cambio_estatus_inicial ON casos;
CREATE TRIGGER trigger_crear_cambio_estatus_inicial AFTER INSERT ON public.casos FOR EACH ROW EXECUTE FUNCTION trigger_crear_cambio_estatus_inicial();

-- =========================================================
-- TRIGGERS DE SINCRONIZACIÓN (OCURREN_EN)
-- =========================================================

DROP TRIGGER IF EXISTS trigger_sync_semestre_asignacion ON se_le_asigna;
CREATE TRIGGER trigger_sync_semestre_asignacion
AFTER INSERT ON se_le_asigna
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_asignacion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_supervision ON supervisa;
CREATE TRIGGER trigger_sync_semestre_supervision
AFTER INSERT ON supervisa
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_asignacion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_caso ON casos;
CREATE TRIGGER trigger_sync_semestre_caso
AFTER INSERT OR UPDATE OF fecha_inicio_caso ON casos
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_caso();

DROP TRIGGER IF EXISTS trigger_sync_semestre_accion ON acciones;
CREATE TRIGGER trigger_sync_semestre_accion
AFTER INSERT ON acciones
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_accion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_cita ON citas;
CREATE TRIGGER trigger_sync_semestre_cita
AFTER INSERT OR UPDATE OF fecha_encuentro ON citas
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_cita();

DROP TRIGGER IF EXISTS trigger_sync_semestre_estatus ON cambio_estatus;
CREATE TRIGGER trigger_sync_semestre_estatus
AFTER INSERT ON cambio_estatus
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_estatus();

DROP TRIGGER IF EXISTS trigger_sync_semestre_soporte ON soportes;
CREATE TRIGGER trigger_sync_semestre_soporte
AFTER INSERT ON soportes
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_soporte();

DROP TRIGGER IF EXISTS trigger_sync_semestre_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_sync_semestre_beneficiario
AFTER INSERT ON beneficiarios
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_beneficiario();


-- =========================================================
-- ASIGNACIÓN DE TRIGGERS DE AUDITORÍA
-- =========================================================

CREATE TRIGGER trg_audit_estados AFTER INSERT OR UPDATE OR DELETE ON estados FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('estado', 'id_estado');
CREATE TRIGGER trg_audit_niveles_educativos AFTER INSERT OR UPDATE OR DELETE ON niveles_educativos FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('nivel_educativo', 'id_nivel_educativo');
CREATE TRIGGER trg_audit_condicion_trabajo AFTER INSERT OR UPDATE OR DELETE ON condicion_trabajo FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('condicion_trabajo', 'id_trabajo');
CREATE TRIGGER trg_audit_condicion_actividad AFTER INSERT OR UPDATE OR DELETE ON condicion_actividad FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('condicion_actividad', 'id_actividad');
CREATE TRIGGER trg_audit_tipo_caracteristicas AFTER INSERT OR UPDATE OR DELETE ON tipo_caracteristicas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('tipo_caracteristica', 'id_tipo');
CREATE TRIGGER trg_audit_materias AFTER INSERT OR UPDATE OR DELETE ON materias FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('materia', 'id_materia');
CREATE TRIGGER trg_audit_semestres AFTER INSERT OR UPDATE OR DELETE ON semestres FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('semestre', 'term');
CREATE TRIGGER trg_audit_usuarios AFTER INSERT OR UPDATE OR DELETE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('usuario', 'cedula');
CREATE TRIGGER trg_audit_municipios AFTER INSERT OR UPDATE OR DELETE ON municipios FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('municipio', 'id_estado,num_municipio');
CREATE TRIGGER trg_audit_parroquias AFTER INSERT OR UPDATE OR DELETE ON parroquias FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('parroquia', 'id_estado,num_municipio,num_parroquia');
CREATE TRIGGER trg_audit_nucleos AFTER INSERT OR UPDATE OR DELETE ON nucleos FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('nucleo', 'id_nucleo');
CREATE TRIGGER trg_audit_solicitantes AFTER INSERT OR UPDATE OR DELETE ON solicitantes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('solicitante', 'cedula');
CREATE TRIGGER trg_audit_viviendas AFTER INSERT OR UPDATE OR DELETE ON viviendas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('vivienda', 'cedula_solicitante');
CREATE TRIGGER trg_audit_familias_y_hogares AFTER INSERT OR UPDATE OR DELETE ON familias_y_hogares FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('familia_y_hogar', 'cedula_solicitante');
CREATE TRIGGER trg_audit_caracteristicas AFTER INSERT OR UPDATE OR DELETE ON caracteristicas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('caracteristica', 'id_tipo_caracteristica,num_caracteristica');
CREATE TRIGGER trg_audit_categorias AFTER INSERT OR UPDATE OR DELETE ON categorias FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('categoria', 'num_categoria,id_materia');
CREATE TRIGGER trg_audit_subcategorias AFTER INSERT OR UPDATE OR DELETE ON subcategorias FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('subcategoria', 'num_subcategoria,num_categoria,id_materia');
CREATE TRIGGER trg_audit_ambitos_legales AFTER INSERT OR UPDATE OR DELETE ON ambitos_legales FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('ambito_legal', 'id_materia,num_categoria,num_subcategoria,num_ambito_legal');
CREATE TRIGGER trg_audit_casos AFTER INSERT OR UPDATE OR DELETE ON casos FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('caso', 'id_caso');
CREATE TRIGGER trg_audit_citas AFTER INSERT OR UPDATE OR DELETE ON citas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('cita', 'num_cita,id_caso');
CREATE TRIGGER trg_audit_acciones AFTER INSERT OR UPDATE OR DELETE ON acciones FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('accion', 'num_accion,id_caso');
CREATE TRIGGER trg_audit_soportes AFTER INSERT OR UPDATE OR DELETE ON soportes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('soporte', 'num_soporte,id_caso');
CREATE TRIGGER trg_audit_beneficiarios AFTER INSERT OR UPDATE OR DELETE ON beneficiarios FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('beneficiario', 'num_beneficiario,id_caso');
-- Historial de estatus, inscripciones por semestre y personas que atienden una
-- cita (ver migración 20260913_191000_auditar_estatus_inscripciones_atenciones.sql).
CREATE TRIGGER trg_audit_cambio_estatus AFTER INSERT ON cambio_estatus FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('cambio_estatus', 'num_cambio,id_caso');
CREATE TRIGGER trg_audit_estudiantes AFTER INSERT OR UPDATE ON estudiantes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('estudiante', 'term,cedula_estudiante');
CREATE TRIGGER trg_audit_profesores AFTER INSERT OR UPDATE ON profesores FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('profesor', 'term,cedula_profesor');
CREATE TRIGGER trg_audit_atienden AFTER INSERT OR DELETE ON atienden FOR EACH ROW EXECUTE FUNCTION fn_auditoria_generica('atencion_cita', 'num_cita,id_caso,id_usuario');

-- NOTA: Las tablas asociativas (ejecutan, equipo, sesiones) NO llevan trigger aquí 
-- porque se auditarán manualmente desde el código de la aplicación.
