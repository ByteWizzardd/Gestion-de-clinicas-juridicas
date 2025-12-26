import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '@/lib/db/pool';

const QUERIES_DIR = join(process.cwd(), 'database', 'queries', 'catalogos');

function loadQuery(filename: string): string {
    return readFileSync(join(QUERIES_DIR, filename), 'utf-8');
}

// Get all catalog counts
export async function getAllCatalogCounts() {
    const query = loadQuery('get-all-counts.sql');
    const result = await pool.query(query);
    return result.rows[0];
}

// Materias
export async function getAllMaterias() {
    const query = loadQuery('get-all-materias.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Categorias
export async function getAllCategorias() {
    const query = loadQuery('get-all-categorias.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Subcategorias
export async function getAllSubcategorias() {
    const query = loadQuery('get-all-subcategorias.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Ambitos Legales
export async function getAllAmbitosLegales() {
    const query = loadQuery('get-all-ambitos-legales.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Tipos de Caracteristicas
export async function getAllTiposCaracteristicas() {
    const query = loadQuery('get-all-tipos-caracteristicas.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Caracteristicas
export async function getAllCaracteristicas() {
    const query = loadQuery('get-all-caracteristicas.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Estados
export async function getAllEstados() {
    const query = loadQuery('get-all-estados.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Municipios
export async function getAllMunicipios() {
    const query = loadQuery('get-all-municipios.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Parroquias
export async function getAllParroquias() {
    const query = loadQuery('get-all-parroquias.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Semestres
export async function getAllSemestres() {
    const query = loadQuery('get-all-semestres.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Nucleos
export async function getAllNucleos() {
    const query = loadQuery('get-all-nucleos.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Condiciones de Trabajo
export async function getAllCondicionesTrabajo() {
    const query = loadQuery('get-all-condiciones-trabajo.sql');
    const result = await pool.query(query);
    return result.rows;
}

// Condiciones de Actividad
export async function getAllCondicionesActividad() {
    const query = loadQuery('get-all-condiciones-actividad.sql');
    const result = await pool.query(query);
    return result.rows;
}
