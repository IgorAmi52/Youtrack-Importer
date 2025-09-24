import { describe, it, expect, vi, beforeEach } from 'vitest'
import { YouTrackApiClient } from '../../src/connectors/youtrackApiClient'
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

describe('YouTrackApiClient', () => {
  let client: YouTrackApiClient
  beforeEach(() => {
    client = new YouTrackApiClient(mockConfig)
    vi.clearAllMocks()
  })

  it('getIssue returns parsed issue', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: '1' }) })
    const issue = await client.getIssue('1')
    expect(issue).toEqual({ id: '1' })
  })

  it('throws on GET error', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 404, text: () => Promise.resolve('not found') })
    await expect(client.getIssue('1')).rejects.toThrow('YouTrack GET Error: 404 - not found')
  })
})
