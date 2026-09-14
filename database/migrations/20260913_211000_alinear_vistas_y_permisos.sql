-- =============================================================================
-- Alinear vistas y permisos de Neon con schema.sql (segunda parte)
-- =============================================================================
-- Las vistas de schema.sql usan c.* / b.* y en Neon se crearon antes de que
-- existieran las columnas de trazabilidad (id_usuario_registro, fecha_registro,
-- id_usuario_actualizo), así que en Neon no las exponían. Se recrean con la
-- definición de schema.sql. No tienen permisos propios ni otras vistas que
-- dependan de ellas, y el código solo lee columnas concretas.
--
-- schema.sql otorga ALL PRIVILEGES sobre ocurren_en a rol_coordinador; en Neon
-- faltaba TRIGGER.
-- =============================================================================

BEGIN;

DROP VIEW IF EXISTS view_casos_completo;
CREATE VIEW view_casos_completo AS
SELECT id_caso,
    fecha_solicitud,
    fecha_inicio_caso,
    fecha_fin_caso,
    tramite,
    observaciones,
    id_nucleo,
    cedula,
    id_materia,
    num_categoria,
    num_subcategoria,
    num_ambito_legal,
    id_usuario_registro,
    fecha_registro,
    COALESCE(( SELECT ce.nuevo_estatus
           FROM cambio_estatus ce
          WHERE (ce.id_caso = c.id_caso)
          ORDER BY ce.fecha DESC, ce.num_cambio DESC
         LIMIT 1), 'En proceso'::character varying) AS estatus,
    COALESCE(( SELECT count(*) AS count
           FROM beneficiarios b
          WHERE (b.id_caso = c.id_caso)), (0)::bigint) AS cant_beneficiarios
   FROM casos c;
DROP VIEW IF EXISTS view_casos_detalle;
CREATE VIEW view_casos_detalle AS
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
    c.id_usuario_registro,
    c.fecha_registro,
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
DROP VIEW IF EXISTS view_beneficiarios_completo;
CREATE VIEW view_beneficiarios_completo AS
SELECT num_beneficiario,
    id_caso,
    cedula,
    nombres,
    apellidos,
    fecha_nac,
    sexo,
    tipo_beneficiario,
    parentesco,
    id_usuario_registro,
    fecha_registro,
    id_usuario_actualizo,
    (EXTRACT(year FROM age((CURRENT_DATE)::timestamp with time zone, (fecha_nac)::timestamp with time zone)))::integer AS edad
   FROM beneficiarios b;

GRANT TRIGGER ON ocurren_en TO rol_coordinador;

COMMIT;
