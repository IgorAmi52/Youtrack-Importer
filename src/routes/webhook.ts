import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { verifyGitHubSignature } from '../utils/githubWebhook'
import type { IssueProcessor } from '../service/issueProcessor'
import type { YouTrackService } from '../service/youtrackService'

interface WebhookDependencies {
  issueProcessor: IssueProcessor
  youtrackService: YouTrackService
}

export function createWebhookRoutes(dependencies: WebhookDependencies): FastifyPluginAsync {
  const { issueProcessor, youtrackService } = dependencies

  return async function (fastify: FastifyInstance) {
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

          if (result.syncIssues.length > 0) {
            await youtrackService.syncIssues(result.syncIssues)
          }
        }

        return reply.status(200).send({ status: 'ok' })
        
      } catch (error) {
        console.error('❌ Webhook processing failed:', error)
        return reply.status(500).send({ error: 'Processing failed' })
      }
    })
  }
}