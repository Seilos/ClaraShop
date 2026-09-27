import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, '..');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const dbPath = path.join(docsDir, 'dev_memory.sqlite');
const client = createClient({ url: `file:${dbPath}` });

async function init() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS registered_functions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      module_path TEXT NOT NULL,
      params TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS architecture_decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      context TEXT NOT NULL,
      decision TEXT NOT NULL,
      consequences TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gotchas_and_bugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue TEXT NOT NULL,
      root_cause TEXT NOT NULL,
      solution TEXT NOT NULL,
      affected_files TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Dev Memory SQLite (`docs/dev_memory.sqlite`) inicializado correctamente con @libsql/client.');
}

init().catch(console.error);
