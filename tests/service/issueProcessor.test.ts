import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IssueProcessor } from '../../src/service/issueProcessor'
import type { Config } from '../../src/config/config'
import type { GitHubIssue } from '../../src/models/GitHubIssue'
import { YouTrackApiClient } from '../../src/connectors/youtrackApiClient'

const mockConfig: Config = {
  port: 3000,
  host: 'localhost',
  nodeEnv: 'test',
  logLevel: 'info',
  pollingIntervalMs: 10000,
  github: { repo: 'owner/repo', token: 'token' },
  youtrack: { baseUrl: 'https://yt', token: 'yt-token', projectId: 'PRJ' },
  isDevelopment: () => false,
  isProduction: () => false,
  isTest: () => true,
}

describe('IssueProcessor', () => {
  let processor: IssueProcessor
  let apiClient: YouTrackApiClient

  beforeEach(() => {
    apiClient = {
      validateUser: vi.fn().mockResolvedValue(true)
    } as any
    processor = new IssueProcessor(mockConfig, apiClient)
    vi.clearAllMocks()
  })

  it('processes new issues and maps to SyncIssue', async () => {
    const issues: GitHubIssue[] = [
      { number: 1, updated_at: new Date().toISOString(), state: 'open', title: 't', body: '', assignee: { login: 'a' } } as any
    ]
    const result = await processor.processNewIssues(issues)
    expect(result.syncIssues.length).toBe(1)
    expect(result.syncIssues[0]?.github.number).toBe(1)
    expect(result.syncIssues[0]?.youtrack.summary).toContain('GitHub #1')
  })
})
