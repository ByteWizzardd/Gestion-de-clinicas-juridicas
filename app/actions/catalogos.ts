'use server';

import {
    getAllCatalogCounts,
    getAllMaterias,
    getAllCategorias,
    getAllSubcategorias,
    getAllAmbitosLegales,
    getAllTiposCaracteristicas,
    getAllCaracteristicas,
    getAllEstados,
    getAllMunicipios,
    getAllParroquias,
    getAllSemestres,
    getAllNucleos,
    getAllCondicionesTrabajo,
    getAllCondicionesActividad
} from '@/lib/db/queries/catalogos.queries';

/**
 * Get counts for all catalog types
 */
export async function getCatalogCounts() {
    try {
        const counts = await getAllCatalogCounts();
        return { success: true, data: counts };
    } catch (error) {
        console.error('Error getting catalog counts:', error);
        return { success: false, error: 'Error al obtener conteos de catálogos' };
    }
}

/**
 * Get all materias
 */
export async function getMaterias() {
    try {
        const materias = await getAllMaterias();
        return { success: true, data: materias };
    } catch (error) {
        console.error('Error getting materias:', error);
        return { success: false, error: 'Error al obtener materias' };
    }
}

/**
 * Get all categorias
 */
export async function getCategorias() {
    try {
        const categorias = await getAllCategorias();
        return { success: true, data: categorias };
    } catch (error) {
        console.error('Error getting categorias:', error);
        return { success: false, error: `Error al obtener categorías: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Get all subcategorias
 */
export async function getSubcategorias() {
    try {
        const subcategorias = await getAllSubcategorias();
        return { success: true, data: subcategorias };
    } catch (error) {
        console.error('Error getting subcategorias:', error);
        return { success: false, error: 'Error al obtener subcategorías' };
    }
}

/**
 * Get all ambitos legales
 */
export async function getAmbitosLegales() {
    try {
        const ambitos = await getAllAmbitosLegales();
        return { success: true, data: ambitos };
    } catch (error) {
        console.error('Error getting ambitos legales:', error);
        return { success: false, error: 'Error al obtener ámbitos legales' };
    }
}

/**
 * Get all tipos de caracteristicas
 */
export async function getTiposCaracteristicas() {
    try {
        const tipos = await getAllTiposCaracteristicas();
        return { success: true, data: tipos };
    } catch (error) {
        console.error('Error getting tipos de caracteristicas:', error);
        return { success: false, error: 'Error al obtener tipos de características' };
    }
}

/**
 * Get all caracteristicas
 */
export async function getCaracteristicas() {
    try {
        const caracteristicas = await getAllCaracteristicas();
        return { success: true, data: caracteristicas };
    } catch (error) {
        console.error('Error getting caracteristicas:', error);
        return { success: false, error: 'Error al obtener características' };
    }
}

/**
 * Get all estados
 */
export async function getEstados() {
    try {
        const estados = await getAllEstados();
        return { success: true, data: estados };
    } catch (error) {
        console.error('Error getting estados:', error);
        return { success: false, error: 'Error al obtener estados' };
    }
}

/**
 * Get all municipios
 */
export async function getMunicipios() {
    try {
        const municipios = await getAllMunicipios();
        return { success: true, data: municipios };
    } catch (error) {
        console.error('Error getting municipios:', error);
        return { success: false, error: 'Error al obtener municipios' };
    }
}

/**
 * Get all parroquias
 */
export async function getParroquias() {
    try {
        const parroquias = await getAllParroquias();
        return { success: true, data: parroquias };
    } catch (error) {
        console.error('Error getting parroquias:', error);
        return { success: false, error: 'Error al obtener parroquias' };
    }
}

/**
 * Get all semestres
 */
export async function getSemestres() {
    try {
        const semestres = await getAllSemestres();
        return { success: true, data: semestres };
    } catch (error) {
        console.error('Error getting semestres:', error);
        return { success: false, error: 'Error al obtener semestres' };
    }
}

/**
 * Get all nucleos
 */
export async function getNucleos() {
    try {
        const nucleos = await getAllNucleos();
        return { success: true, data: nucleos };
    } catch (error) {
        console.error('Error getting nucleos:', error);
        return { success: false, error: 'Error al obtener núcleos' };
    }
}

/**
 * Get all condiciones de trabajo
 */
export async function getCondicionesTrabajo() {
    try {
        const condiciones = await getAllCondicionesTrabajo();
        return { success: true, data: condiciones };
    } catch (error) {
        console.error('Error getting condiciones de trabajo:', error);
        return { success: false, error: 'Error al obtener condiciones de trabajo' };
    }
}

/**
 * Get all condiciones de actividad
 */
export async function getCondicionesActividad() {
    try {
        const condiciones = await getAllCondicionesActividad();
        return { success: true, data: condiciones };
    } catch (error) {
        console.error('Error getting condiciones de actividad:', error);
        return { success: false, error: 'Error al obtener condiciones de actividad' };
    }
}

// ============================================
// CREATE ACTIONS
// ============================================

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';

/**
 * Create a new materia
 */
export async function createMateria(data: { nombre_materia: string }) {
    try {
        console.log('🔵 createMateria called with:', data);
        const result = await pool.query(
            'INSERT INTO materias (nombre_materia) VALUES ($1) RETURNING *',
            [data.nombre_materia]
        );
        console.log('✅ Materia created successfully:', result.rows[0]);

        // Revalidate the path to clear Next.js cache
        revalidatePath('/dashboard/catalogs/materias');

        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('❌ Error creating materia:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al crear materia: ${errorMessage}` };
    }
}

