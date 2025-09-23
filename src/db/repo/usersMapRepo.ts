import { sqlite } from '../index'

const getStmt = sqlite.prepare(`SELECT youtrack_username FROM users_map WHERE github_login = ?`)
const upsertStmt = sqlite.prepare(`
  INSERT INTO users_map (github_login, youtrack_username) VALUES (?, ?)
  ON CONFLICT(github_login) DO UPDATE SET youtrack_username = excluded.youtrack_username
`)

export const UsersMapRepo = {
  get(githubLogin: string): string | undefined {
    const row = getStmt.get(githubLogin) as { youtrack_username: string } | undefined
    return row?.youtrack_username
  },
  set(githubLogin: string, youtrackUsername: string) {
    upsertStmt.run(githubLogin, youtrackUsername)
  }
}
