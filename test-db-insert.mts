// Test script to verify database inserts
// Run with: node --loader ts-node/esm test-db-insert.mts

import { pool } from './lib/db/pool.js';

async function testInsert() {
    try {
        console.log('Testing database connection...');

        // Test connection
        const connTest = await pool.query('SELECT NOW()');
        console.log('✅ Database connected:', connTest.rows[0].now);

        // Check current materias
        const beforeResult = await pool.query('SELECT * FROM materias ORDER BY id_materia DESC LIMIT 3');
        console.log('\n📋 Current materias (last 3):');
        console.table(beforeResult.rows);

        // Try to insert a test materia
        const testName = `Test Materia ${Date.now()}`;
        console.log(`\n➕ Inserting test materia: "${testName}"`);

        const insertResult = await pool.query(
            'INSERT INTO materias (nombre_materia) VALUES ($1) RETURNING *',
            [testName]
        );

        console.log('✅ Insert successful!');
        console.table(insertResult.rows);

        // Verify it was inserted
        const afterResult = await pool.query('SELECT * FROM materias ORDER BY id_materia DESC LIMIT 3');
        console.log('\n📋 Materias after insert (last 3):');
        console.table(afterResult.rows);

        // Clean up - delete the test materia
        await pool.query('DELETE FROM materias WHERE nombre_materia = $1', [testName]);
        console.log('\n🧹 Test materia deleted');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

testInsert();
