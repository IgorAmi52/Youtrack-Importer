export class PollingScheduler {
  private isRunning = false
  private intervalId: NodeJS.Timeout | undefined

  start(callback: () => Promise<void>, interval: number): void {
    if (this.isRunning) {
      return
    }
    
    this.isRunning = true
    
    callback()
    
    this.intervalId = setInterval(() => {
      callback()
    }, interval)
  }

  stop(): void {
    if (!this.isRunning) {
      return
    }
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    
    this.isRunning = false
  }

  get running(): boolean {
    return this.isRunning
  }
}