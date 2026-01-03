const { pool } = require('./lib/db/pool');
const fs = require('fs');
const path = require('path');

async function testQuery() {
    try {
        const sqlPath = path.join(__dirname, 'database', 'queries', 'catalogos', 'get-all-categorias.sql');
        const query = fs.readFileSync(sqlPath, 'utf8');

        console.log('📋 Query:', query);
        console.log('\n🔍 Executing query...\n');

        const result = await pool.query(query);

        console.log('✅ Query successful!');
        console.log('📊 Rows returned:', result.rows.length);
        console.log('📦 Data:', JSON.stringify(result.rows, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testQuery();
