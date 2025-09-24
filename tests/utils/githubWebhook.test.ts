import { describe, it, expect } from 'vitest'
import { verifyGitHubSignature } from '../../src/utils/githubWebhook'
import crypto from 'crypto'

describe('GitHub Webhook Utils', () => {
  const testPayload = '{"test": "payload"}'
  const testSecret = 'test-secret-key'

  describe('verifyGitHubSignature', () => {
    it('should return true for valid signature', () => {
      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(testPayload, 'utf8')
        .digest('hex')
      
      const signatureWithPrefix = `sha256=${validSignature}`
      
      // Mock env var
      process.env.GITHUB_WEBHOOK_SECRET = testSecret
      
      const result = verifyGitHubSignature(testPayload, signatureWithPrefix)
      
      expect(result).toBe(true)
    })

    it('should return false for invalid signature', () => {
      const invalidSignature = 'sha256=invalid-signature-hash'
      
      process.env.GITHUB_WEBHOOK_SECRET = testSecret
      
      const result = verifyGitHubSignature(testPayload, invalidSignature)
      
      expect(result).toBe(false)
    })

    it('should return true when no secret is configured', () => {
      delete process.env.GITHUB_WEBHOOK_SECRET
      
      const result = verifyGitHubSignature(testPayload, 'any-signature')
      
      expect(result).toBe(true)
    })

    it('should handle timing attacks with constant time comparison', () => {
      const signature1 = 'sha256=abc123'
      const signature2 = 'sha256=def456'
      
      process.env.GITHUB_WEBHOOK_SECRET = testSecret
      
      // Both should return false, but take similar time
      const start1 = Date.now()
      const result1 = verifyGitHubSignature(testPayload, signature1)
      const time1 = Date.now() - start1
      
      const start2 = Date.now()
      const result2 = verifyGitHubSignature(testPayload, signature2)
      const time2 = Date.now() - start2
      
      expect(result1).toBe(false)
      expect(result2).toBe(false)
      // Both should be roughly the same time (timing attack protection)
      expect(Math.abs(time1 - time2)).toBeLessThan(5)
    })
  })
})