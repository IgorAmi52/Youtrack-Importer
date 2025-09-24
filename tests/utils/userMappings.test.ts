import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

// Mock the repo with vi.fn() directly in factory

vi.mock('../../src/db/repo/usersMapRepo', () => ({
  UsersMapRepo: {
    set: vi.fn()
  }
}))

import { loadUserMappingsFromEnv } from '../../src/utils/userMappings'
import { UsersMapRepo } from '../../src/db/repo/usersMapRepo'

describe('User Mappings Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.USER_MAPPINGS
  })

  describe('loadUserMappingsFromEnv', () => {
    it('should load valid user mappings from env', () => {
      process.env.USER_MAPPINGS = 'github1:youtrack1,github2:youtrack2'
      
      loadUserMappingsFromEnv()
      
      expect(UsersMapRepo.set).toHaveBeenCalledWith('github1', 'youtrack1')
      expect(UsersMapRepo.set).toHaveBeenCalledWith('github2', 'youtrack2')
      expect(UsersMapRepo.set).toHaveBeenCalledTimes(2)
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Loaded user mappings from USER_MAPPINGS env')
    })

    it('should handle empty env variable', () => {
      loadUserMappingsFromEnv()
      
      expect(UsersMapRepo.set).not.toHaveBeenCalled()
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should skip invalid mappings', () => {
      process.env.USER_MAPPINGS = 'github1:youtrack1,invalid_format,github2:youtrack2'
      
      loadUserMappingsFromEnv()
      
      expect(UsersMapRepo.set).toHaveBeenCalledWith('github1', 'youtrack1')
      expect(UsersMapRepo.set).toHaveBeenCalledWith('github2', 'youtrack2')
      expect(UsersMapRepo.set).toHaveBeenCalledTimes(2)
    })

    it('should handle whitespace correctly', () => {
      process.env.USER_MAPPINGS = ' github1 : youtrack1 , github2 : youtrack2 '
      
      loadUserMappingsFromEnv()
      
      expect(UsersMapRepo.set).toHaveBeenCalledWith('github1', 'youtrack1')
      expect(UsersMapRepo.set).toHaveBeenCalledWith('github2', 'youtrack2')
    })

    it('should skip empty mappings', () => {
      process.env.USER_MAPPINGS = 'github1:youtrack1,,github2:'
      
      loadUserMappingsFromEnv()
      
      expect(UsersMapRepo.set).toHaveBeenCalledWith('github1', 'youtrack1')
      expect(UsersMapRepo.set).toHaveBeenCalledTimes(1)
    })
  })
})