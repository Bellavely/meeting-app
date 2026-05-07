import fs from 'fs/promises';
import path from 'path';
import pool from '../config/db';

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    console.log('Running migrations...');

    for (const file of sqlFiles) {
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf-8');
        console.log(`Executing migration: ${file}`);
        await pool.query(sql);
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
