import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { UsersMapRepo } from '../db/repo/usersMapRepo'

export const userMappingsRoutes: FastifyPluginAsync = async function (app: FastifyInstance) {
  app.post('/api/user-mappings', async (request, reply) => {
    const { githubLogin, youtrackUsername } = request.body as { githubLogin?: string, youtrackUsername?: string }
    if (!githubLogin || !youtrackUsername) {
        console.warn('⚠️  Missing githubLogin or youtrackUsername in request body')
      return reply.status(400).send({ error: 'githubLogin and youtrackUsername are required' })
    }
    UsersMapRepo.set(githubLogin, youtrackUsername)
    console.log(`✅ Mapped GitHub user '${githubLogin}' to YouTrack user '${youtrackUsername}'`)
    return { success: true }
  })
}