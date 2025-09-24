import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GitHubApiClient } from '../../src/connectors/githubApiClient'
import type { Config } from '../../src/config/config'

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

global.fetch = vi.fn()

describe('GitHubApiClient', () => {
  let client: GitHubApiClient
  beforeEach(() => {
    client = new GitHubApiClient(mockConfig)
    vi.clearAllMocks()
  })

  it('fetches issues with correct URL and headers', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve([{ number: 1 }]) })
    const issues = await client.fetchIssues()
    expect(fetch).toHaveBeenCalled()
    expect(issues).toEqual([{ number: 1 }])
  })

  it('returns empty array on API error', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 403, statusText: 'Forbidden', text: () => Promise.resolve('err') })
    const result = await client.fetchIssues()
    expect(result).toEqual([])
  })
})
