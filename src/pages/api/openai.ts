import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' })
    }

    // Server-side only environment variables (secure)
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview'

    if (!apiKey || !endpoint || !deploymentName) {
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: 2000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        top_p: 0.95,
        stream: false
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json(data)

  } catch (error) {
    console.error('OpenAI API Error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
}