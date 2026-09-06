#!/bin/bash
set -e

echo "========================================================="
echo "==> [init-db] Iniciando aprovisionamiento de PostgreSQL: ${POSTGRES_DB}"
echo "========================================================="

# 1. Aplicar Esquema Principal (Tablas, Extensiones, Constraints)
if [ -f /database/schemas/schema.sql ]; then
    echo "==> [init-db] Ejecutando schema.sql..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /database/schemas/schema.sql
fi

# 2. Aplicar Funciones PL/pgSQL
if [ -f /database/schemas/functions.sql ]; then
    echo "==> [init-db] Ejecutando functions.sql..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /database/schemas/functions.sql || true
fi

# 3. Aplicar Triggers de Auditoría
if [ -f /database/schemas/triggers.sql ]; then
    echo "==> [init-db] Ejecutando triggers.sql..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /database/schemas/triggers.sql || true
fi

# 4. Cargar Semillas y Datos Iniciales de Prueba
if [ -f /database/seeds/seed-materias-catalogos.sql ]; then
    echo "==> [init-db] Ejecutando seed-materias-catalogos.sql..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /database/seeds/seed-materias-catalogos.sql || true
fi

if [ -f /database/seeds/seed-completo.sql ]; then
if [ -f /database/seeds/seed-materias-catalogos.sql ]; then
    echo "==> [init-db] Ejecutando seed-materias-catalogos.sql..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /database/seeds/seed-materias-catalogos.sql || true
fi

    echo "==> [init-db] Ejecutando seed-completo.sql..."
if [ -f /database/seeds/seed-materias-catalogos.sql ]; then
    echo "==> [init-db] Ejecutando seed-materias-catalogos.sql..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /database/seeds/seed-materias-catalogos.sql || true
fi

    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /database/seeds/seed-completo.sql || true
fi

echo "========================================================="
echo "==> [init-db] Base de datos aprovisionada correctamente."
echo "========================================================="

