-- ==========================================================
-- SEED DE LA POLÍTICA DE RETENCIÓN DE LA AUDITORÍA
-- ==========================================================
-- No son datos de prueba: sin estas cinco filas la pestaña de Mantenimiento
-- del panel de Auditoría no tiene nada que mostrar y `auditoria_purgar()`
-- rechaza cualquier clase. Los plazos son los sugeridos; el Coordinador los
-- edita desde la app (siempre por encima de meses_minimo).

INSERT INTO auditoria_retencion (clase, etiqueta, descripcion, meses_retencion, meses_minimo, orden) VALUES
    ('operativo', 'Actividad operativa',
     'Inicios y cierres de sesión, intentos fallidos, reportes generados y descargas de soportes. Mucho volumen y sin valor probatorio pasado el período.',
     12, 3, 1),
    ('catalogo', 'Cambios de catálogo',
     'Altas, ediciones y bajas de estados, municipios, parroquias, núcleos, materias, categorías, subcategorías, ámbitos legales, características, niveles educativos, condiciones y semestres.',
     24, 6, 2),
    ('negocio', 'Actividad de casos y personas',
     'Casos, citas, acciones, soportes, beneficiarios, solicitantes, equipos y usuarios. Se conserva por su valor probatorio.',
     60, 24, 3),
    ('eliminacion', 'Eliminaciones',
     'Cualquier borrado de un registro del sistema. Es la única constancia de que ese dato existió.',
     120, 60, 4)
ON CONFLICT (clase) DO NOTHING;

-- Los mínimos no son arbitrarios:
--   * 'negocio' no baja de 24 meses porque casos/get-inactive-cases.sql usa los
--     eventos de 'caso' y 'beneficiario' como fechas de actividad para decidir
--     qué casos llevan 2 semestres inactivos; purgar dentro de esa ventana haría
--     aparecer casos activos como inactivos.
--   * 'eliminacion' no baja de 60 meses porque es la única constancia de que un
--     registro existió.
