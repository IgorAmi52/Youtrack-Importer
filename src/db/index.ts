import Database from 'better-sqlite3'
import type BetterSqlite3 from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { getPathFromFile } from '../utils/path'
import { ensureFileDirectoryExists } from '../utils/fs'

const DB_PATH = process.env.DB_FILE_PATH 
  ? path.resolve(process.env.DB_FILE_PATH)
  : path.resolve('data', 'database.sqlite')

ensureFileDirectoryExists(DB_PATH)

export const sqlite: BetterSqlite3.Database = new Database(DB_PATH)     

function applyMigrations() {
  const migrationsDir = path.resolve(process.cwd(), 'migrations')
  if (!fs.existsSync(migrationsDir)) {
    console.warn(`Migrations directory not found at project root: ${migrationsDir}`)
    return
  }
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  for (const file of files) {
    const full = path.join(migrationsDir, file)
    const sql = fs.readFileSync(full, 'utf8')
    sqlite.exec(sql)
  }
}

applyMigrations()
