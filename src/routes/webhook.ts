import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { verifyGitHubSignature } from '../utils/githubWebhook'
import type { IssueProcessor } from '../service/issueProcessor'
import type { YouTrackService } from '../service/youtrackService'
import {type Config } from '../config/config'
import type { C } from 'vitest/dist/chunks/environment.d.cL3nLXbE'

interface WebhookDependencies {
  issueProcessor: IssueProcessor
  youtrackService: YouTrackService
  config: Config
}

export function createWebhookRoutes(dependencies: WebhookDependencies): FastifyPluginAsync {
  const { issueProcessor, youtrackService, config } = dependencies

  return async function (fastify: FastifyInstance) {
    fastify.post('/webhook/github', async (request, reply) => {
      try {
        const signature = request.headers['x-hub-signature-256'] as string
        if (signature && config.github.webhookSecret) {
          if (!verifyGitHubSignature(JSON.stringify(request.body), signature, config.github.webhookSecret)) {
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