/**
 * Create a new estado
 */
export async function createEstado(data: { nombre_estado: string }) {
    try {
        console.log('🔵 createEstado called with:', data);
        const result = await pool.query(
            'INSERT INTO estados (nombre_estado) VALUES ($1) RETURNING *',
            [data.nombre_estado]
        );
        console.log('✅ Estado created successfully:', result.rows[0]);
        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('❌ Error creating estado:', error);
        return { success: false, error: 'Error al crear estado' };
    }
}

/**
 * Create a new categoria
 */
export async function createCategoria(data: { id_materia: string; nombre_categoria: string }) {
    try {
        // Get the next num_categoria for this materia
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_categoria), 0) + 1 as next_num FROM categorias WHERE id_materia = $1',
            [parseInt(data.id_materia)]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO categorias (id_materia, num_categoria, nombre_categoria) VALUES ($1, $2, $3) RETURNING *',
            [parseInt(data.id_materia), nextNum, data.nombre_categoria]
        );
        revalidatePath('/dashboard/catalogs/categorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating categoria:', error);
        return { success: false, error: 'Error al crear categoría' };
    }
}

/**
 * Create a new municipio
 */
export async function createMunicipio(data: { id_estado: string; nombre_municipio: string }) {
    try {
        // Get the next num_municipio for this estado
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_municipio), 0) + 1 as next_num FROM municipios WHERE id_estado = $1',
            [parseInt(data.id_estado)]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES ($1, $2, $3) RETURNING *',
            [parseInt(data.id_estado), nextNum, data.nombre_municipio]
        );
        revalidatePath('/dashboard/catalogs/municipios');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating municipio:', error);
        return { success: false, error: 'Error al crear municipio' };
    }
}

/**
 * Create a new condicion de trabajo
 */
export async function createCondicionTrabajo(data: { nombre_trabajo: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO condicion_trabajo (nombre_trabajo) VALUES ($1) RETURNING *',
            [data.nombre_trabajo]
        );
        revalidatePath('/dashboard/catalogs/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating condicion trabajo:', error);
        return { success: false, error: 'Error al crear condición de trabajo' };
    }
}

/**
 * Create a new condicion de actividad
 */
export async function createCondicionActividad(data: { nombre_actividad: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO condicion_actividad (nombre_actividad) VALUES ($1) RETURNING *',
            [data.nombre_actividad]
        );
        revalidatePath('/dashboard/catalogs/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating condicion actividad:', error);
        return { success: false, error: 'Error al crear condición de actividad' };
    }
}

/**
 * Create a new tipo caracteristica
 */
