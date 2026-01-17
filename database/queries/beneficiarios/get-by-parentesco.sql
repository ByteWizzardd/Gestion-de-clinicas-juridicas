SELECT 
    INITCAP(TRANSLATE(LOWER(b.parentesco), 'áéíóú', 'aeiou')) AS parentesco,
    COUNT(*) AS cantidad_beneficiarios
FROM beneficiarios b
INNER JOIN casos c ON b.id_caso = c.id_caso
WHERE 
    ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
GROUP BY TRANSLATE(LOWER(b.parentesco), 'áéíóú', 'aeiou')
ORDER BY cantidad_beneficiarios DESC, parentesco;

