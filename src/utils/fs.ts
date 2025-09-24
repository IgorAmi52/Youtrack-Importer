import fs from 'node:fs'
import path from 'node:path'

export function ensureDirectoryExists(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`Created directory: ${dirPath}`)
    }
    return true
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error)
    return false
  }
}

export function ensureFileDirectoryExists(filePath: string): boolean {
  const dirPath = path.dirname(filePath)
  return ensureDirectoryExists(dirPath)
}

export function createFileWithDirectory(
  filePath: string, 
  content: string, 
  options: fs.WriteFileOptions = 'utf8'
): boolean {
  try {
    if (!ensureFileDirectoryExists(filePath)) {
      return false
    }
    
    fs.writeFileSync(filePath, content, options)
    return true
  } catch (error) {
    console.error(`Failed to create file ${filePath}:`, error)
    return false
  }
}