import { NextApiRequest, NextApiResponse } from 'next'

// GitHub Models API configuration
const GITHUB_MODELS_ENDPOINT = 'https://models.github.ai/inference/chat/completions'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

// Available models
const MODELS = {
  'grok-3': 'xai/grok-3',
  'grok-3-mini': 'xai/grok-3-mini',
} as const

// Rate limiting state
interface RateLimitState {
  lastRequestTime: number
  requestCount: number
  dailyCount: number
  dailyResetTime: number
  cooldownUntil: number
  activeRequest: boolean
}

const rateLimitState: RateLimitState = {
  lastRequestTime: 0,
  requestCount: 0,
  dailyCount: 0,
  dailyResetTime: Date.now() + 24 * 60 * 60 * 1000,
  cooldownUntil: 0,
  activeRequest: false,
}

const RATE_LIMITS = {
  requestsPerMinute: 2,
  requestsPerDay: 30,
  minIntervalMs: 8000,
  cooldownDuration: 30000,
}

function checkRateLimit(): { allowed: boolean; retryAfter?: number; reason?: string } {
  const now = Date.now()
  
  if (rateLimitState.activeRequest) {
    return { allowed: false, retryAfter: 2, reason: 'Request in progress' }
  }
  
  if (now < rateLimitState.cooldownUntil) {
    const retryAfter = Math.ceil((rateLimitState.cooldownUntil - now) / 1000)
    return { allowed: false, retryAfter, reason: 'Rate limit cooldown' }
  }
  
  if (now > rateLimitState.dailyResetTime) {
    rateLimitState.dailyCount = 0
    rateLimitState.dailyResetTime = now + 24 * 60 * 60 * 1000
  }
  
  if (rateLimitState.dailyCount >= RATE_LIMITS.requestsPerDay) {
    const retryAfter = Math.ceil((rateLimitState.dailyResetTime - now) / 1000)
    return { allowed: false, retryAfter, reason: 'Daily limit reached' }
  }
  
  const timeSinceLastRequest = now - rateLimitState.lastRequestTime
  if (timeSinceLastRequest < RATE_LIMITS.minIntervalMs) {
    const retryAfter = Math.ceil((RATE_LIMITS.minIntervalMs - timeSinceLastRequest) / 1000)
    return { allowed: false, retryAfter, reason: 'Too many requests' }
  }
  
  return { allowed: true }
}

function recordRequest() {
  rateLimitState.lastRequestTime = Date.now()
  rateLimitState.requestCount++
  rateLimitState.dailyCount++
  rateLimitState.activeRequest = true
}

function finishRequest() {
  rateLimitState.activeRequest = false
}

function triggerCooldown() {
  rateLimitState.cooldownUntil = Date.now() + RATE_LIMITS.cooldownDuration
  rateLimitState.activeRequest = false
}

// ============================================
// PROTECTED PROMPTS (Server-side only)
// These are never exposed to the client
// ============================================

const WEEKLY_SYSTEM_PROMPT = `You are Dr. Maya Chen, a world-renowned clinical psychologist and emotional intelligence expert with 25 years of experience. You have a PhD in Psychology from Stanford, specialize in cognitive behavioral therapy and positive psychology, and have helped thousands of people through journaling therapy.

Your approach is:
- Deeply empathetic and validating
- Insightful with pattern recognition
- Practical with actionable advice
- Encouraging while being honest
- Focused on growth and self-awareness

You have the ability to see patterns that others miss and provide transformative insights that genuinely help people understand themselves better.`

const ENTRY_SYSTEM_PROMPT = `You are Dr. Maya Chen, an expert AI therapist with deep expertise in emotional intelligence and personal growth. You provide insightful, compassionate analysis of journal entries that helps people understand themselves better.`

const QUOTE_SYSTEM_PROMPT = `You are a wise mentor who creates inspiring quotes.`

function getWeeklyUserPrompt(entriesText: string, entryCount: number): string {
  return `
Conduct a COMPREHENSIVE PSYCHOLOGICAL ANALYSIS of these ${entryCount} journal entries from the past week. Dive deep into the person's psyche, emotions, patterns, and growth opportunities.

JOURNAL ENTRIES:
${entriesText}

ANALYZE DEEPLY:
1. EMOTIONAL LANDSCAPE - Map their full emotional journey this week
2. BEHAVIORAL PATTERNS - Identify recurring thoughts, actions, triggers
3. HIDDEN STRENGTHS - What resilience and capabilities do they show?
4. GROWTH EDGES - Where are they ready to evolve?
5. ENERGY PATTERNS - What energizes vs. drains them?
6. CORE NEEDS - What fundamental needs are expressed?
7. BREAKTHROUGH MOMENTS - Any signs of transformation?

Provide your analysis in this EXACT JSON structure (no markdown, no code blocks):
{
  "themes": ["3-5 deep, meaningful themes discovered in their entries"],
  "emotionalPatterns": [
    {
      "emotion": "primary emotion",
      "frequency": 0.8,
      "trend": "increasing/decreasing/stable",
      "context": "When and why this emotion appears"
    }
  ],
  "achievements": ["Meaningful accomplishments and victories to celebrate"],
  "improvements": ["Gentle, specific areas for growth"],
  "suggestions": ["Personalized, actionable advice based on their patterns"],
  "motivationalInsight": "A deeply personal, encouraging message (2-3 sentences) that speaks directly to their unique journey this week. Make them feel truly seen and understood.",
  "actionSteps": ["3-5 specific, practical steps they can take this week"]
}

Be warm, wise, and genuinely helpful. Write as their trusted therapist who has read every word and truly understands their inner world.

IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanation text.`
}

