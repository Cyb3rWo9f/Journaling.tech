'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Sun, CloudRain, Snowflake, Wind, Thermometer, Droplets, Eye } from 'lucide-react'

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  location: string
  icon: string
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate weather data (in a real app, you'd fetch from a weather API)
    const mockWeatherData: WeatherData = {
      temperature: 22,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      visibility: 10,
      location: 'Your Location',
      icon: 'partly-cloudy'
    }

    // Simulate API call delay
    setTimeout(() => {
      setWeather(mockWeatherData)
      setLoading(false)
    }, 1500)
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun size={32} className="text-yellow-500" />
      case 'partly cloudy':
      case 'cloudy':
        return <Cloud size={32} className="text-gray-500" />
      case 'rainy':
      case 'rain':
        return <CloudRain size={32} className="text-blue-500" />
      case 'snowy':
      case 'snow':
        return <Snowflake size={32} className="text-blue-200" />
      default:
        return <Cloud size={32} className="text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface)]/80 rounded-2xl border border-[var(--border)] shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-2xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-16 bg-[var(--primary)]/20 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-[var(--primary)]/20 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-4 w-20 bg-[var(--primary)]/20 rounded animate-pulse ml-auto"></div>
            <div className="h-3 w-16 bg-[var(--primary)]/20 rounded animate-pulse ml-auto"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-[var(--primary)]/5 rounded-xl animate-pulse">
                <div className="w-4 h-4 bg-[var(--primary)]/20 rounded mx-auto mb-2"></div>
                <div className="h-3 w-12 bg-[var(--primary)]/20 rounded mx-auto mb-1"></div>
                <div className="h-4 w-8 bg-[var(--primary)]/20 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface)]/80 rounded-2xl border border-[var(--border)] shadow-lg overflow-hidden">
        <div className="p-6 text-center">
          <div className="p-3 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl w-fit mx-auto mb-4">
            <Cloud size={24} className="text-red-500" />
          </div>
          <p className="text-[var(--text-secondary)] font-medium">Unable to load weather data</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">Please check your connection</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glossy-card bg-gradient-to-br from-[var(--surface)] to-[var(--surface)]/80 rounded-2xl border border-white/20 overflow-hidden"
      style={{ boxShadow: 'var(--shadow-xl), var(--shadow-glow)' }}
    >
      {/* Header with Weather Icon and Main Info */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="p-3 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-2xl"
          >
            {getWeatherIcon(weather.condition)}
          </motion.div>
          <div>
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-[var(--text-primary)]"
            >
              {weather.temperature}°C
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[var(--text-secondary)] font-medium"
            >
              {weather.condition}
            </motion.p>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-right"
        >
          <p className="text-sm text-[var(--text-secondary)] mb-1 flex items-center justify-end space-x-1">
            <span>📍</span>
            <span className="font-medium">{weather.location}</span>
          </p>
          <motion.p 
            className="text-xs text-[var(--text-secondary)] bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/20"
            whileHover={{ scale: 1.05 }}
          >
            Perfect for journaling ✨
          </motion.p>
        </motion.div>
      </div>

      {/* Compact Weather Details Grid */}
      <div className="p-4 bg-gradient-to-r from-[var(--surface)] to-[var(--surface)]/90">
        <div className="grid grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center p-3 glass-surface rounded-xl hover:elevated-element transition-all duration-300"
            style={{ boxShadow: 'var(--shadow-md)' }}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)' 
            }}
          >
            <Droplets size={16} className="text-[var(--secondary)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-secondary)] mb-1">Humidity</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{weather.humidity}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center p-3 glass-surface rounded-xl hover:elevated-element transition-all duration-300"
            style={{ boxShadow: 'var(--shadow-md)' }}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)' 
            }}
          >
            <Wind size={16} className="text-[var(--accent)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-secondary)] mb-1">Wind</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{weather.windSpeed} km/h</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center p-3 glass-surface rounded-xl hover:elevated-element transition-all duration-300"
            style={{ boxShadow: 'var(--shadow-md)' }}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)' 
            }}
          >
            <Eye size={16} className="text-[var(--primary)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-secondary)] mb-1">Visibility</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{weather.visibility} km</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center p-3 glass-surface rounded-xl hover:elevated-element transition-all duration-300"
            style={{ boxShadow: 'var(--shadow-md)' }}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)' 
            }}
          >
            <Thermometer size={16} className="text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-[var(--text-secondary)] mb-1">Feels like</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{weather.temperature + 2}°C</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
