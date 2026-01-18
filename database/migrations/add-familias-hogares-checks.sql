-- Migración: Agregar CHECK constraints a familias_y_hogares
-- Estas validaciones replican las del formulario ApplicantFormModal

-- 1. Cant niños estudiando no puede ser mayor que cant niños
ALTER TABLE familias_y_hogares
ADD CONSTRAINT chk_ninos_estudiando_menor_igual_ninos
CHECK (cant_ninos_estudiando <= cant_ninos);

-- 2. Debe haber al menos un adulto (cant_ninos < cant_personas)
-- Es decir, la cantidad de niños debe ser estrictamente menor que la cantidad de personas
ALTER TABLE familias_y_hogares
ADD CONSTRAINT chk_al_menos_un_adulto
CHECK (cant_ninos < cant_personas);

-- 3. Cant trabajadores no puede ser mayor que cant personas
ALTER TABLE familias_y_hogares
ADD CONSTRAINT chk_trabajadores_menor_igual_personas
CHECK (cant_trabajadores <= cant_personas);

-- 4. Actualizar cant_personas para que sea >= 1 (debe haber al menos 1 persona)
-- Primero eliminamos el CHECK existente y lo recreamos
ALTER TABLE familias_y_hogares
DROP CONSTRAINT IF EXISTS familias_y_hogares_cant_personas_check;

ALTER TABLE familias_y_hogares
ADD CONSTRAINT chk_cant_personas_minimo
CHECK (cant_personas >= 1);
