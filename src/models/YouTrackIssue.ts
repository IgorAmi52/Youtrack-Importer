
export interface YouTrackIssue {
  id: string
  idReadable: string
  summary: string
  description?: string
  created: number
  updated: number
}

export interface YouTrackIssueRequest {
  summary: string
  description?: string
  customFields?: Array<{
    $type?: string
    name: string
    value: any
  }>
}

