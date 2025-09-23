import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    // Server-side only environment variable (secure)
    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'Weather API not configured' })
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json(data)

  } catch (error) {
    console.error('Weather API Error:', error)
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
}