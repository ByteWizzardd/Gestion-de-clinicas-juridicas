-- Migración: Agregar CHECK constraints con opción NOT VALID para datos existentes
-- Esto permite aplicar las reglas a nuevos registros sin fallar por datos históricos incorrectos



-- ==============================================
-- CITAS
-- ==============================================
ALTER TABLE citas
ADD CONSTRAINT chk_citas_proxima_posterior 
CHECK (fecha_proxima_cita IS NULL OR fecha_proxima_cita > fecha_encuentro) NOT VALID;

-- ==============================================
-- CASOS
-- ==============================================
ALTER TABLE casos
ADD CONSTRAINT chk_casos_solicitud_pasada CHECK (fecha_solicitud <= CURRENT_DATE) NOT VALID,
ADD CONSTRAINT chk_casos_inicio_pasado CHECK (fecha_inicio_caso <= CURRENT_DATE) NOT VALID,
ADD CONSTRAINT chk_casos_inicio_post_solicitud CHECK (fecha_inicio_caso >= fecha_solicitud) NOT VALID,
ADD CONSTRAINT chk_casos_fin_post_inicio CHECK (fecha_fin_caso IS NULL OR fecha_fin_caso >= fecha_inicio_caso) NOT VALID;

-- ==============================================
-- SOLICITANTES
-- ==============================================
ALTER TABLE solicitantes
ADD CONSTRAINT chk_solicitantes_nacimiento_pasado 
CHECK (fecha_nacimiento <= CURRENT_DATE) NOT VALID;

-- ==============================================
-- BENEFICIARIOS
-- ==============================================
ALTER TABLE beneficiarios
ADD CONSTRAINT chk_beneficiarios_nac_pasado 
CHECK (fecha_nac <= CURRENT_DATE) NOT VALID;

-- ==============================================
-- ACCIONES
-- ==============================================
ALTER TABLE acciones
ADD CONSTRAINT chk_acciones_registro_pasado 
CHECK (fecha_registro <= CURRENT_DATE) NOT VALID;

-- ==============================================
-- EJECUTAN
-- ==============================================
ALTER TABLE ejecutan
ADD CONSTRAINT chk_ejecutan_fecha_pasada 
CHECK (fecha_ejecucion <= CURRENT_DATE) NOT VALID;

-- ==============================================
-- CAMBIO ESTATUS
-- ==============================================
ALTER TABLE cambio_estatus
ADD CONSTRAINT chk_cambio_estatus_fecha_pasada 
CHECK (fecha <= CURRENT_DATE) NOT VALID;

-- ==============================================
-- SOPORTES
-- ==============================================
ALTER TABLE soportes
ADD CONSTRAINT chk_soportes_consignacion_pasada 
CHECK (fecha_consignacion <= CURRENT_DATE) NOT VALID;

-- ==============================================
-- ATIENDEN
-- ==============================================
ALTER TABLE atienden
ADD CONSTRAINT chk_atienden_registro_pasado 
CHECK (fecha_registro <= CURRENT_DATE) NOT VALID;
