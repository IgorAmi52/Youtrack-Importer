export interface GitHubIssue {
  id: number
  number: number
  title: string
  updated_at: string
  state: string
  user: {
    login: string
  }
  assignee?: {
    login: string
  } | null
  html_url: string
  created_at: string
  body?: string
}