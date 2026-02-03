-- Semestre inicial
INSERT INTO semestres (term, fecha_inicio, fecha_fin, habilitado)
VALUES ('2026-15', '2025-09-23', '2026-01-13', true)
ON CONFLICT (term) DO NOTHING;

-- Usuario Coordinador
-- Hash generado: $2b$10$RnDL1BstOBPmgKiDA5ttSe0bBM3d68ShvxsfqyIyk8FNJMb.TuCRa
INSERT INTO usuarios (
    cedula, nombres, apellidos, correo_electronico, nombre_usuario,
    contrasena, telefono_celular, habilitado_sistema, tipo_usuario
) VALUES (
    'V-12345678',
    'Coordinador',
    'Principal',
    'coordinador@ucab.edu.ve',
    'coord.principal',
    '$2b$10$RnDL1BstOBPmgKiDA5ttSe0bBM3d68ShvxsfqyIyk8FNJMb.TuCRa',
    '04141234567',
    true,
    'Coordinador'
) ON CONFLICT (cedula) DO UPDATE SET 
    contrasena = EXCLUDED.contrasena,
    habilitado_sistema = true;

-- Relación Coordinador
INSERT INTO coordinadores (id_coordinador, term)
VALUES ('V-12345678', '2026-15')
ON CONFLICT (id_coordinador) DO NOTHING;
