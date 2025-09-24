import type { Config } from './config/config'
import { GitHubApiClient } from './connectors/githubApiClient'
import { YouTrackApiClient } from './connectors/youtrackApiClient'
import { GitHubService } from './service/githubService'
import { YouTrackService } from './service/youtrackService'
import { IssueProcessor } from './service/issueProcessor'
import { GitHubPollingWorker } from './workers/githubPoller'

export interface AppContainer {
  config: Config
  githubApiClient: GitHubApiClient
  youtrackApiClient: YouTrackApiClient
  githubService: GitHubService
  youtrackService: YouTrackService
  issueProcessor: IssueProcessor
  githubWorker: GitHubPollingWorker
}

export function createContainer(config: Config): AppContainer {
  const githubApiClient = new GitHubApiClient(config)
  const youtrackApiClient = new YouTrackApiClient(config)
  
  const githubService = new GitHubService(githubApiClient)
  const youtrackService = new YouTrackService(config, youtrackApiClient)
  const issueProcessor = new IssueProcessor(config, youtrackApiClient)
  
  const githubWorker = new GitHubPollingWorker(
    config,
    githubService,
    youtrackService,
    issueProcessor
  )
  
  return {
    config,
    githubApiClient,
    youtrackApiClient,
    githubService,
    youtrackService,
    issueProcessor,
    githubWorker
  }
}