export async function createTipoCaracteristica(data: { nombre_tipo_caracteristica: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO tipo_caracteristicas (nombre_tipo_caracteristica) VALUES ($1) RETURNING *',
            [data.nombre_tipo_caracteristica]
        );
        revalidatePath('/dashboard/catalogs/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating tipo caracteristica:', error);
        return { success: false, error: 'Error al crear tipo de característica' };
    }
}

/**
 * Create a new semestre
 */
export async function createSemestre(data: { term: string; fecha_inicio: string; fecha_fin: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO semestres (term, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *',
            [data.term, data.fecha_inicio, data.fecha_fin]
        );
        revalidatePath('/dashboard/catalogs/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating semestre:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al crear semestre: ${errorMessage}` };
    }
}

/**
 * Create a new nucleo
 */
export async function createNucleo(data: { id_parroquia: string; nombre_nucleo: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO nucleos (id_parroquia, nombre_nucleo) VALUES ($1, $2) RETURNING *',
            [parseInt(data.id_parroquia), data.nombre_nucleo]
        );
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating nucleo:', error);
        return { success: false, error: 'Error al crear núcleo' };
    }
}

/**
 * Create a new subcategoria
 */
export async function createSubcategoria(data: { id_materia: string; num_categoria: string; nombre_subcategoria: string }) {
    try {
        const id_materia = parseInt(data.id_materia);
        const num_categoria = parseInt(data.num_categoria);

        // Get next num_subcategoria
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_subcategoria), 0) + 1 as next_num FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2',
            [id_materia, num_categoria]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO subcategorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_materia, num_categoria, nextNum, data.nombre_subcategoria]
        );
        revalidatePath('/dashboard/catalogs/subcategorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating subcategoria:', error);
        return { success: false, error: 'Error al crear subcategoría' };
    }
}

/**
 * Create a new ambito legal
 */
export async function createAmbitoLegal(data: { id_materia: string; num_categoria: string; num_subcategoria: string; nombre_ambito_legal: string }) {
    try {
        const id_materia = parseInt(data.id_materia);
        const num_categoria = parseInt(data.num_categoria);
        const num_subcategoria = parseInt(data.num_subcategoria);

        // Get next num_ambito_legal
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_ambito_legal), 0) + 1 as next_num FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3',
            [id_materia, num_categoria, num_subcategoria]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO ambitos_legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id_materia, num_categoria, num_subcategoria, nextNum, data.nombre_ambito_legal]
        );
        revalidatePath('/dashboard/catalogs/ambitos-legales');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating ambito legal:', error);
        return { success: false, error: 'Error al crear ámbito legal' };
    }
}

/**
 * Create a new parroquia
 */
export async function createParroquia(data: { id_municipio: string; nombre_parroquia: string }) {
    try {
        // Get id_estado and num_municipio from municipio
        const munResult = await pool.query(
            'SELECT id_estado, num_municipio FROM municipios WHERE id_municipio = $1',
            [parseInt(data.id_municipio)]
        );

        if (munResult.rows.length === 0) {
            return { success: false, error: 'Municipio no encontrado' };
        }

        const { id_estado, num_municipio } = munResult.rows[0];

        // Get next num_parroquia
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_parroquia), 0) + 1 as next_num FROM parroquias WHERE id_estado = $1 AND num_municipio = $2',
            [id_estado, num_municipio]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_estado, num_municipio, nextNum, data.nombre_parroquia]
        );
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating parroquia:', error);
        return { success: false, error: 'Error al crear parroquia' };
    }
}

/**
 * Create a new caracteristica
 */
export async function createCaracteristica(data: { id_tipo_caracteristica: string; descripcion: string }) {
    try {
        // Get next num_caracteristica for this tipo
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_caracteristica), 0) + 1 as next_num FROM caracteristicas WHERE id_tipo_caracteristica = $1',
            [parseInt(data.id_tipo_caracteristica)]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion, habilitado) VALUES ($1, $2, $3, true) RETURNING *',
            [parseInt(data.id_tipo_caracteristica), nextNum, data.descripcion]
        );
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating caracteristica:', error);
        return { success: false, error: 'Error al crear característica' };
    }
}
