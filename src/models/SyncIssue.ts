import type { GitHubIssue } from './GitHubIssue'
import type { YouTrackIssueRequest } from './YouTrackIssue'

export interface SyncIssue {
  github: GitHubIssue
  youtrack: YouTrackIssueRequest
}
