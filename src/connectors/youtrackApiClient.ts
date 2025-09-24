import type { YouTrackIssue, YouTrackIssueRequest } from '../models/YouTrackIssue'
import { config } from '../config/config'

export class YouTrackApiClient {

  async getIssue(issueId: string): Promise<YouTrackIssue> {
    const url = `${config.youtrack.baseUrl}/api/issues/${issueId}?fields=id,idReadable,summary,description,created,updated`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.youtrack.token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`YouTrack GET Error: ${response.status} - ${errorText}`)
    }

    return await response.json() as YouTrackIssue
  }

  async createIssue(issueData: YouTrackIssueRequest): Promise<YouTrackIssue> {
    const requestData = {
      $type: "Issue",
      ...issueData,
      project: { 
        $type: "Project",
        shortName: config.youtrack.projectId 
      }
    }

    const url = `${config.youtrack.baseUrl}/api/issues?fields=id,idReadable,summary,description,created,updated`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.youtrack.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`YouTrack CREATE Error: ${response.status} - ${errorText}`)
    }

    const createdIssue = await response.json() as YouTrackIssue
    console.log(`✅ Created YouTrack issue: ${createdIssue.idReadable}`)
    return createdIssue
  }

  async updateIssue(issueId: string, updateData: YouTrackIssueRequest): Promise<YouTrackIssue> {
    const url = `${config.youtrack.baseUrl}/api/issues/${issueId}?fields=id,idReadable,summary,description,created,updated`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.youtrack.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`YouTrack UPDATE Error: ${response.status} - ${errorText}`)
    }

    const updatedIssue = await response.json() as YouTrackIssue
    console.log(`✅ Updated YouTrack issue: ${updatedIssue.idReadable}`)
    return updatedIssue
  }

  async deleteIssue(issueId: string): Promise<void> {
    const url = `${config.youtrack.baseUrl}/api/issues/${issueId}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${config.youtrack.token}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`YouTrack DELETE Error: ${response.status} - ${errorText}`)
    }
  }

  async validateUser(login: string): Promise<boolean> {
    try {
      const url = `${config.youtrack.baseUrl}/api/users?q=${login}&$top=1&fields=login,name`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.youtrack.token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn(`⚠️  YouTrack user validation failed for '${login}': ${response.status} ${response.statusText}`)
        return false
      }

      const users = await response.json()
      const found = Array.isArray(users) && users.length > 0 && users.some(user => user.login === login)
      
      if (!found) {
        console.warn(`⚠️  YouTrack user '${login}' does not exist`)
      } 
      return found
    } catch (error) {
      console.warn(`⚠️  Failed to validate YouTrack user '${login}':`, error)
      return false
    }
  }
}