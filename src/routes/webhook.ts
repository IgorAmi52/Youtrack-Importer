import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { verifyGitHubSignature } from '../utils/githubWebhook'
import { IssueProcessor } from '../service/issueProcessor'
import { YouTrackService } from '../service/youtrackService'

const issueProcessor = new IssueProcessor()
const youtrackService = new YouTrackService()

export const webhookRoutes: FastifyPluginAsync = async function (fastify: FastifyInstance) {

  fastify.post('/webhook/github', async (request, reply) => {
    try {
      const signature = request.headers['x-hub-signature-256'] as string
      if (signature && process.env.GITHUB_WEBHOOK_SECRET) {
        if (!verifyGitHubSignature(JSON.stringify(request.body), signature)) {
          return reply.status(401).send({ error: 'Invalid signature' })
        }
      }

      const event = request.headers['x-github-event'] as string
      const payload = request.body as any

      if (event === 'issues') {
        const issue = payload.issue
        const result = await issueProcessor.processNewIssues([issue])
        
        if (result.youtrackIssues.length > 0) {
          await youtrackService.syncIssues([issue], result.youtrackIssues)
        }
      }

      return reply.status(200).send({ status: 'ok' })
      
    } catch (error) {
      console.error('❌ Webhook processing failed:', error)
      return reply.status(500).send({ error: 'Processing failed' })
    }
  })
}