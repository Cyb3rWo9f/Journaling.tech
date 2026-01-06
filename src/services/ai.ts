import { JournalEntry, WeeklySummary, EntrySummary } from '@/types'

interface AnalyzeResponse {
  content: string
  type: string
}

class AdvancedAIService {
  private maxRetries = 2
  private baseDelay = 8000
  private failCount = 0
  private requestQueue: Promise<string | null> = Promise.resolve(null)
  private lastRequestTime = 0
  private minRequestInterval = 10000 // 10 seconds between requests (safer)
  public lastError: string | null = null // Store last error message for hold status

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Queue requests to prevent flooding
  private async queueRequest(
    type: 'weekly' | 'entry' | 'quote',
    data: { entries?: JournalEntry[]; entry?: JournalEntry },
    attempt = 1
  ): Promise<string | null> {
    // Wait for minimum interval since last request
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest)
    }
    
    this.lastRequestTime = Date.now()
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type,
          ...data,
        }),
      })

      if (!response.ok) {
        let errorData: { quotaExhausted?: boolean; retryAfter?: number; reason?: string; error?: string } = {}
        try {
          errorData = await response.json()
        } catch {
          // Ignore parse errors
        }

        // If rate limited
        if (response.status === 429) {
          this.failCount++
          
          // If it's just a queue/timing issue, retry after delay
          if (errorData.error === 'Request in progress' || errorData.error === 'Too many requests') {
            if (attempt <= this.maxRetries) {
              const delay = (errorData.retryAfter || 5) * 1000
              await this.sleep(delay)
              return this.queueRequest(type, data, attempt + 1)
            }
          }
          
          // Quota exhausted - return null and store error
          if (errorData.quotaExhausted) {
            this.lastError = 'Rate limit: Daily quota exhausted'
            return null
          }
          
          // Rate limited - wait longer
          if (attempt <= this.maxRetries) {
            const delay = this.baseDelay * Math.pow(2, attempt - 1)
            await this.sleep(delay)
            return this.queueRequest(type, data, attempt + 1)
          }
          
          this.lastError = `Rate limit: ${errorData.error || 'Too many requests'}`
          return null
        }

        // Return null for other status codes and store error
        this.lastError = `API error: ${response.status}`
        return null
      }

      const result: AnalyzeResponse = await response.json()
      const content = result.content || ''
      
      // Reset fail count on success
      this.failCount = 0
      
      return content
    } catch (error) {
      this.lastError = 'Network error'
      return null
    }
  }

  private async makeRequest(
    type: 'weekly' | 'entry' | 'quote',
    data: { entries?: JournalEntry[]; entry?: JournalEntry }
  ): Promise<string | null> {
    // Chain requests to prevent concurrent calls
    this.requestQueue = this.requestQueue
      .catch(() => null)
      .then(() => this.queueRequest(type, data))
    
    return this.requestQueue
  }

  async analyzeWeeklyEntries(entries: JournalEntry[]): Promise<Partial<WeeklySummary> | null> {
    if (entries.length === 0) {
      throw new Error('No entries to analyze')
    }

    try {
      const response = await this.makeRequest('weekly', { entries })

      if (!response) {
        if (!this.lastError) {
          this.lastError = 'API error: No response received from AI service'
        }
        return null
      }

      // Clean and parse response
      let cleanResponse = response.trim()
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      // Fix common JSON issues
      cleanResponse = cleanResponse
        .replace(/"motivationalInsight":\s*"([^"]*(?:\\.[^"]*)*)"\s+"actionSteps":/g, '"motivationalInsight": "$1",\n  "actionSteps":')
        .replace(/"\s+"/g, '",\n  "')

      const analysis = JSON.parse(cleanResponse)

      return {
        themes: analysis.themes || [],
        emotionalPatterns: analysis.emotionalPatterns || [],
        achievements: analysis.achievements || [],
        improvements: analysis.improvements || [],
        suggestions: analysis.suggestions || [],
        motivationalInsight: analysis.motivationalInsight || '',
        actionSteps: analysis.actionSteps || []
      }
    } catch (error) {
      this.lastError = 'Failed to analyze weekly entries'
      return null
    }
  }

  async analyzeIndividualEntry(entry: JournalEntry): Promise<Partial<EntrySummary> | null> {
    try {
      const response = await this.makeRequest('entry', { entry })

      if (!response) {
        if (!this.lastError) {
          this.lastError = 'API error: No response received from AI service'
        }
        return null
      }

      let cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim()
      
      // Fix JSON formatting issues
      cleanedResponse = cleanedResponse
        .replace(/"motivationalNote":\s*"([^"]*(?:\\.[^"]*)*)"\s+"reflection":/g, '"motivationalNote": "$1",\n  "reflection":')
        .replace(/"\s+"/g, '",\n  "')

      const analysis = JSON.parse(cleanedResponse)

      return {
        keyThemes: analysis.keyThemes || [],
        emotionalInsights: analysis.emotionalInsights || [],
        personalGrowth: analysis.personalGrowth || [],
        patterns: analysis.patterns || [],
        suggestions: analysis.suggestions || [],
        motivationalNote: analysis.motivationalNote || 'Your self-reflection shows wisdom and courage.',
        reflection: analysis.reflection || 'Every entry is a step toward greater self-understanding.'
      }
    } catch (error) {
      this.lastError = 'Failed to analyze entry'
      return null
    }
  }

  async generateMotivationalQuote(): Promise<string> {
    try {
      const response = await this.makeRequest('quote', {})
      return response?.trim() || this.getQuoteFallback()
    } catch {
      return this.getQuoteFallback()
    }
  }

  private getQuoteFallback(): string {
    const quotes = [
      'Every word you write is a step toward understanding yourself better.',
      'Your journal is a mirror reflecting your growth and wisdom.',
      'In the pages of your journal, you discover the author of your own story.',
      'Each entry is a conversation with your future self.',
      'Writing is thinking on paper, and thinking is growing.',
      'Your thoughts matter. Your feelings are valid. Your story is worth telling.',
      'In moments of reflection, we find the seeds of transformation.',
    ]
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  // Get current status
  getStatus(): { failCount: number } {
    return { failCount: this.failCount }
  }
}

export const aiService = new AdvancedAIService()
