import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { lat, lon } = req.query

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Invalid request' })
    }

    // Validate lat/lon are valid numbers
    const latitude = parseFloat(lat as string)
    const longitude = parseFloat(lon as string)
    
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' })
    }

    // Server-side only environment variable (secure)
    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'Service not configured' })
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`

    const response = await fetch(url)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Weather service unavailable' })
    }

    const data = await response.json()
    res.status(200).json(data)

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
}