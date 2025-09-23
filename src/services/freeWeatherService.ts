'use client'

export interface FreeWeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  description: string
  icon: string
  windSpeed: number
  windDirection?: number
  pressure: number
  visibility?: number
  location: {
    city: string
    country: string
    latitude: number
    longitude: number
  }
  source: 'openweather' | 'free_api' | 'mock'
  timestamp: number
}

class FreeWeatherService {
  constructor() {
    console.log('🌤️ Free Weather Service initialized')
  }

  /**
   * Try secure API route first, then fallback to free alternatives
   */
  async getWeatherWithFallback(latitude: number, longitude: number): Promise<FreeWeatherData> {
    // 1. Try secure API route first
    try {
      console.log('🌤️ Trying secure weather API route...')
      const weather = await this.getFromSecureRoute(latitude, longitude)
      if (weather) {
        console.log('✅ Secure weather API successful')
        return weather
      }
    } catch (error) {
      console.warn('❌ Secure weather API failed:', error)
    }

    // 2. Try free weather API as fallback
    try {
      console.log('🌤️ Trying free weather API...')
      const weather = await this.getFromFreeAPI(latitude, longitude)
      if (weather) {
        console.log('✅ Free weather API successful')
        return weather
      }
    } catch (error) {
      console.warn('❌ Free weather API failed:', error)
    }

    // 3. Return mock weather data as final fallback
    console.log('🌤️ Using mock weather data as fallback')
    return this.getMockWeatherData(latitude, longitude)
  }

