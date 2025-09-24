import { describe, it, expect, vi, beforeEach } from 'vitest'
import { YouTrackService } from '../../src/service/youtrackService'
import type { Config } from '../../src/config/config'
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

describe('YouTrackService', () => {
  let service: YouTrackService
  let apiClient: YouTrackApiClient

  beforeEach(() => {
    apiClient = {
      getIssue: vi.fn(),
      updateIssue: vi.fn(),
      createIssue: vi.fn().mockResolvedValue({ id: 'yt1' }),
      validateUser: vi.fn()
    } as any
    service = new YouTrackService(mockConfig, apiClient)
    vi.clearAllMocks()
  })

  it('syncIssues calls createIssue for each syncIssue', async () => {
    const syncIssues = [
      { github: { number: 1, updated_at: new Date().toISOString() } as any, youtrack: { summary: 's' } as any }
    ]
    const results = await service.syncIssues(syncIssues)
    expect(apiClient.createIssue).toHaveBeenCalled()
    expect(results[0]?.youtrackIssue.id).toBe('yt1')
  })
})
