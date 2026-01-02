'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllAmbitosLegales } from '@/lib/db/queries/catalogos.queries';

export async function getAmbitosLegales() {
    try {
        const ambitos = await getAllAmbitosLegales();
        return { success: true, data: ambitos };
    } catch (error) {
        console.error('Error getting ambitos legales:', error);
        return { success: false, error: 'Error al obtener ámbitos legales' };
    }
}

export async function createAmbitoLegal(data: { id_materia: string; num_categoria: string; num_subcategoria: string; nombre_ambito_legal: string }) {
    try {
        const id_materia = parseInt(data.id_materia);
        const num_categoria = parseInt(data.num_categoria);
        const num_subcategoria = parseInt(data.num_subcategoria);

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

export async function updateAmbitoLegal(id_materia: number, num_categoria: number, num_subcategoria: number, num_ambito_legal: number, data: { nombre_ambito_legal: string }) {
    try {
        const result = await pool.query(
            'UPDATE ambitos_legales SET nombre_ambito_legal = $5 WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
            [id_materia, num_categoria, num_subcategoria, num_ambito_legal, data.nombre_ambito_legal]
        );
        if (result.rows.length === 0) return { success: false, error: 'Ámbito legal no encontrado' };
        revalidatePath('/dashboard/catalogs/ambitos-legales');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar ámbito legal' };
    }
}

export async function toggleAmbitoLegalHabilitado(id_materia: number, num_categoria: number, num_subcategoria: number, num_ambito_legal: number) {
    try {
        const result = await pool.query(
            'UPDATE ambitos_legales SET habilitado = NOT habilitado WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
            [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
        );
        if (result.rows.length === 0) return { success: false, error: 'Ámbito legal no encontrado' };
        revalidatePath('/dashboard/catalogs/ambitos-legales');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteAmbitoLegal(id_materia: number, num_categoria: number, num_subcategoria: number, num_ambito_legal: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM casos WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito = $4
            ) AS has_associations`,
            [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene casos asociados.'
            };
        }
        const result = await pool.query(
            'DELETE FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
            [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
        );
        if (result.rows.length === 0) return { success: false, error: 'Ámbito legal no encontrado' };
        revalidatePath('/dashboard/catalogs/ambitos-legales');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar ámbito legal' };
    }
}
