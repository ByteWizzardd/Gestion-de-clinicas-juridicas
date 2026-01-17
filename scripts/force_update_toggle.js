const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Cargar variables de entorno manualmente
function loadEnv(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
            if (!line || line.startsWith('#')) return;
            const match = line.match(/^([^=:#]+?)[=:](.*)/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
                if (!process.env[key]) process.env[key] = value;
            }
        });
    }
}

loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no definida.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function run() {
    try {
        const sql = `
CREATE OR REPLACE FUNCTION toggle_habilitado_usuario(
    p_cedula_usuario VARCHAR,
    p_cedula_actor VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_habilitado_anterior BOOLEAN;
    v_habilitado_nuevo BOOLEAN;
    v_nombres_anterior VARCHAR;
    v_apellidos_anterior VARCHAR;
    v_correo_electronico_anterior VARCHAR;
    v_nombre_usuario_anterior VARCHAR;
    v_telefono_celular_anterior VARCHAR;
    v_tipo_usuario_anterior VARCHAR;
    v_tipo_estudiante_anterior VARCHAR;
    v_tipo_profesor_anterior VARCHAR;
BEGIN
    -- Obtener valores anteriores
    SELECT nombres, apellidos, correo_electronico, nombre_usuario, telefono_celular, habilitado_sistema, tipo_usuario
    INTO v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior, v_habilitado_anterior, v_tipo_usuario_anterior
    FROM usuarios WHERE cedula = p_cedula_usuario;

    -- Obtener tipo_estudiante anterior si aplica
    IF v_tipo_usuario_anterior = 'Estudiante' THEN
        SELECT tipo_estudiante INTO v_tipo_estudiante_anterior FROM estudiantes WHERE cedula_estudiante = p_cedula_usuario AND habilitado = TRUE;
    END IF;
    
    -- Obtener tipo_profesor anterior si aplica
    IF v_tipo_usuario_anterior = 'Profesor' THEN
        SELECT tipo_profesor INTO v_tipo_profesor_anterior FROM profesores WHERE cedula_profesor = p_cedula_usuario AND habilitado = TRUE;
    END IF;

    -- Actualizar habilitado_sistema
    UPDATE usuarios
    SET habilitado_sistema = NOT habilitado_sistema
    WHERE cedula = p_cedula_usuario;

    -- Obtener el nuevo valor
    SELECT habilitado_sistema INTO v_habilitado_nuevo FROM usuarios WHERE cedula = p_cedula_usuario;

    -- REGISTRAR CUALQUIER CAMBIO DE ESTADO EN AUDITORIA DE ACTUALIZACIÓN
    IF v_habilitado_nuevo != v_habilitado_anterior AND p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
        INSERT INTO auditoria_actualizacion_usuarios (
            ci_usuario,
            nombres_anterior, apellidos_anterior, correo_electronico_anterior, nombre_usuario_anterior, telefono_celular_anterior,
            habilitado_sistema_anterior, tipo_usuario_anterior, tipo_estudiante_anterior, tipo_profesor_anterior,
            nombres_nuevo, apellidos_nuevo, correo_electronico_nuevo, nombre_usuario_nuevo, telefono_celular_nuevo,
            habilitado_sistema_nuevo, tipo_usuario_nuevo, tipo_estudiante_nuevo, tipo_profesor_nuevo,
            id_usuario_actualizo, fecha_actualizacion
        ) VALUES (
            p_cedula_usuario,
            v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior,
            v_habilitado_anterior, v_tipo_usuario_anterior, v_tipo_estudiante_anterior, v_tipo_profesor_anterior,
            v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior,
            v_habilitado_nuevo, v_tipo_usuario_anterior, v_tipo_estudiante_anterior, v_tipo_profesor_anterior,
            p_cedula_actor, (NOW() AT TIME ZONE 'America/Caracas')
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
    `;

        console.log('Actualizando funcion toggle_habilitado_usuario...');
        await pool.query(sql);
        console.log('FUNCION ACTUALIZADA CORRECTAMENTE.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
