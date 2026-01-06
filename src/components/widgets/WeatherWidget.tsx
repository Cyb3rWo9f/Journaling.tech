'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  MapPin, 
  Thermometer, 
  Wind, 
  Droplets, 
  Eye,
  Gauge,
  RefreshCw,
  AlertCircle,
  Sunrise,
  Sunset,
  Compass,
  Activity
} from 'lucide-react'
import { freeWeatherService, FreeWeatherData } from '@/services/freeWeatherService'
import { freeGoogleLocationService, FreeLocationData } from '@/services/freeGoogleLocation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface WeatherWidgetProps {
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  className?: string
}

export function WeatherWidget({ size = 'md', showDetails = true, className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<FreeWeatherData | null>(null)
  const [location, setLocation] = useState<FreeLocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Load weather data on component mount
  useEffect(() => {
    loadWeatherData()
  }, [])

  const loadWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, try to get stored FREE location
      let currentLocation = freeGoogleLocationService.getStoredLocation()
      
      if (!currentLocation) {
        // If no stored location, get FREE location using Google services
        try {
          currentLocation = await freeGoogleLocationService.getFreeLocationWithFallback()
        } catch (locationError) {
          throw new Error('Unable to access location. All free location services failed.')
        }
      }

      setLocation(currentLocation)

      // Check if we have cached weather data
      const cachedWeather = freeWeatherService.getStoredWeatherData()
      if (cachedWeather) {
        setWeather(cachedWeather)
        setLastUpdated(new Date(cachedWeather.timestamp).toLocaleTimeString())
      }

      // Fetch fresh weather data using free service with fallbacks
      try {
        console.log('🌤️ Fetching weather data with fallbacks...')
        const freshWeather = await freeWeatherService.getWeatherWithFallback(
          currentLocation.latitude,
          currentLocation.longitude
        )
        
        setWeather(freshWeather)
        setLastUpdated(new Date().toLocaleTimeString())
        
        // Store the weather data
        freeWeatherService.storeWeatherData(freshWeather)
        
        console.log('✅ Weather data obtained from:', freshWeather.source)
      } catch (weatherError) {
        console.error('Weather fetch error:', weatherError)
        throw new Error('Unable to fetch weather data from any source')
      }

    } catch (err: any) {
      console.error('Weather loading error:', err)
      setError(err.message || 'Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const refreshWeather = () => {
    loadWeatherData()
  }

  const getWeatherIcon = (iconCode: string) => {
    // Map weather icons to Lucide icons
    const iconMap: { [key: string]: any } = {
      '01d': Sun, '01n': Sun,
      '02d': Cloud, '02n': Cloud,
      '03d': Cloud, '03n': Cloud,
      '04d': Cloud, '04n': Cloud,
      '09d': CloudRain, '09n': CloudRain,
      '10d': CloudRain, '10n': CloudRain,
      '11d': CloudRain, '11n': CloudRain,
      '13d': CloudSnow, '13n': CloudSnow,
      '50d': Cloud, '50n': Cloud,
    }
    
    const IconComponent = iconMap[iconCode] || Cloud
    return IconComponent
  }

  const getWindDirection = (degrees: number): string => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ]
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  const getAirQualityIndex = (humidity: number, pressure: number): string => {
    // Simple estimation based on humidity and pressure
    if (humidity > 70 || pressure < 1000) return 'Moderate'
    if (humidity < 30 && pressure > 1020) return 'Excellent'
    return 'Good'
  }

  const getPressureStatus = (pressure: number): string => {
    if (pressure > 1020) return 'High'
    if (pressure < 1000) return 'Low'
    return 'Normal'
  }

  const getComfortLevel = (temperature: number, humidity: number): string => {
    if (temperature >= 20 && temperature <= 26 && humidity >= 40 && humidity <= 60) {
      return 'Optimal'
    }
    if (temperature >= 18 && temperature <= 28 && humidity >= 30 && humidity <= 70) {
      return 'Comfortable'
    }
    if (temperature < 10 || temperature > 35) {
      return 'Uncomfortable'
    }
    return 'Fair'
  }

  const getWeatherAdvice = (temperature: number, humidity: number, windSpeed: number, description: string): string => {
    if (temperature < 5) {
      return 'Very cold weather. Dress warmly and limit outdoor exposure.'
    }
    if (temperature > 30) {
      return 'Hot weather. Stay hydrated and seek shade when outdoors.'
    }
    if (windSpeed > 10) {
      return 'Strong winds. Be cautious when walking or driving.'
    }
    if (humidity > 80) {
      return 'High humidity. You may feel warmer than the actual temperature.'
    }
    if (description.includes('rain') || description.includes('shower')) {
      return 'Rainy conditions. Carry an umbrella and drive carefully.'
    }
    if (description.includes('snow')) {
      return 'Snowy conditions. Dress warmly and be careful on slippery surfaces.'
    }
    return 'Pleasant weather conditions. Great day to be outdoors!'
  }

  const getWindDescription = (windSpeed: number): string => {
    if (windSpeed < 1) return 'calm conditions'
    if (windSpeed < 3) return 'light air'
    if (windSpeed < 6) return 'light breeze'
    if (windSpeed < 12) return 'moderate wind'
    if (windSpeed < 20) return 'fresh breeze'
    return 'strong wind'
  }

  const sizeClasses = {
    sm: 'p-2.5',
    md: 'p-3',
    lg: 'p-4'
  }

  const textSizes = {
    sm: { temp: 'text-base', title: 'text-xs', details: 'text-[10px]' },
    md: { temp: 'text-xl', title: 'text-sm', details: 'text-xs' },
    lg: { temp: 'text-2xl', title: 'text-base', details: 'text-sm' }
  }

  if (error) {
    return (
      <Card className={`${className} bg-gradient-to-br from-red-50 to-red-100 border-red-200`}>
        <CardContent className={sizeClasses[size]}>
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={size === 'sm' ? 16 : 20} />
            <div>
              <p className={`${textSizes[size].title} font-medium text-red-700`}>Weather Unavailable</p>
              <p className={`${textSizes[size].details} text-red-600`}>{error}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={refreshWeather}
                className="mt-2 text-red-700 border-red-300 hover:bg-red-200"
              >
                <RefreshCw size={12} className="mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading || !weather) {
    return (
      <Card className={className}>
        <CardContent className={sizeClasses[size]}>
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <RefreshCw size={size === 'sm' ? 16 : 20} className="text-[var(--text-secondary)]" />
            </div>
            <div>
              <p className={`${textSizes[size].title} font-medium text-[var(--text-primary)]`}>Loading Weather...</p>
              <p className={`${textSizes[size].details} text-[var(--text-secondary)]`}>Getting your location</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const WeatherIcon = getWeatherIcon(weather.icon)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card variant="modern" className="glossy-card border border-[var(--border)] overflow-hidden">
        <CardContent className={`${sizeClasses[size]} flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-[var(--primary)]" />
              <span className={`${textSizes[size].details} font-medium text-[var(--text-primary)] truncate max-w-[120px] font-en`}>
                {weather.location.city || 'Location'}
              </span>
            </div>
            <button
              onClick={refreshWeather}
              className="p-1.5 hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw size={10} className={`text-[var(--primary)] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Main Weather Display */}
          <div className="flex items-center gap-3 mb-2.5 p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <WeatherIcon size={size === 'sm' ? 24 : size === 'md' ? 28 : 32} className="text-[var(--primary)]" />
            <div>
              <div className={`${textSizes[size].temp} font-bold text-[var(--text-primary)] leading-tight font-en`}>
                {weather.temperature}°C
              </div>
              <div className={`${textSizes[size].details} text-[var(--text-secondary)] capitalize leading-tight font-en`}>
                {weather.description}
              </div>
            </div>
          </div>

          {/* Weather Details */}
          {showDetails && (
            <div className="space-y-2">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-2 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                  <span className={`${textSizes[size].details} text-[var(--text-muted)] block`}>Feels</span>
                  <span className={`${textSizes[size].title} font-bold text-[var(--text-primary)] font-en`}>{weather.feelsLike}°C</span>
                </div>
                <div className="p-2 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                  <span className={`${textSizes[size].details} text-[var(--text-muted)] block`}>Humidity</span>
                  <span className={`${textSizes[size].title} font-bold text-[var(--text-primary)] font-en`}>{weather.humidity}%</span>
                </div>
              </div>

              {/* Wind & Pressure */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-2 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                  <span className={`${textSizes[size].details} text-[var(--text-muted)] block`}>Wind</span>
                  <span className={`${textSizes[size].title} font-bold text-[var(--text-primary)] font-en`}>{weather.windSpeed} m/s</span>
                </div>
                <div className="p-2 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                  <span className={`${textSizes[size].details} text-[var(--text-muted)] block`}>Pressure</span>
                  <span className={`${textSizes[size].title} font-bold text-[var(--text-primary)] font-en`}>{weather.pressure}</span>
                </div>
              </div>

              {/* Additional Weather Information - Hidden for sm size */}
              {size !== 'sm' && (
                <div className="p-2 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[var(--text-secondary)]">
                    {weather.visibility !== undefined && weather.visibility > 0 && (
                      <div className="flex items-center justify-between">
                        <span className={`${textSizes[size].details}`}>Visibility</span>
                        <span className={`${textSizes[size].details} font-semibold text-[var(--text-primary)]`}>{weather.visibility}km</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`${textSizes[size].details}`}>Air</span>
                      <span className={`${textSizes[size].details} font-semibold text-[var(--secondary)]`}>{getAirQualityIndex(weather.humidity, weather.pressure)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <div className="mt-2 pt-1.5 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-muted)] font-en">
                Updated: {lastUpdated}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}