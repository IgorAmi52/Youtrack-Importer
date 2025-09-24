import { YouTrackApiClient } from '../connectors/youtrackApiClient'
import { LinksRepo, type Link } from '../db/repo/linksRepo'
import type { Config } from '../config/config'
import { createContentHash } from '../utils/hash'
import type { YouTrackIssue, YouTrackIssueRequest } from '../models/YouTrackIssue'
import type { GitHubIssue } from '../models/GitHubIssue'

export interface SyncResult {
  action: 'created' | 'updated'
  youtrackIssue: YouTrackIssue
  existingLink?: boolean
}

export class YouTrackService {
  constructor(
    private config: Config,
    private apiClient: YouTrackApiClient
  ) {}

  async syncIssues(syncIssues: { github: GitHubIssue, youtrack: YouTrackIssueRequest }[]): Promise<SyncResult[]> {
    const syncPromises = syncIssues.map(async ({ github, youtrack }) => {
      try {
        return await this.syncIssue(github, youtrack)
      } catch (error) {
        console.error(`❌ Failed to sync GitHub #${github.number}:`, error)
        return null
      }
    })
    const results = await Promise.all(syncPromises)
    return results.filter((result): result is SyncResult => result !== null)
  }

  async syncIssue(githubIssue: GitHubIssue, youtrackData: YouTrackIssueRequest): Promise<SyncResult> {
    const existingLink = LinksRepo.get(this.config.github.repo, githubIssue.number)
    const currentContentHash = createContentHash(githubIssue)
    
    if (existingLink) {
      return await this.updateOrRecreateIssue(githubIssue, youtrackData, existingLink, currentContentHash)
    } else {
      return await this.createNewIssue(githubIssue, youtrackData, currentContentHash)
    }
  }

  private async updateOrRecreateIssue(
    githubIssue: GitHubIssue, 
    youtrackData: YouTrackIssueRequest, 
    existingLink: Link, 
    currentContentHash: string
  ): Promise<SyncResult> {
    try { // Check if the YouTrack issue still exists
      await this.apiClient.getIssue(existingLink.youtrackIssueId)
      
      const updatedIssue = await this.apiClient.updateIssue(existingLink.youtrackIssueId, youtrackData)
      
      LinksRepo.upsert({
        githubRepo: this.config.github.repo,
        githubIssueId: githubIssue.number,
        youtrackIssueId: updatedIssue.id,
        contentHash: currentContentHash,
        lastSeenUpdatedAt: githubIssue.updated_at
      })
      
      return {
        action: 'updated',
        youtrackIssue: updatedIssue,
        existingLink: true
      }
    } catch (error) { // If not found, create a new issue
      console.warn(`⚠️  YouTrack issue ${existingLink.youtrackIssueId} no longer exists, creating new one for GitHub #${githubIssue.number}`)
      return await this.createNewIssue(githubIssue, youtrackData, currentContentHash, false)
    }
  }

  private async createNewIssue(
    githubIssue: GitHubIssue, 
    youtrackData: YouTrackIssueRequest, 
    currentContentHash: string,
    existingLink: boolean = false
  ): Promise<SyncResult> {
    const createdIssue = await this.apiClient.createIssue(youtrackData)
    
    LinksRepo.upsert({
      githubRepo: this.config.github.repo,
      githubIssueId: githubIssue.number,
      youtrackIssueId: createdIssue.id,
      contentHash: currentContentHash,
      lastSeenUpdatedAt: githubIssue.updated_at
    })
    
    return {
      action: 'created',
      youtrackIssue: createdIssue,
      existingLink
    }
  }
}