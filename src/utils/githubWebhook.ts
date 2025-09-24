import crypto from 'crypto'

export function verifyGitHubSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.warn('⚠️ GitHub webhook secret not configured, skipping verification')
    return true
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload, 'utf8')
    .digest('hex')
  
  const expectedSignatureWithPrefix = `sha256=${expectedSignature}`
  
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignatureWithPrefix)
  
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false
  }
  
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
}