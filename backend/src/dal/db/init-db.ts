import fs from 'fs/promises';
import path from 'path';
import { pool } from '../../config/db';

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    console.log('Running migrations...');

    for (const file of sqlFiles) {
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf-8');
        console.log(`Executing migration: ${file}`);
        try {
            await pool.query('BEGIN');
            await pool.query(sql);
            await pool.query('COMMIT');
            console.log(`Successfully completed migration: ${file}`);
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(`Error in migration ${file}:`, error);
            throw error; // Re-throw to stop subsequent migrations
        }
    }

    console.log('Migrations completed successfully.');
}

if (require.main === module) {
    runMigrations()
        .then(() => {
            console.log('Database initialization finished.');
            process.exit(0);
        })
        .catch(err => {
            console.error('Error running migrations:', err);
            process.exit(1);
        });
}

export { runMigrations };
