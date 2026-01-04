import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const baseDir = process.cwd();
const triggersFile = join(baseDir, 'database', 'migrations', 'add-triggers-auditoria-catalogos.sql');

let content = readFileSync(triggersFile, 'utf-8');

// Patrón para funciones de eliminación
const elimPattern = /(CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_\w+\(\)[\s\S]*?BEGIN\s+)(v_usuario := current_setting\('app\.usuario_elimina_catalogo', true\);\s+v_motivo := current_setting\('app\.motivo_eliminacion_catalogo', true\);)/g;

content = content.replace(elimPattern, (match, funcStart, currentSetting) => {
    return funcStart + `BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    `;
});

// Patrón para funciones de actualización
const actPattern = /(CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_\w+\(\)[\s\S]*?BEGIN\s+)(v_usuario := current_setting\('app\.usuario_actualiza_catalogo', true\);)/g;

content = content.replace(actPattern, (match, funcStart, currentSetting) => {
    return funcStart + `BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    `;
});

// Envolver todos los INSERT en bloques EXCEPTION
const insertPattern = /(\s+INSERT INTO auditoria_(eliminacion|actualizacion)_\w+ \([\s\S]*?\) VALUES \([\s\S]*?\);)/g;

content = content.replace(insertPattern, (match) => {
    return `
        BEGIN
            ${match.trim()}
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;`;
});

writeFileSync(triggersFile, content);
console.log('✅ Triggers actualizados para ser más robustos');
