import { sqlite } from '../index'

export type Link = {
  id?: number
  githubRepo: string
  githubIssueId: number
  youtrackIssueId: string
  contentHash?: string | null
  lastSeenUpdatedAt?: string | null
}

const selByRepoIssue = sqlite.prepare(`
  SELECT id, github_repo as githubRepo, github_issue_id as githubIssueId,
         youtrack_issue_id as youtrackIssueId, content_hash as contentHash,
         last_seen_updated_at as lastSeenUpdatedAt
  FROM links WHERE github_repo = ? AND github_issue_id = ?
`)

const insertStmt = sqlite.prepare(`
  INSERT INTO links (github_repo, github_issue_id, youtrack_issue_id, content_hash, last_seen_updated_at)
  VALUES (?, ?, ?, ?, ?)
`)

const updateStmt = sqlite.prepare(`
  UPDATE links
  SET youtrack_issue_id = ?, content_hash = ?, last_seen_updated_at = ?
  WHERE github_repo = ? AND github_issue_id = ?
`)

export const LinksRepo = {
  get(repo: string, issueNumber: number): Link | undefined {
    return selByRepoIssue.get(repo, issueNumber) as Link | undefined
  },

  upsert(l: Link) {
    const existing = this.get(l.githubRepo, l.githubIssueId)
    if (!existing) {
      insertStmt.run(
        l.githubRepo,
        l.githubIssueId,
        l.youtrackIssueId,
        l.contentHash ?? null,
        l.lastSeenUpdatedAt ?? null
      )
      return 'created'
    } else {
      updateStmt.run(
        l.youtrackIssueId,
        l.contentHash ?? null,
        l.lastSeenUpdatedAt ?? null,
        l.githubRepo,
        l.githubIssueId
      )
      return 'updated'
    }
  }
}
