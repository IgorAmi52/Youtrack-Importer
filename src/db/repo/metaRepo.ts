import { sqlite } from '../index'

const getStmt = sqlite.prepare(`SELECT value FROM meta WHERE key = ?`)
const upsertStmt = sqlite.prepare(`
  INSERT INTO meta (key, value) VALUES (?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`)

export const MetaRepo = {
  get(key: string): string | undefined {
    const row = getStmt.get(key) as { value: string } | undefined
    return row?.value
  },
  set(key: string, value: string) {
    upsertStmt.run(key, value)
  }
}
