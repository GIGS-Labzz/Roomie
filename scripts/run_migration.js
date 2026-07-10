import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://roomie:localdevpassword@localhost:5433/roomie';

console.log('Connecting to database:', dbUrl);

const client = new pg.Client({
  connectionString: dbUrl,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected successfully. Reading migration file...');

    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '0032_add_roomie_id_to_agreements.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration 0032...');
    await client.query(sql);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
