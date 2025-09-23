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
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-3xl bg-white/95 dark:bg-[#0b0f13]/95 backdrop-blur-xl border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl ${className}`}
    >
      {/* Dynamic gradient overlay based on weather */}
  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-12 dark:opacity-22`} />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
            x: [0, -8, 0],
            y: [0, 5, 0]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 9, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 p-5">
        {/* Header with time-based greeting */}
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <motion.span 
              className="text-2xl"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              {greeting.emoji}
            </motion.span>
            <div>
              <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm font-['Space_Grotesk'] tracking-wide">
                {greeting.text}
              </span>
              <div className="flex items-center space-x-1 mt-1">
                <MapPin size={12} className="text-gray-600 dark:text-white" />
                <span className="text-gray-700 dark:text-white text-xs font-semibold drop-shadow-sm">
                  {weather.location.city || 'Current Location'}
                </span>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={refreshWeather}
            className="p-2 bg-gray-100 dark:bg-[#0b0f13] backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-600/50"
            disabled={loading}
          >
            <RefreshCw size={14} className={`text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </motion.div>

        {/* Main weather display */}
        <motion.div 
          className="flex items-center space-x-4 mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
        >
          <motion.div
            className="p-3 bg-gray-100 dark:bg-[#0b0f13] backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <WeatherIcon size={32} className="text-gray-700 dark:text-gray-300" />
          </motion.div>
          
          <div className="flex-1">
            <motion.div 
              className="text-3xl font-bold text-gray-800 dark:text-gray-200 font-['Space_Grotesk'] tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {weather.temperature}°C
            </motion.div>
            <motion.div 
              className="text-gray-600 dark:text-white text-sm capitalize font-semibold drop-shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {weather.description}
            </motion.div>
          </div>
        </motion.div>

        {/* Weather details in mobile-friendly grid */}
        <motion.div 
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Wind */}
          <motion.div 
            className="p-3 bg-gray-100/80 dark:bg-[#0b0f13]/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(147, 51, 234, 0.1)" }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Wind size={14} className="text-purple-500 dark:text-purple-400" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Wind</span>
            </div>
            <div className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
              {weather.windSpeed} km/h
            </div>
          </motion.div>

          {/* Humidity */}
          <motion.div 
            className="p-3 bg-gray-100/80 dark:bg-[#0b0f13]/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(34, 197, 94, 0.1)" }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Droplets size={14} className="text-green-500 dark:text-green-400" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Humidity</span>
            </div>
            <div className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
              {weather.humidity}%
            </div>
          </motion.div>

          {/* Feels Like */}
          <motion.div 
            className="p-3 bg-gray-100/80 dark:bg-[#0b0f13]/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Thermometer size={14} className="text-blue-500 dark:text-blue-400" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Feels Like</span>
            </div>
            <div className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
              {weather.feelsLike}°C
            </div>
          </motion.div>

          {/* Pressure */}
          <motion.div 
            className="p-3 bg-gray-100/80 dark:bg-[#0b0f13]/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 115, 22, 0.1)" }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Gauge size={14} className="text-orange-500 dark:text-orange-400" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Pressure</span>
            </div>
            <div className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
              {weather.pressure} hPa
            </div>
          </motion.div>
        </motion.div>

        {/* Last updated */}
        {lastUpdated && (
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-gray-500 dark:text-gray-500 text-xs font-medium">
              Updated: {lastUpdated}
            </span>
          </motion.div>
        )}
      </div>

      {/* Floating weather particles for extra delight */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {weather.icon.includes('10') && [...Array(8)].map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute w-0.5 h-4 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
            }}
            animate={{
              y: [0, 200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
        
        {weather.icon.includes('13') && [...Array(6)].map((_, i) => (
          <motion.div
            key={`snow-${i}`}
            className="absolute w-1 h-1 bg-white/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
            }}
            animate={{
              y: [0, 200],
              x: [0, Math.random() * 20 - 10],
              opacity: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}