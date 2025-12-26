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
        return { success: false, error: 'Error al obtener categorías' };
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
