import type { Config } from '../config/config'
import type { GitHubIssue } from '../models/GitHubIssue'

export class GitHubApiClient {
  constructor(private config: Config) {}

  async fetchIssues(since?: string, page: number = 1): Promise<GitHubIssue[]> {
    const url = new URL(`https://api.github.com/repos/${this.config.github.repo}/issues`)
    
    const params = new URLSearchParams({
      state: 'all',
      sort: 'updated', 
      direction: 'desc',
      per_page: '30',
      page: page.toString()
    })
    
    if (since) {
      params.append('since', since)
    }
    
    url.search = params.toString()

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'YouTrack-Importer'
    }
    
    if (this.config.github.token) {
      headers['Authorization'] = `Bearer ${this.config.github.token}`
    }

    try {
      const response = await fetch(url.toString(), { headers })
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }
      
      return await response.json() as GitHubIssue[]
    } catch (error) {
      console.error('Error fetching GitHub issues:', error)
      return []
    }
  }
}