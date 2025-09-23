import { JournalEntry, WeeklySummary, EmotionalPattern, EntrySummary } from '@/types'

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

class OpenAIService {
  private apiKey: string | undefined
  private endpoint: string | undefined
  private deploymentName: string | undefined
  private apiVersion: string | undefined

  constructor() {
    // Azure OpenAI Configuration from Environment Variables
    this.apiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY
    this.endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT
    this.deploymentName = process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT
    this.apiVersion = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2024-12-01-preview'
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.apiKey || !this.endpoint || !this.deploymentName) {
      throw new Error('Azure OpenAI configuration missing. Please check your environment variables.')
    }

    try {
      // Azure OpenAI endpoint URL
      const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`
      
      console.log('🤖 Making request to Azure OpenAI:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey, // Azure uses 'api-key' instead of 'Authorization'
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          max_tokens: 2000, // Increased for more detailed insights
          temperature: 0.7, // Good balance of creativity and consistency
          presence_penalty: 0.1, // Encourages diverse insights
          frequency_penalty: 0.1, // Reduces repetition
          top_p: 0.95, // Azure OpenAI parameter for better responses
          stream: false
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Azure OpenAI API error:', response.status, errorText)
        throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`)
      }

      const data: OpenAIResponse = await response.json()
      console.log('✅ Azure OpenAI response received successfully')
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error calling Azure OpenAI API:', error)
      throw error
    }
  }

  async analyzeWeeklyEntries(entries: JournalEntry[]): Promise<Partial<WeeklySummary>> {
    if (entries.length === 0) {
      throw new Error('No entries to analyze')
    }

    const entriesText = entries.map((entry, index) => 
      `Entry ${index + 1}:
Date: ${entry.date}
Title: ${entry.title || 'Untitled'}
Mood: ${entry.mood || 'not specified'}
Content: ${entry.content}
Tags: ${entry.tags?.join(', ') || 'none'}
---`
    ).join('\n\n')

    const prompt = `
    As Dr. Maya Chen, an expert AI therapist and emotional intelligence specialist, conduct a DEEP COMPREHENSIVE ANALYSIS of this person's complete weekly journal entries. You have access to their full thoughts, emotions, and experiences. Provide transformative insights that will genuinely help them grow.

    COMPLETE JOURNAL DATA FOR ANALYSIS:
    ${entriesText}

    Analyze EVERYTHING - their words, emotions, patterns, triggers, relationships, work life, personal struggles, victories, fears, hopes, and dreams. Look for what they might not even realize about themselves.

    Provide a comprehensive psychological analysis in this exact JSON structure:
    {
      "themes": ["Deep, meaningful themes you discover - be specific and insightful"],
      "emotionalPatterns": [
        {
          "emotion": "primary emotion detected",
          "frequency": 0.8,
          "trend": "increasing/decreasing/stable",
          "context": "Detailed context about when and why this emotion appears"
        }
      ],
      "achievements": ["Meaningful accomplishments, both big and small, that deserve recognition"],
      "improvements": ["Areas where gentle growth is possible - be specific and actionable"],
      "suggestions": ["Practical, personalized advice based on their specific patterns and challenges"],
      "motivationalInsight": "A deeply personal, encouraging message that resonates with their unique journey and current struggles/victories",
      "actionSteps": ["3-5 specific, actionable steps they can take this week to improve their wellbeing"]
    }

    COMPREHENSIVE ANALYSIS REQUIREMENTS:
    
    📊 PATTERN ANALYSIS:
    - Emotional patterns and mood cycles across all entries
    - Recurring thoughts, fears, hopes, and concerns
    - Behavioral patterns and daily routine impacts
    - Relationship patterns and social interactions
    - Work/life balance and stress indicators
    - Sleep, health, and lifestyle patterns mentioned
    
    🎯 DEEP PSYCHOLOGICAL INSIGHTS:
    - Unconscious patterns they might not see
    - Emotional triggers and their root causes
    - Defense mechanisms and coping strategies
    - Core beliefs and self-talk patterns
    - Areas of personal growth and stagnation
    - Hidden strengths and untapped potential
    
    💡 THERAPEUTIC RECOMMENDATIONS:
    - Specific remedies for identified problems
    - Practical tools for emotional regulation
    - Behavioral changes that would help
    - Mindfulness and self-care suggestions
    - Communication improvements needed
    - Goal-setting recommendations
    
    🌟 PERSONALIZED SUPPORT:
    - Celebrate genuine achievements and progress
    - Address specific struggles with compassion
    - Provide hope and realistic optimism
    - Offer accountability and motivation
    - Validate their feelings and experiences
    - Guide them toward self-awareness and growth

    Tone: Warm, wise, encouraging, and genuinely helpful. Write as if you're their trusted therapist who has read every word and truly understands their inner world.

    IMPORTANT: Return ONLY valid JSON in the exact format specified above. Do NOT wrap the response in markdown code blocks or add any explanation. Just return the raw JSON object.
    `

    try {
      const response = await this.makeRequest([
        { 
          role: 'system', 
          content: `You are Dr. Maya Chen, a renowned therapist and emotional intelligence expert with 20 years of experience helping people through journaling therapy. You have a PhD in Psychology, specialize in cognitive behavioral therapy, and have a gift for seeing patterns that others miss. You're known for your warm but insightful approach - you celebrate victories genuinely and address challenges with compassionate honesty. Your goal is to help people understand themselves better and take meaningful steps toward growth and happiness.` 
        },
        { role: 'user', content: prompt }
      ])

      // Parse the JSON response - handle markdown code blocks and fix formatting
      let cleanResponse = response.trim()
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Fix common JSON formatting issues
      cleanResponse = cleanResponse.replace(/"motivationalInsight":\s*"([^"]*(?:\\.[^"]*)*)"\s+"actionSteps":/g, '"motivationalInsight": "$1",\n  "actionSteps":')
      cleanResponse = cleanResponse.replace(/"\s+"/g, '",\n  "')
      
      console.log('🧹 Cleaned AI response for parsing:', cleanResponse.substring(0, 200) + '...')
      
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
      console.error('Error parsing AI response:', error)
      
      // Fallback analysis if JSON parsing fails
      return {
        themes: ['Personal Reflection', 'Daily Experiences'],
        emotionalPatterns: [{
          emotion: 'mixed',
          frequency: 0.5,
          trend: 'stable',
          context: 'Various life experiences'
        }],
        achievements: ['Consistent journaling', 'Self-reflection'],
        improvements: ['Continue regular journaling'],
        suggestions: ['Keep exploring your thoughts and feelings'],
        motivationalInsight: 'Your commitment to journaling shows dedication to personal growth.',
        actionSteps: ['Continue daily journaling', 'Reflect on patterns', 'Set weekly goals']
      }
    }
  }

  async analyzeIndividualEntry(entry: JournalEntry): Promise<Partial<EntrySummary>> {
    const entryText = `
Title: ${entry.title || 'Untitled'}
Date: ${entry.date}
Mood: ${entry.mood || 'not specified'}
Content: ${entry.content}
Tags: ${entry.tags?.join(', ') || 'none'}
Created: ${entry.createdAt}`

    const prompt = `
    As Dr. Maya Chen, an expert AI therapist and emotional intelligence specialist, provide a personalized, insightful analysis of this individual journal entry. Focus on understanding the person's inner world and offering meaningful insights that will genuinely help them grow.

    JOURNAL ENTRY TO ANALYZE:
    ${entryText}

    Analyze this entry deeply - understand the emotions, thoughts, patterns, and underlying themes. Look for what this person might not realize about themselves in this moment.

    Provide your analysis in this exact JSON structure:
    {
      "keyThemes": ["2-3 core themes present in this entry - be specific and meaningful"],
      "emotionalInsights": ["Deep emotional observations about their state of mind, feelings, and inner experience"],
      "personalGrowth": ["Specific growth opportunities and strengths you observe in this entry"],
      "patterns": ["Behavioral, emotional, or thought patterns you notice - both positive and concerning"],
      "suggestions": ["2-3 personalized, actionable suggestions based on this specific entry"],
      "motivationalNote": "A warm, encouraging message that acknowledges their feelings and inspires continued growth",
      "reflection": "A thoughtful reflection that helps them see their experience from a new perspective"
    }

    ANALYSIS FOCUS:
    - Emotional depth and authenticity
    - Hidden strengths and resilience
    - Growth opportunities and insights
    - Patterns that deserve attention
    - Validation of their experiences
    - Gentle guidance for next steps
    - Celebration of their self-awareness

    Be warm, insightful, and genuinely helpful. Make them feel heard and understood while offering valuable perspective.
    `

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are Dr. Maya Chen, a compassionate AI therapist specializing in journal analysis and emotional intelligence. Provide deep, meaningful insights that help people understand themselves better.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]

      const response = await this.makeRequest(messages)
      
      // Clean and fix the JSON response
      let cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim()
      
      console.log('🤖 Raw AI response for entry analysis:', cleanedResponse)
      
      // Fix common JSON formatting issues that GPT sometimes creates
      // Add missing comma before "reflection" if it's missing
      cleanedResponse = cleanedResponse.replace(
        /"motivationalNote":\s*"([^"]*(?:\\.[^"]*)*)"\s+"reflection":/g,
        '"motivationalNote": "$1",\n  "reflection":'
      )
      
      // Fix any other missing commas between properties
      cleanedResponse = cleanedResponse.replace(
        /"\s+"/g,
        '",\n  "'
      )
      
      console.log('� Cleaned AI response for entry analysis:', cleanedResponse)
      
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
      console.error('Error parsing AI response for entry analysis:', error)
      
      // Fallback analysis for individual entry
      return {
        keyThemes: ['Self-Reflection', 'Personal Experience'],
        emotionalInsights: ['You are processing your experiences with thoughtfulness'],
        personalGrowth: ['Your commitment to journaling shows self-awareness'],
        patterns: ['Regular self-reflection and emotional processing'],
        suggestions: ['Continue exploring your thoughts', 'Trust your insights'],
        motivationalNote: 'Your willingness to examine your inner world is a beautiful strength.',
        reflection: 'Each moment of self-reflection is a gift you give to your future self.'
      }
    }
  }

  async generateMotivationalQuote(): Promise<string> {
    const prompt = `
    Generate a short, inspiring quote about journaling, self-reflection, or personal growth. 
    Keep it under 20 words and make it uplifting and motivational.
    Return only the quote without quotation marks.
    `

    try {
      const response = await this.makeRequest([
        { role: 'system', content: 'You are a wise mentor who creates inspiring quotes about personal growth and self-reflection.' },
        { role: 'user', content: prompt }
      ])

      return response.trim()
    } catch (error) {
      console.error('Error generating quote:', error)
      
      // Fallback quotes
      const fallbackQuotes = [
        'Every word you write is a step toward understanding yourself better.',
        'Your journal is a mirror reflecting your growth and wisdom.',
        'In the pages of your journal, you discover the author of your own story.',
        'Each entry is a conversation with your future self.',
        'Writing is thinking on paper, and thinking is growing.'
      ]
      
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
    }
  }
}

export const aiService = new OpenAIService()