function getEntryUserPrompt(entryText: string): string {
  return `
Analyze this journal entry with deep psychological insight. Understand the emotions, thoughts, and underlying themes.

JOURNAL ENTRY:
${entryText}

Provide your analysis in this EXACT JSON structure (no markdown, no code blocks):
{
  "keyThemes": ["2-3 core themes in this entry"],
  "emotionalInsights": ["Deep observations about their emotional state"],
  "personalGrowth": ["Growth opportunities and strengths you observe"],
  "patterns": ["Behavioral or thought patterns noticed"],
  "suggestions": ["2-3 personalized, actionable suggestions"],
  "motivationalNote": "A warm, encouraging message that acknowledges their feelings (1-2 sentences)",
  "reflection": "A thought-provoking reflection to help them see their experience differently (1 sentence)"
}

IMPORTANT: Return ONLY valid JSON.`
}

const QUOTE_USER_PROMPT = `Generate a short, inspiring quote about journaling, self-reflection, or personal growth. Keep it under 20 words. Return only the quote, no quotation marks.`

// ============================================

interface JournalEntry {
  title?: string
  date: string
  mood?: string
  content: string
  tags?: string[]
}

interface AnalyzeRequest {
  type: 'weekly' | 'entry' | 'quote'
  entries?: JournalEntry[]
  entry?: JournalEntry
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  const rateLimitCheck = checkRateLimit()
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      error: rateLimitCheck.reason,
      retryAfter: rateLimitCheck.retryAfter,
      quotaExhausted: rateLimitCheck.reason === 'Daily limit reached',
    })
  }

  try {
    const { type, entries, entry } = req.body as AnalyzeRequest

    if (!type || !['weekly', 'entry', 'quote'].includes(type)) {
      return res.status(400).json({ error: 'Invalid request type' })
    }

    let systemPrompt: string
    let userPrompt: string

    if (type === 'weekly') {
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ error: 'No entries provided' })
      }

      // Validate and sanitize entries
      const sanitizedEntries = entries.slice(0, 14).map((e: JournalEntry) => ({
        title: String(e.title || 'Untitled').slice(0, 200),
        date: String(e.date || '').slice(0, 50),
        mood: String(e.mood || 'not specified').slice(0, 50),
        content: String(e.content || '').slice(0, 5000),
        tags: Array.isArray(e.tags) ? e.tags.slice(0, 10).map(t => String(t).slice(0, 50)) : [],
      }))

      const entriesText = sanitizedEntries.map((e, i) => 
        `Entry ${i + 1}:
Date: ${e.date}
Title: ${e.title}
Mood: ${e.mood}
Content: ${e.content}
Tags: ${e.tags.join(', ') || 'none'}
---`
      ).join('\n\n')

      systemPrompt = WEEKLY_SYSTEM_PROMPT
      userPrompt = getWeeklyUserPrompt(entriesText, sanitizedEntries.length)

    } else if (type === 'entry') {
      if (!entry) {
        return res.status(400).json({ error: 'No entry provided' })
      }

      const sanitizedEntry = {
        title: String(entry.title || 'Untitled').slice(0, 200),
        date: String(entry.date || '').slice(0, 50),
        mood: String(entry.mood || 'not specified').slice(0, 50),
        content: String(entry.content || '').slice(0, 5000),
        tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 10).map(t => String(t).slice(0, 50)) : [],
      }

      const entryText = `
Title: ${sanitizedEntry.title}
Date: ${sanitizedEntry.date}
Mood: ${sanitizedEntry.mood}
Content: ${sanitizedEntry.content}
Tags: ${sanitizedEntry.tags.join(', ') || 'none'}`

      systemPrompt = ENTRY_SYSTEM_PROMPT
      userPrompt = getEntryUserPrompt(entryText)

    } else {
      // quote
      systemPrompt = QUOTE_SYSTEM_PROMPT
      userPrompt = QUOTE_USER_PROMPT
    }

    recordRequest()

    const response = await fetch(GITHUB_MODELS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS['grok-3'],
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.95,
      }),
    })

    if (!response.ok) {
      finishRequest()
      
      if (response.status === 429) {
        triggerCooldown()
        return res.status(429).json({
          error: 'Rate limited',
          retryAfter: 30,
        })
      }
      
      if (response.status === 401 || response.status === 403) {
        return res.status(response.status).json({
          error: 'Service authentication failed',
        })
      }
      
      return res.status(500).json({ error: 'AI service unavailable' })
    }

    const data = await response.json()
    finishRequest()

    const content = data.choices?.[0]?.message?.content || ''

    res.status(200).json({
      content,
      type,
    })

  } catch (error) {
    finishRequest()
    res.status(500).json({ error: 'Failed to process request' })
  }
}
