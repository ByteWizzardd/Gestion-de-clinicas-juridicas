import { cambiosEstatusQueries } from './lib/db/queries/cambios-estatus.queries.ts';

async function run() {
    try {
        const res = await cambiosEstatusQueries.create(7, 'Archivado', 'V-77777777', 'Test Timestamp');
        console.log("RESULT", res);
    } catch (err) {
        console.error('Error executing script:', err);
    }
}

run();
