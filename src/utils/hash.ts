import crypto from 'crypto'
import type { GitHubIssue } from '../models/GitHubIssue'

export function createContentHash(githubIssue: GitHubIssue): string {
  const contentToHash = {
    title: githubIssue.title,
    body: githubIssue.body || '',
    state: githubIssue.state,
    updated_at: githubIssue.updated_at
  }
  
  const contentString = JSON.stringify(contentToHash, Object.keys(contentToHash).sort())
  return crypto.createHash('sha256').update(contentString).digest('hex').substring(0, 16)
}