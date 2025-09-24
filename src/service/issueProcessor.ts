import type { GitHubIssue } from '../models/GitHubIssue'
import type { YouTrackIssueRequest } from '../models/YouTrackIssue'
import { UsersMapRepo } from '../db/repo/usersMapRepo'
import { LinksRepo } from '../db/repo/linksRepo'
import { createContentHash } from '../utils/hash'
import { config } from '../config/config'
import { YouTrackApiClient } from '../connectors/youtrackApiClient'

export interface ProcessResult {
  processedCount: number
  newestTimestamp?: string | undefined
  youtrackIssues: YouTrackIssueRequest[]
}

export class IssueProcessor {
  private apiClient = new YouTrackApiClient()

   async processNewIssues(issues: GitHubIssue[], lastModified?: string): Promise<ProcessResult> {
    const lastCheck = lastModified ? new Date(lastModified) : new Date(0)
    
    const newIssues = issues
      .filter(issue => new Date(issue.updated_at) > lastCheck)
      .filter(issue => {
        const existingLink = LinksRepo.get(config.github.repo, issue.number)
        if (!existingLink) return true
        
        const currentContentHash = createContentHash(issue)
        return existingLink.contentHash !== currentContentHash
      })
    
    const youtrackIssues = await Promise.all(
      newIssues.map(issue => this.mapGitHubToYouTrack(issue))
    )
    
    return {
      processedCount: newIssues.length,
      youtrackIssues,
      newestTimestamp: newIssues.length > 0 
        ? newIssues.reduce((newest, issue) => 
            new Date(issue.updated_at) > new Date(newest.updated_at) ? issue : newest
          ).updated_at
        : undefined
    }
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