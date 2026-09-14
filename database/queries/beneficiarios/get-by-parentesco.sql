-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
SELECT 
    INITCAP(TRANSLATE(LOWER(b.parentesco), 'áéíóú', 'aeiou')) AS parentesco,
    COUNT(*) AS cantidad_beneficiarios
FROM beneficiarios b
INNER JOIN casos c ON b.id_caso = c.id_caso
WHERE 
    ($3::TEXT IS NULL OR EXISTS (
        SELECT 1 FROM ocurren_en oe WHERE oe.id_caso = c.id_caso AND oe.term = $3
    ))
    AND (
        ($1::DATE IS NULL AND $2::DATE IS NULL)
        OR caso_con_actividad_en_rango(c.id_caso, $1::DATE, $2::DATE)
    )
GROUP BY TRANSLATE(LOWER(b.parentesco), 'áéíóú', 'aeiou')
ORDER BY cantidad_beneficiarios DESC, parentesco;
