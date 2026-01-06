'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Activity,
  CloudDrizzle,
  Zap,
  Snowflake
} from 'lucide-react'
import { freeWeatherService, FreeWeatherData } from '@/services/freeWeatherService'
import { freeGoogleLocationService, FreeLocationData } from '@/services/freeGoogleLocation'

interface MobileWeatherWidgetProps {
  className?: string
}

export function MobileWeatherWidget({ className = '' }: MobileWeatherWidgetProps) {
  const [weather, setWeather] = useState<FreeWeatherData | null>(null)
  const [location, setLocation] = useState<FreeLocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    loadWeatherData()
  }, [])

  const loadWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      const locationData = await freeGoogleLocationService.getFreeLocationWithFallback()
      setLocation(locationData)

      const weatherData = await freeWeatherService.getWeatherWithFallback(
        locationData.latitude,
        locationData.longitude
      )
      setWeather(weatherData)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('Weather loading failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const refreshWeather = () => {
    loadWeatherData()
  }

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      '01d': Sun, '01n': Sun,
      '02d': Cloud, '02n': Cloud,
      '03d': Cloud, '03n': Cloud,
      '04d': Cloud, '04n': Cloud,
      '09d': CloudDrizzle, '09n': CloudDrizzle,
      '10d': CloudRain, '10n': CloudRain,
      '11d': Zap, '11n': Zap,
      '13d': Snowflake, '13n': Snowflake,
      '50d': Wind, '50n': Wind,
    }
    return iconMap[iconCode] || Cloud
  }

  const getWeatherGradient = (iconCode: string, temperature: number) => {
    if (iconCode.includes('01')) { // Clear sky
      return temperature > 25 
        ? 'from-orange-300 via-yellow-300 to-orange-400' 
        : 'from-blue-300 via-cyan-300 to-blue-400'
    }
    if (iconCode.includes('02') || iconCode.includes('03')) { // Few/scattered clouds
      return 'from-gray-300 via-blue-300 to-indigo-400'
    }
    if (iconCode.includes('04')) { // Broken clouds
      return 'from-gray-400 via-slate-400 to-blue-400'
    }
    if (iconCode.includes('09') || iconCode.includes('10')) { // Rain
      return 'from-blue-400 via-indigo-500 to-purple-600'
    }
    if (iconCode.includes('11')) { // Thunderstorm
      return 'from-gray-600 via-purple-700 to-indigo-800'
    }
    if (iconCode.includes('13')) { // Snow
      return 'from-blue-200 via-cyan-200 to-blue-300'
    }
    return 'from-blue-300 via-purple-400 to-indigo-500' // Default
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return { text: 'Late Night', emoji: '🌙', icon: Sunset }
    if (hour < 12) return { text: 'Morning', emoji: '🌅', icon: Sunrise }
    if (hour < 18) return { text: 'Afternoon', emoji: '☀️', icon: Sun }
    if (hour < 22) return { text: 'Evening', emoji: '🌆', icon: Sunset }
    return { text: 'Night', emoji: '🌙', icon: Sunset }
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl border border-red-200 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="p-2 bg-red-500/20 rounded-xl"
          >
            <AlertCircle className="text-red-500" size={20} />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-700 text-sm">Weather Unavailable</h3>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshWeather}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-lg font-medium shadow-sm"
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading || !weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="p-2 bg-blue-500/20 rounded-xl"
          >
            <RefreshCw className="text-blue-500" size={20} />
          </motion.div>
          <div className="flex-1">
            <motion.h3 
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-semibold text-blue-700 text-sm"
            >
              Loading Weather...
            </motion.h3>
            <p className="text-blue-600 text-xs mt-1">Getting your location</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const WeatherIcon = getWeatherIcon(weather.icon)
  const gradient = getWeatherGradient(weather.icon, weather.temperature)
  const greeting = getTimeBasedGreeting()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] ${className}`}
    >
      <div className="relative z-10 p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-[var(--primary)]" />
            <span className="text-[var(--text-primary)] text-xs font-semibold truncate max-w-[140px]">
              {weather.location.city || 'Location'}
            </span>
          </div>
          <button
            onClick={refreshWeather}
            className="p-1.5 hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw size={12} className={`text-[var(--primary)] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main weather display */}
        <div className="flex items-center gap-3 mb-2 p-2.5 bg-[var(--background)] rounded-lg border border-[var(--border)]">
          <WeatherIcon size={24} className="text-[var(--primary)]" />
          <div className="flex-1">
            <div className="text-xl font-bold text-[var(--text-primary)] leading-tight">
              {weather.temperature}°C
            </div>
            <div className="text-[var(--text-secondary)] text-xs capitalize leading-tight">
              {weather.description}
            </div>
          </div>
        </div>

        {/* Weather details - compact 4-column grid */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] text-center">
            <span className="text-[var(--text-muted)] text-[9px] block">Feels</span>
            <span className="text-[var(--text-primary)] font-bold text-xs">{weather.feelsLike}°</span>
          </div>
          <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] text-center">
            <span className="text-[var(--text-muted)] text-[9px] block">Humid</span>
            <span className="text-[var(--text-primary)] font-bold text-xs">{weather.humidity}%</span>
          </div>
          <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] text-center">
            <span className="text-[var(--text-muted)] text-[9px] block">Wind</span>
            <span className="text-[var(--text-primary)] font-bold text-xs">{weather.windSpeed}</span>
          </div>
          <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] text-center">
            <span className="text-[var(--text-muted)] text-[9px] block">Press</span>
            <span className="text-[var(--text-primary)] font-bold text-xs">{weather.pressure}</span>
          </div>
        </div>

      </div>
    </motion.div>
  )
}