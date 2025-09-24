import { MetaRepo } from '../db/repo/metaRepo'
import { GitHubService } from '../service/githubService'
import { YouTrackService } from '../service/youtrackService'
import { IssueProcessor } from '../service/issueProcessor'
import { PollingScheduler } from '../utils/pollingScheduler'
import type { Config } from '../config/config'
import type { GitHubIssue } from '../models/GitHubIssue'

const LAST_MODIFIED_KEY = 'github_last_modified_time'

export class GitHubPollingWorker {
  private scheduler = new PollingScheduler()

  constructor(
    private config: Config,
    private githubService: GitHubService,
    private youtrackService: YouTrackService,
    private processor: IssueProcessor
  ) {}

  async processNewIssues(): Promise<void> {
    const lastModified = MetaRepo.get(LAST_MODIFIED_KEY)
    
    let sinceFilter = lastModified
    if (lastModified) {
      const lastDate = new Date(lastModified)
      lastDate.setSeconds(lastDate.getSeconds() + 1)
      sinceFilter = lastDate.toISOString()
    }

    await this.processWithPipeline(sinceFilter, lastModified)
  }

  private async processWithPipeline(sinceFilter?: string, lastModified?: string): Promise<void> {
    const pageQueue: GitHubIssue[][] = []
    const MAX_QUEUE_SIZE = 10 
    let isGitHubDone = false
    let newestTimestamp = lastModified
    let queueNotifier: (() => void) | null = null
    
    const githubFetcher = async () => {
      try {
        for await (const pageIssues of this.githubService.getIssuesPageByPage(sinceFilter)) {
          while (pageQueue.length >= MAX_QUEUE_SIZE) { // Avoid memory bloat
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          
          pageQueue.push(pageIssues)
          
          if (queueNotifier) {
            queueNotifier()
            queueNotifier = null
          }
        }
      } catch (error) {
        console.error('❌ GitHub fetcher error:', error)
      } finally {
        isGitHubDone = true
        if (queueNotifier) {
          queueNotifier()
          queueNotifier = null
        }
      }
    }
    
    const youtrackSyncer = async () => {
      while (!isGitHubDone || pageQueue.length > 0) {
        if (pageQueue.length > 0) {
          const batch = pageQueue.shift()!
          
          try {
            const result = await this.processor.processNewIssues(batch, lastModified)
            if (result.processedCount > 0) {
              await this.youtrackService.syncIssues(result.syncIssues)
            }
            if (result.newestTimestamp) {
              newestTimestamp = result.newestTimestamp
            }
          } catch (error) {
            console.error('❌ YouTrack syncer error:', error)
          }
        } else {
          await new Promise<void>(resolve => {
            queueNotifier = resolve
            setTimeout(resolve, 100)
          })
        }
      }
    }
    
    await Promise.all([githubFetcher(), youtrackSyncer()])
    
    if (newestTimestamp && newestTimestamp !== lastModified) {
      MetaRepo.set(LAST_MODIFIED_KEY, newestTimestamp)
    }
  }

  start(): void {
    if (this.scheduler.running) {
      return
    }
    this.scheduler.start(() => this.processNewIssues(), this.config.pollingIntervalMs)
  }

  async runOnce(): Promise<void> {
    await this.processNewIssues()
    console.log('✅ Initial sync completed')
  }

  stop(): void {
    this.scheduler.stop()
  }
}

