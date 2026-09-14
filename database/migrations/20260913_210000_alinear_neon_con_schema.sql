-- =============================================================================
-- Alinear Neon con database/schemas/schema.sql
-- =============================================================================
-- Un comparador (esquema temporal creado con schema.sql dentro de una
-- transacción revertida vs. public) encontró que Neon y schema.sql divergían.
-- Esta migración corrige el lado de Neon en lo que schema.sql tiene razón; el
-- resto (columnas de trazabilidad, tablas notificaciones/password_reset_tokens,
-- índices, tipos) se llevó a schema.sql, que ahora refleja a Neon.
--
-- 1. Claves foráneas sin reglas: Neon las tenía todas con NO ACTION; schema.sql
--    declara ON UPDATE CASCADE / ON DELETE RESTRICT. Sin el CASCADE, mover una
--    subcategoría con ámbitos legales fallaba (la app hace UPDATE de la PK y
--    cuenta con que se propague a ambitos_legales y casos).
-- 2. Archivos solo por URL (Vercel Blob):
--    * usuarios.foto_perfil pasa de BYTEA a VARCHAR(500). La única foto guardada
--      en bytes se exportó antes a database/respaldo-archivos-legacy/.
--    * soportes.documento_data (BYTEA) se elimina y url_documento pasa a NOT
--      NULL. El único soporte que solo existía en bytes (caso #58, exportado)
--      se elimina: sin archivo no se puede descargar; se vuelve a subir desde
--      la app.
-- 3. view_casos_detalle expone nombre_ambito_legal, como en schema.sql.
-- 4. Funciones que solo existían en Neon y nada usa: show_db_tree,
--    validate_cliente_solicitante_on_caso, validate_solicitante_completo y la
--    sobrecarga vieja toggle_habilitado_usuario(varchar) (la app usa la de 2
--    parámetros).
-- =============================================================================

BEGIN;

SELECT set_config('app.audit_metadata', json_build_object(
    'accion_negocio', 'Alineación del esquema de base de datos',
    'motivo', 'Migración 20260913_210000: archivos solo por URL de Vercel Blob, el archivo se exportó y debe volver a subirse'
)::text, true);

-- 1. Reglas ON UPDATE / ON DELETE de las claves foráneas
ALTER TABLE acciones DROP CONSTRAINT acciones_id_caso_fkey, ADD CONSTRAINT acciones_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE acciones DROP CONSTRAINT acciones_id_usuario_registra_fkey, ADD CONSTRAINT acciones_id_usuario_registra_fkey FOREIGN KEY (id_usuario_registra) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ambitos_legales DROP CONSTRAINT ambitos_legales_id_materia_num_categoria_num_subcategoria_fkey, ADD CONSTRAINT ambitos_legales_id_materia_num_categoria_num_subcategoria_fkey FOREIGN KEY (id_materia, num_categoria, num_subcategoria) REFERENCES subcategorias(id_materia, num_categoria, num_subcategoria) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE asignadas_a DROP CONSTRAINT asignadas_a_cedula_solicitante_fkey, ADD CONSTRAINT asignadas_a_cedula_solicitante_fkey FOREIGN KEY (cedula_solicitante) REFERENCES viviendas(cedula_solicitante) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE asignadas_a DROP CONSTRAINT asignadas_a_id_tipo_caracteristica_num_caracteristica_fkey, ADD CONSTRAINT asignadas_a_id_tipo_caracteristica_num_caracteristica_fkey FOREIGN KEY (id_tipo_caracteristica, num_caracteristica) REFERENCES caracteristicas(id_tipo_caracteristica, num_caracteristica) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE atienden DROP CONSTRAINT atienden_id_usuario_fkey, ADD CONSTRAINT atienden_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE atienden DROP CONSTRAINT atienden_num_cita_id_caso_fkey, ADD CONSTRAINT atienden_num_cita_id_caso_fkey FOREIGN KEY (num_cita, id_caso) REFERENCES citas(num_cita, id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE beneficiarios DROP CONSTRAINT beneficiarios_id_caso_fkey, ADD CONSTRAINT beneficiarios_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE beneficiarios DROP CONSTRAINT beneficiarios_id_usuario_registro_fkey, ADD CONSTRAINT beneficiarios_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE cambio_estatus DROP CONSTRAINT cambio_estatus_id_caso_fkey, ADD CONSTRAINT cambio_estatus_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE cambio_estatus DROP CONSTRAINT cambio_estatus_id_usuario_cambia_fkey, ADD CONSTRAINT cambio_estatus_id_usuario_cambia_fkey FOREIGN KEY (id_usuario_cambia) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE caracteristicas DROP CONSTRAINT caracteristicas_id_tipo_caracteristica_fkey, ADD CONSTRAINT caracteristicas_id_tipo_caracteristica_fkey FOREIGN KEY (id_tipo_caracteristica) REFERENCES tipo_caracteristicas(id_tipo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE casos DROP CONSTRAINT casos_cedula_fkey, ADD CONSTRAINT casos_cedula_fkey FOREIGN KEY (cedula) REFERENCES solicitantes(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE casos DROP CONSTRAINT casos_id_materia_num_categoria_num_subcategoria_num_ambito_fkey, ADD CONSTRAINT casos_id_materia_num_categoria_num_subcategoria_num_ambito_fkey FOREIGN KEY (id_materia, num_categoria, num_subcategoria, num_ambito_legal) REFERENCES ambitos_legales(id_materia, num_categoria, num_subcategoria, num_ambito_legal) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE casos DROP CONSTRAINT casos_id_nucleo_fkey, ADD CONSTRAINT casos_id_nucleo_fkey FOREIGN KEY (id_nucleo) REFERENCES nucleos(id_nucleo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE categorias DROP CONSTRAINT categorias_id_materia_fkey, ADD CONSTRAINT categorias_id_materia_fkey FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE citas DROP CONSTRAINT citas_id_caso_fkey, ADD CONSTRAINT citas_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE citas DROP CONSTRAINT citas_id_usuario_registro_fkey, ADD CONSTRAINT citas_id_usuario_registro_fkey FOREIGN KEY (id_usuario_registro) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE coordinadores DROP CONSTRAINT coordinadores_id_coordinador_fkey, ADD CONSTRAINT coordinadores_id_coordinador_fkey FOREIGN KEY (id_coordinador) REFERENCES usuarios(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE coordinadores DROP CONSTRAINT coordinadores_term_fkey, ADD CONSTRAINT coordinadores_term_fkey FOREIGN KEY (term) REFERENCES semestres(term) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ejecutan DROP CONSTRAINT ejecutan_id_usuario_ejecuta_fkey, ADD CONSTRAINT ejecutan_id_usuario_ejecuta_fkey FOREIGN KEY (id_usuario_ejecuta) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ejecutan DROP CONSTRAINT ejecutan_num_accion_id_caso_fkey, ADD CONSTRAINT ejecutan_num_accion_id_caso_fkey FOREIGN KEY (num_accion, id_caso) REFERENCES acciones(num_accion, id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE estudiantes DROP CONSTRAINT estudiantes_cedula_estudiante_fkey, ADD CONSTRAINT estudiantes_cedula_estudiante_fkey FOREIGN KEY (cedula_estudiante) REFERENCES usuarios(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE estudiantes DROP CONSTRAINT estudiantes_term_fkey, ADD CONSTRAINT estudiantes_term_fkey FOREIGN KEY (term) REFERENCES semestres(term) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE familias_y_hogares DROP CONSTRAINT familias_y_hogares_cedula_solicitante_fkey, ADD CONSTRAINT familias_y_hogares_cedula_solicitante_fkey FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE familias_y_hogares DROP CONSTRAINT familias_y_hogares_id_nivel_educativo_jefe_fkey, ADD CONSTRAINT familias_y_hogares_id_nivel_educativo_jefe_fkey FOREIGN KEY (id_nivel_educativo_jefe) REFERENCES niveles_educativos(id_nivel_educativo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE municipios DROP CONSTRAINT municipios_id_estado_fkey, ADD CONSTRAINT municipios_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES estados(id_estado) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE nucleos DROP CONSTRAINT nucleos_id_estado_num_municipio_num_parroquia_fkey, ADD CONSTRAINT nucleos_id_estado_num_municipio_num_parroquia_fkey FOREIGN KEY (id_estado, num_municipio, num_parroquia) REFERENCES parroquias(id_estado, num_municipio, num_parroquia) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE parroquias DROP CONSTRAINT parroquias_id_estado_num_municipio_fkey, ADD CONSTRAINT parroquias_id_estado_num_municipio_fkey FOREIGN KEY (id_estado, num_municipio) REFERENCES municipios(id_estado, num_municipio) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE profesores DROP CONSTRAINT profesores_cedula_profesor_fkey, ADD CONSTRAINT profesores_cedula_profesor_fkey FOREIGN KEY (cedula_profesor) REFERENCES usuarios(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE profesores DROP CONSTRAINT profesores_term_fkey, ADD CONSTRAINT profesores_term_fkey FOREIGN KEY (term) REFERENCES semestres(term) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE se_le_asigna DROP CONSTRAINT se_le_asigna_id_caso_fkey, ADD CONSTRAINT se_le_asigna_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE se_le_asigna DROP CONSTRAINT se_le_asigna_term_cedula_estudiante_fkey, ADD CONSTRAINT se_le_asigna_term_cedula_estudiante_fkey FOREIGN KEY (term, cedula_estudiante) REFERENCES estudiantes(term, cedula_estudiante) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE solicitantes DROP CONSTRAINT solicitantes_id_actividad_fkey, ADD CONSTRAINT solicitantes_id_actividad_fkey FOREIGN KEY (id_actividad) REFERENCES condicion_actividad(id_actividad) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE solicitantes DROP CONSTRAINT solicitantes_id_estado_num_municipio_num_parroquia_fkey, ADD CONSTRAINT solicitantes_id_estado_num_municipio_num_parroquia_fkey FOREIGN KEY (id_estado, num_municipio, num_parroquia) REFERENCES parroquias(id_estado, num_municipio, num_parroquia) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE solicitantes DROP CONSTRAINT solicitantes_id_nivel_educativo_fkey, ADD CONSTRAINT solicitantes_id_nivel_educativo_fkey FOREIGN KEY (id_nivel_educativo) REFERENCES niveles_educativos(id_nivel_educativo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE solicitantes DROP CONSTRAINT solicitantes_id_trabajo_fkey, ADD CONSTRAINT solicitantes_id_trabajo_fkey FOREIGN KEY (id_trabajo) REFERENCES condicion_trabajo(id_trabajo) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE soportes DROP CONSTRAINT soportes_id_caso_fkey, ADD CONSTRAINT soportes_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE soportes DROP CONSTRAINT soportes_id_usuario_subio_fkey, ADD CONSTRAINT soportes_id_usuario_subio_fkey FOREIGN KEY (id_usuario_subio) REFERENCES usuarios(cedula) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE subcategorias DROP CONSTRAINT subcategorias_id_materia_num_categoria_fkey, ADD CONSTRAINT subcategorias_id_materia_num_categoria_fkey FOREIGN KEY (id_materia, num_categoria) REFERENCES categorias(id_materia, num_categoria) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE supervisa DROP CONSTRAINT supervisa_id_caso_fkey, ADD CONSTRAINT supervisa_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES casos(id_caso) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE supervisa DROP CONSTRAINT supervisa_term_cedula_profesor_fkey, ADD CONSTRAINT supervisa_term_cedula_profesor_fkey FOREIGN KEY (term, cedula_profesor) REFERENCES profesores(term, cedula_profesor) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE viviendas DROP CONSTRAINT viviendas_cedula_solicitante_fkey, ADD CONSTRAINT viviendas_cedula_solicitante_fkey FOREIGN KEY (cedula_solicitante) REFERENCES solicitantes(cedula) ON UPDATE CASCADE ON DELETE RESTRICT;

-- 2a. Fotos de perfil: solo URL
ALTER TABLE usuarios ALTER COLUMN foto_perfil TYPE VARCHAR(500) USING NULL;

-- 2b. Soportes: solo URL. Se quita la columna antes del DELETE para que el
--     evento de auditoría no copie el archivo completo.
ALTER TABLE soportes DROP COLUMN IF EXISTS documento_data;
DELETE FROM soportes WHERE url_documento IS NULL;
ALTER TABLE soportes ALTER COLUMN url_documento SET NOT NULL;

-- 3. Vista de casos con el nombre del ámbito legal
CREATE OR REPLACE VIEW view_casos_detalle AS
SELECT c.id_caso,
    c.fecha_solicitud,
    c.fecha_inicio_caso,
    c.fecha_fin_caso,
    c.tramite,
    c.observaciones,
    c.id_nucleo,
    c.cedula,
    c.id_materia,
    c.num_categoria,
    c.num_subcategoria,
    c.num_ambito_legal,
    COALESCE(( SELECT ce.nuevo_estatus
           FROM cambio_estatus ce
          WHERE (ce.id_caso = c.id_caso)
          ORDER BY ce.fecha DESC, ce.num_cambio DESC
         LIMIT 1), 'En proceso'::character varying) AS estatus,
    COALESCE(( SELECT count(*) AS count
           FROM beneficiarios b
          WHERE (b.id_caso = c.id_caso)), (0)::bigint) AS cant_beneficiarios,
    s.nombres AS nombres_solicitante,
    s.apellidos AS apellidos_solicitante,
    (((s.nombres)::text || ' '::text) || (s.apellidos)::text) AS nombre_completo_solicitante,
    n.nombre_nucleo,
    m.nombre_materia,
    cat.nombre_categoria,
    sub.nombre_subcategoria,
    al.nombre_ambito_legal
   FROM ((((((casos c
     JOIN solicitantes s ON (((c.cedula)::text = (s.cedula)::text)))
     JOIN nucleos n ON ((c.id_nucleo = n.id_nucleo)))
     JOIN ambitos_legales al ON (((c.id_materia = al.id_materia) AND (c.num_categoria = al.num_categoria) AND (c.num_subcategoria = al.num_subcategoria) AND (c.num_ambito_legal = al.num_ambito_legal))))
     JOIN materias m ON ((al.id_materia = m.id_materia)))
     JOIN categorias cat ON (((al.id_materia = cat.id_materia) AND (al.num_categoria = cat.num_categoria))))
     JOIN subcategorias sub ON (((al.id_materia = sub.id_materia) AND (al.num_categoria = sub.num_categoria) AND (al.num_subcategoria = sub.num_subcategoria))));

-- 4. Funciones sin uso
DROP FUNCTION IF EXISTS show_db_tree();
DROP FUNCTION IF EXISTS validate_cliente_solicitante_on_caso();
DROP FUNCTION IF EXISTS validate_solicitante_completo();
DROP FUNCTION IF EXISTS toggle_habilitado_usuario(character varying);

COMMIT;
