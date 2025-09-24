import { UsersMapRepo } from '../db/repo/usersMapRepo'

/**
 * Format: github1:yt1,github2:yt2
 */
export function loadUserMappingsFromEnv(): void {
  if (!process.env.USER_MAPPINGS) {
    return
  }

  try {
    process.env.USER_MAPPINGS.split(',').forEach(pair => {
      const [github, yt] = pair.split(':')
      if (github?.trim() && yt?.trim()) {
        UsersMapRepo.set(github.trim(), yt.trim())
      }
    })
    console.log('✅ Loaded user mappings from USER_MAPPINGS env')
  } catch (error) {
    console.error('❌ Failed to load user mappings from env:', error)
  }
}
