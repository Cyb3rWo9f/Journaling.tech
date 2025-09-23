'use client'

export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  description: string
  icon: string
  windSpeed: number
  windDirection: number
  pressure: number
  visibility: number
  uvIndex?: number
  location: {
    city: string
    country: string
    latitude: number
    longitude: number
  }
  timestamp: number
}

export interface WeatherForecast {
  date: string
  tempHigh: number
  tempLow: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

class WeatherService {
  private apiKey: string | null = null
  private baseUrl = 'https://api.openweathermap.org/data/2.5'

  constructor() {
    // We'll set this from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || null
    console.log('🌤️ Weather Service initialized')
    console.log('🔑 API Key configured:', this.apiKey ? 'YES' : 'NO')
    console.log('🔑 API Key preview:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'None')
  }

  setApiKey(key: string) {
    this.apiKey = key
    console.log('🔑 API Key manually set:', key ? 'YES' : 'NO')
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your .env.local file.')
    }

    const apiUrl = `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
    console.log('🌐 Weather API URL:', apiUrl.replace(this.apiKey, 'API_KEY_HIDDEN'))

    try {
      const response = await fetch(apiUrl)

      console.log('📡 Weather API Response Status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Weather API Error Response:', errorText)
        
        if (response.status === 401) {
          throw new Error(`Invalid API key. Please check your OpenWeatherMap API key. Response: ${errorText}`)
        }
        throw new Error(`Weather API error: ${response.status} ${response.statusText}. Response: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Weather data received:', data)

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: this.capitalizeWords(data.weather[0].description),
        icon: data.weather[0].icon,
        windSpeed: data.wind?.speed || 0,
        windDirection: data.wind?.deg || 0,
        pressure: data.main.pressure,
        visibility: data.visibility ? data.visibility / 1000 : 0, // Convert to km
        location: {
          city: data.name,
          country: data.sys.country,
          latitude,
          longitude
        },
        timestamp: Date.now()
      }

      // Store in localStorage for caching (5 minutes cache)
      localStorage.setItem('weatherData', JSON.stringify(weatherData))

      return weatherData
    } catch (error) {
      console.error('Error fetching weather data:', error)
      throw error
    }
  }

  async getWeatherForecast(latitude: number, longitude: number, days: number = 5): Promise<WeatherForecast[]> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Group forecast data by day
      const dailyForecasts: { [key: string]: any[] } = {}
      
      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString()
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = []
        }
        dailyForecasts[date].push(item)
      })

      // Process daily forecasts
      const forecasts: WeatherForecast[] = Object.entries(dailyForecasts)
        .slice(0, days)
        .map(([date, dayData]) => {
          const temps = dayData.map(item => item.main.temp)
          const tempHigh = Math.round(Math.max(...temps))
          const tempLow = Math.round(Math.min(...temps))
          
          // Use the most common weather condition for the day
          const conditions = dayData.map(item => item.weather[0])
          const mostCommon = conditions.reduce((prev, current) => 
            conditions.filter(c => c.id === current.id).length > 
            conditions.filter(c => c.id === prev.id).length ? current : prev
          )

          return {
            date,
            tempHigh,
            tempLow,
            description: this.capitalizeWords(mostCommon.description),
            icon: mostCommon.icon,
            humidity: Math.round(dayData.reduce((sum, item) => sum + item.main.humidity, 0) / dayData.length),
            windSpeed: dayData.reduce((sum, item) => sum + (item.wind?.speed || 0), 0) / dayData.length
          }
        })

      return forecasts
    } catch (error) {
      console.error('Error fetching weather forecast:', error)
      throw error
    }
  }

  getStoredWeatherData(): WeatherData | null {
    try {
      const stored = localStorage.getItem('weatherData')
      if (stored) {
        const weatherData = JSON.parse(stored)
        
        // Check if weather data is still fresh (5 minutes cache)
        const fiveMinutes = 5 * 60 * 1000
        if (Date.now() - weatherData.timestamp < fiveMinutes) {
          return weatherData
        }
      }
    } catch (error) {
      console.error('Error reading stored weather data:', error)
    }
    
    return null
  }

  getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`
  }

  getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, char => char.toUpperCase())
  }

  clearStoredWeatherData(): void {
    localStorage.removeItem('weatherData')
  }

  isApiKeyConfigured(): boolean {
    return !!this.apiKey
  }
}

export const weatherService = new WeatherService()