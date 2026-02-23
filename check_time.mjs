import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        const res = await client.query(`
      SELECT num_cambio, id_caso, nuevo_estatus, fecha 
      FROM cambio_estatus 
      ORDER BY fecha DESC, num_cambio DESC 
      LIMIT 5;
    `);
        console.log(res.rows);
    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
    }
}

run();
