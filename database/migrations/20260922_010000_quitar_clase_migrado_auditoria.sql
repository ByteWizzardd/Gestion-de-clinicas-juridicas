-- =========================================================
-- Quitar la clase de retención "Registros migrados"
-- =========================================================
-- La clase salió de un detalle nuestro, no del sistema: marcaba los eventos
-- que arrastramos del esquema de auditoría anterior (metadata->'migrado_de').
-- Al Coordinador esa distinción no le dice nada — él nunca va a migrar datos —
-- y le daba una fila más que configurar en la pestaña de Mantenimiento.
--
-- Al quitarla, esos eventos pasan a clasificarse por lo que realmente son
-- (un cambio de usuario, una inscripción, un movimiento de catálogo…), que es
-- además lo correcto: venir de un esquema viejo no hace a un registro menos
-- importante. En la base de desarrollo son 598 eventos y todos caen en
-- 'negocio'; se comprobó que ningún evento no migrado cambia de clase.
--
-- De paso se simplifica `auditoria_clase`: la rama especial de 'caso' y
-- 'beneficiario' solo existía para que no cayeran en 'migrado'. Sin esa clase
-- llegan igual a 'eliminacion' o a 'negocio' por las reglas siguientes.

-- 1. La función, sin la rama de migrados ----------------------------------
CREATE OR REPLACE FUNCTION public.auditoria_clase(
    p_entidad   TEXT,
    p_operacion TEXT,
    p_metadata  JSONB
) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $function$
    SELECT CASE
        -- El rastro de la propia depuración (las purgas hechas y los cambios
        -- de política que las permitieron) nunca se purga a sí mismo.
        WHEN p_entidad IN ('auditoria', 'retencion_auditoria') THEN NULL

        WHEN p_entidad IN ('sesion', 'reporte')
          OR (p_entidad = 'soporte' AND p_operacion = 'descarga_soporte') THEN 'operativo'

        -- Los catálogos van ANTES que las eliminaciones para que un
        -- "movimiento" de catálogo (DELETE de la clave vieja + INSERT de la
        -- nueva, que filtro-eventos.sql muestra como UNA actualización) caiga
        -- entero en la misma clase y se purgue junto o no se purgue.
        WHEN p_entidad IN (
            'estado', 'municipio', 'parroquia', 'nucleo', 'materia', 'categoria',
            'subcategoria', 'ambito_legal', 'caracteristica', 'tipo_caracteristica',
            'nivel_educativo', 'condicion_trabajo', 'condicion_actividad', 'semestre'
        ) THEN 'catalogo'

        WHEN p_operacion = 'eliminacion' THEN 'eliminacion'

        ELSE 'negocio'
    END;
$function$;

-- 2. Fuera la fila de la política -----------------------------------------
-- El trigger trg_audit_auditoria_retencion deja constancia del cambio.
DELETE FROM auditoria_retencion WHERE clase = 'migrado';

-- Recordatorio de por qué 'negocio' no baja de 24 meses: ahí caen ahora
-- también los eventos migrados, y casos/get-inactive-cases.sql usa los de
-- 'caso' y 'beneficiario' como fechas de actividad para decidir qué casos
-- llevan 2 semestres inactivos.
