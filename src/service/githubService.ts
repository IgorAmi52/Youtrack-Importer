import { GitHubApiClient } from '../connectors/githubApiClient'
import type { GitHubIssue } from '../models/GitHubIssue'

export class GitHubService {
  private apiClient = new GitHubApiClient()
  
  async *getIssuesPageByPage(since?: string): AsyncGenerator<GitHubIssue[], void, unknown> {
    let page = 1
    let hasMorePages = true
    
    while (hasMorePages) {
      const pageIssues = await this.apiClient.fetchIssues(since, page)
      
      if (pageIssues.length === 0) {
        hasMorePages = false
        break
      }
      
      yield pageIssues
      
      if (pageIssues.length < 30) {
        hasMorePages = false
      } else {
        page++
      }
    }
  }
}