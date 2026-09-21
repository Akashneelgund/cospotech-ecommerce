import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the seeded SQLite database file across potential working directories
const candidates = [
  path.resolve(__dirname, '../../prisma/dev.db'),
  path.resolve(process.cwd(), 'backend/prisma/dev.db'),
  path.resolve(process.cwd(), 'prisma/dev.db'),
  path.resolve(process.cwd(), '../prisma/dev.db')
];

let dbPath = candidates.find((p) => fs.existsSync(p));
if (!dbPath) {
  dbPath = path.resolve(__dirname, '../../prisma/dev.db');
}

const databaseUrl = `file:${dbPath}`;
process.env.DATABASE_URL = databaseUrl;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: ['error']
});