  /**
   * Use secure API route to get weather data
   */
  private async getFromSecureRoute(latitude: number, longitude: number): Promise<FreeWeatherData | null> {
    const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: this.capitalizeWords(data.weather[0].description),
      icon: data.weather[0].icon,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg,
      pressure: data.main.pressure,
      visibility: data.visibility ? data.visibility / 1000 : undefined, // Convert to km
      location: {
        city: data.name,
        country: data.sys.country,
        latitude,
        longitude
      },
      source: 'openweather',
      timestamp: Date.now()
    }
  }

  /**
   * Use wttr.in as a free alternative weather service
   * This service is completely free and doesn't require API keys
   */
  private async getFromFreeAPI(latitude: number, longitude: number): Promise<FreeWeatherData | null> {
    try {
      // wttr.in is a free weather service that returns JSON
      const response = await fetch(
        `https://wttr.in/${latitude},${longitude}?format=j1`,
        {
          headers: {
            'User-Agent': 'JournalingApp/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Free weather API error: ${response.status}`)
      }

      const data = await response.json()
      const current = data.current_condition[0]
      const area = data.nearest_area[0]

      // Map wttr.in weather codes to OpenWeatherMap-style icons
      const iconCode = this.mapWeatherCodeToIcon(current.weatherCode)

      return {
        temperature: Math.round(parseFloat(current.temp_C)),
        feelsLike: Math.round(parseFloat(current.FeelsLikeC)),
        humidity: parseInt(current.humidity),
        description: current.weatherDesc[0].value.toLowerCase(),
        icon: iconCode,
        windSpeed: Math.round(parseFloat(current.windspeedKmph) / 3.6), // Convert to m/s
        windDirection: parseInt(current.winddirDegree) || undefined,
        pressure: parseInt(current.pressure),
        visibility: parseFloat(current.visibility) || undefined,
        location: {
          city: area.areaName[0].value,
          country: area.country[0].value,
          latitude,
          longitude
        },
        source: 'free_api',
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Free weather API error:', error)
      return null
    }
  }

  /**
   * Generate mock weather data as final fallback
   */
  private getMockWeatherData(latitude: number, longitude: number): FreeWeatherData {
    // Generate semi-realistic weather based on latitude
    const isNorthern = latitude > 0
    const isTropical = Math.abs(latitude) < 23.5
    const isTemperate = Math.abs(latitude) >= 23.5 && Math.abs(latitude) < 50
    
    let baseTemp = 20 // Default moderate temperature
    
    if (isTropical) {
      baseTemp = 28 // Warmer for tropical regions
    } else if (isTemperate) {
      baseTemp = isNorthern ? 15 : 22 // Seasonal variation
    } else {
      baseTemp = 5 // Colder for polar regions
    }

    // Add some randomness
    const temp = baseTemp + (Math.random() * 10 - 5)
    
    return {
      temperature: Math.round(temp),
      feelsLike: Math.round(temp + (Math.random() * 4 - 2)),
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
      description: 'partly cloudy',
      icon: '02d', // Partly cloudy
      windSpeed: Math.round(Math.random() * 10), // 0-10 m/s
      pressure: Math.round(1000 + Math.random() * 50), // 1000-1050 hPa
      location: {
        city: 'Unknown City',
        country: 'Unknown',
        latitude,
        longitude
      },
      source: 'mock',
      timestamp: Date.now()
    }
  }

  /**
   * Map wttr.in weather codes to OpenWeatherMap-style icons
   */
  private mapWeatherCodeToIcon(code: string): string {
    const codeMap: { [key: string]: string } = {
      '113': '01d', // Clear/Sunny
      '116': '02d', // Partly cloudy
      '119': '03d', // Cloudy
      '122': '04d', // Overcast
      '143': '50d', // Mist
      '176': '10d', // Patchy rain possible
      '179': '13d', // Patchy snow possible
      '182': '13d', // Patchy sleet possible
      '185': '13d', // Patchy freezing drizzle
      '200': '11d', // Thundery outbreaks possible
      '227': '13d', // Blowing snow
      '230': '13d', // Blizzard
      '248': '50d', // Fog
      '260': '50d', // Freezing fog
      '263': '10d', // Patchy light drizzle
      '266': '10d', // Light drizzle
      '281': '13d', // Freezing drizzle
      '284': '13d', // Heavy freezing drizzle
      '293': '10d', // Patchy light rain
      '296': '10d', // Light rain
      '299': '10d', // Moderate rain at times
      '302': '10d', // Moderate rain
      '305': '10d', // Heavy rain at times
      '308': '10d', // Heavy rain
      '311': '13d', // Light freezing rain
      '314': '13d', // Moderate or heavy freezing rain
      '317': '13d', // Light sleet
      '320': '13d', // Moderate or heavy sleet
      '323': '13d', // Patchy light snow
      '326': '13d', // Light snow
      '329': '13d', // Patchy moderate snow
      '332': '13d', // Moderate snow
      '335': '13d', // Patchy heavy snow
      '338': '13d', // Heavy snow
      '350': '13d', // Ice pellets
      '353': '10d', // Light rain shower
      '356': '10d', // Moderate or heavy rain shower
      '359': '10d', // Torrential rain shower
      '362': '13d', // Light sleet showers
      '365': '13d', // Moderate or heavy sleet showers
      '368': '13d', // Light snow showers
      '371': '13d', // Moderate or heavy snow showers
      '374': '13d', // Light showers of ice pellets
      '377': '13d', // Moderate or heavy showers of ice pellets
      '386': '11d', // Patchy light rain with thunder
      '389': '11d', // Moderate or heavy rain with thunder
      '392': '11d', // Patchy light snow with thunder
      '395': '11d'  // Moderate or heavy snow with thunder
    }

    return codeMap[code] || '02d' // Default to partly cloudy
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, char => char.toUpperCase())
  }

  /**
   * Get cached weather data
   */
  getStoredWeatherData(): FreeWeatherData | null {
    try {
      const stored = localStorage.getItem('freeWeatherData')
      if (stored) {
        const weatherData = JSON.parse(stored)
        
        // Check if weather data is still fresh (10 minutes cache)
        const tenMinutes = 10 * 60 * 1000
        if (Date.now() - weatherData.timestamp < tenMinutes) {
          return weatherData
        }
      }
    } catch (error) {
      console.error('Error reading stored weather data:', error)
    }
    
    return null
  }

  /**
   * Store weather data
   */
  storeWeatherData(data: FreeWeatherData): void {
    try {
      localStorage.setItem('freeWeatherData', JSON.stringify(data))
    } catch (error) {
      console.error('Error storing weather data:', error)
    }
  }

  clearStoredWeatherData(): void {
    localStorage.removeItem('freeWeatherData')
  }
}

export const freeWeatherService = new FreeWeatherService()