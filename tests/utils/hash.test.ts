import { describe, it, expect } from 'vitest'
import { createContentHash } from '../../src/utils/hash'
import type { GitHubIssue } from '../../src/models/GitHubIssue'

describe('Hash Utils', () => {
  const mockIssue: GitHubIssue = {
    id: 123,
    number: 1,
    title: 'Test Issue',
    body: 'Test body',
    state: 'open',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    user: { login: 'testuser' },
    assignee: { login: 'assignee' }
  }

  describe('createContentHash', () => {
    it('should create consistent hash for same issue', () => {
      const hash1 = createContentHash(mockIssue)
      const hash2 = createContentHash(mockIssue)
      
      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^[a-f0-9]{16}$/) // 16 chars hex format
    })

    it('should create different hash for different content', () => {
      const issue1 = { ...mockIssue, title: 'Title 1' }
      const issue2 = { ...mockIssue, title: 'Title 2' }
      
      const hash1 = createContentHash(issue1)
      const hash2 = createContentHash(issue2)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should create different hash when content changes', () => {
      const issueWithDifferentTitle = { ...mockIssue, title: 'Different Title' }
      const issueWithDifferentBody = { ...mockIssue, body: 'Different body' }
      
      const hash1 = createContentHash(mockIssue)
      const hash2 = createContentHash(issueWithDifferentTitle)
      const hash3 = createContentHash(issueWithDifferentBody)
      
      expect(hash1).not.toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })

    it('should create different hash when state changes', () => {
      const openIssue = { ...mockIssue, state: 'open' }
      const closedIssue = { ...mockIssue, state: 'closed' }
      
      const hash1 = createContentHash(openIssue)
      const hash2 = createContentHash(closedIssue)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should handle missing body', () => {
      const issueWithEmptyBody = { ...mockIssue, body: '' }
      
      const hash = createContentHash(issueWithEmptyBody)
      
      expect(hash).toMatch(/^[a-f0-9]{16}$/)
    })
  })
})