import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function getDirname(importMetaUrl: string): string {
  const filename = fileURLToPath(importMetaUrl)
  return path.dirname(filename)
}

export function getPathFromFile(importMetaUrl: string, ...relativePath: string[]): string {
  const dirname = getDirname(importMetaUrl)
  return path.join(dirname, ...relativePath)
}

export function getFilename(importMetaUrl: string): string {
  return fileURLToPath(importMetaUrl)
}
