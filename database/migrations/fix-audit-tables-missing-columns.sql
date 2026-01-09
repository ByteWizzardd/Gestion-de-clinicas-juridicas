-- Migración: Fix tablas de auditoría de catálogos - Agregar columnas faltantes
-- Descripción: Agrega las columnas de tracking de cambios en llaves primarias compuestas que faltan en algunas tablas de auditoría.

-- auditoria_actualizacion_categorias
ALTER TABLE auditoria_actualizacion_categorias ADD COLUMN IF NOT EXISTS id_materia_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_categorias ADD COLUMN IF NOT EXISTS id_materia_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_categorias ADD COLUMN IF NOT EXISTS num_categoria_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_categorias ADD COLUMN IF NOT EXISTS num_categoria_nuevo INTEGER;

-- auditoria_actualizacion_subcategorias
ALTER TABLE auditoria_actualizacion_subcategorias ADD COLUMN IF NOT EXISTS id_materia_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_subcategorias ADD COLUMN IF NOT EXISTS id_materia_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_subcategorias ADD COLUMN IF NOT EXISTS num_categoria_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_subcategorias ADD COLUMN IF NOT EXISTS num_categoria_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_subcategorias ADD COLUMN IF NOT EXISTS num_subcategoria_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_subcategorias ADD COLUMN IF NOT EXISTS num_subcategoria_nuevo INTEGER;

-- auditoria_actualizacion_ambitos_legales
ALTER TABLE auditoria_actualizacion_ambitos_legales ADD COLUMN IF NOT EXISTS id_materia_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_ambitos_legales ADD COLUMN IF NOT EXISTS id_materia_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_ambitos_legales ADD COLUMN IF NOT EXISTS num_categoria_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_ambitos_legales ADD COLUMN IF NOT EXISTS num_categoria_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_ambitos_legales ADD COLUMN IF NOT EXISTS num_subcategoria_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_ambitos_legales ADD COLUMN IF NOT EXISTS num_subcategoria_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_ambitos_legales ADD COLUMN IF NOT EXISTS num_ambito_legal_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_ambitos_legales ADD COLUMN IF NOT EXISTS num_ambito_legal_nuevo INTEGER;

-- auditoria_actualizacion_caracteristicas
ALTER TABLE auditoria_actualizacion_caracteristicas ADD COLUMN IF NOT EXISTS id_tipo_caracteristica_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_caracteristicas ADD COLUMN IF NOT EXISTS id_tipo_caracteristica_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_caracteristicas ADD COLUMN IF NOT EXISTS num_caracteristica_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_caracteristicas ADD COLUMN IF NOT EXISTS num_caracteristica_nuevo INTEGER;

-- auditoria_actualizacion_parroquias
ALTER TABLE auditoria_actualizacion_parroquias ADD COLUMN IF NOT EXISTS id_estado_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_parroquias ADD COLUMN IF NOT EXISTS id_estado_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_parroquias ADD COLUMN IF NOT EXISTS num_municipio_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_parroquias ADD COLUMN IF NOT EXISTS num_municipio_nuevo INTEGER;

-- auditoria_actualizacion_nucleos
ALTER TABLE auditoria_actualizacion_nucleos ADD COLUMN IF NOT EXISTS id_estado_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_nucleos ADD COLUMN IF NOT EXISTS id_estado_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_nucleos ADD COLUMN IF NOT EXISTS num_municipio_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_nucleos ADD COLUMN IF NOT EXISTS num_municipio_nuevo INTEGER;
ALTER TABLE auditoria_actualizacion_nucleos ADD COLUMN IF NOT EXISTS num_parroquia_anterior INTEGER;
ALTER TABLE auditoria_actualizacion_nucleos ADD COLUMN IF NOT EXISTS num_parroquia_nuevo INTEGER;
