import type { GitHubIssue } from '../models/GitHubIssue'
import type { YouTrackIssueRequest } from '../models/YouTrackIssue'
import type { SyncIssue } from '../models/SyncIssue'
import { UsersMapRepo } from '../db/repo/usersMapRepo'
import { LinksRepo } from '../db/repo/linksRepo'
import { createContentHash } from '../utils/hash'
import type { Config } from '../config/config'
import { YouTrackApiClient } from '../connectors/youtrackApiClient'

export interface ProcessResult {
  processedCount: number
  newestTimestamp?: string | undefined
  syncIssues: SyncIssue[]
}

export class IssueProcessor {
  constructor(
    private config: Config,
    private apiClient: YouTrackApiClient
  ) {}

  async processNewIssues(issues: GitHubIssue[], lastModified?: string): Promise<ProcessResult> {
    const lastCheck = lastModified ? new Date(lastModified) : new Date(0)
    const syncIssues: SyncIssue[] = [];
    for (const issue of issues) {
      if (new Date(issue.updated_at) <= lastCheck) continue;
      const existingLink = LinksRepo.get(this.config.github.repo, issue.number);
      if (existingLink) {
        const currentContentHash = createContentHash(issue);
        if (existingLink.contentHash === currentContentHash) continue;
      }
      const youtrack = await this.mapGitHubToYouTrack(issue);
      syncIssues.push({ github: issue, youtrack });
    }
    return {
      processedCount: syncIssues.length,
      syncIssues,
      newestTimestamp: syncIssues.length > 0
        ? syncIssues.reduce((newest, s) =>
            new Date(s.github.updated_at) > new Date(newest.github.updated_at) ? s : newest
          ).github.updated_at
        : undefined
    };
  }
  
  private async validateYouTrackUser(login: string): Promise<boolean> {
    const isValid = await this.apiClient.validateUser(login)
    
    if (!isValid) {
      console.warn(`⚠️  YouTrack user '${login}' does not exist`)
    }
    
    return isValid
  }

  private async mapGitHubToYouTrack(githubIssue: GitHubIssue): Promise<YouTrackIssueRequest> {
    const customFields: any[] = [
      {
        $type: "SingleEnumIssueCustomField",
        name: "State",
        value: { name: githubIssue.state === 'open' ? 'Open' : 'Fixed' }
      },
      {
        $type: "SingleEnumIssueCustomField",
        name: "Type",
        value: { name: 'Bug' }
      }
    ]

    // Add assignee if valid
    const assigneeLogin = githubIssue.assignee?.login
    if (assigneeLogin) {
      const youtrackAssignee = UsersMapRepo.get(assigneeLogin)
      if (youtrackAssignee && await this.validateYouTrackUser(youtrackAssignee)) {
        customFields.push({
          $type: "SingleUserIssueCustomField",
          name: "Assignee",
          value: { login: youtrackAssignee }
        })
      }
    }
    
    return {
      summary: `GitHub #${githubIssue.number}: ${githubIssue.title}`,
      description: githubIssue.body || 'No description provided',
      customFields
    }
  }
}