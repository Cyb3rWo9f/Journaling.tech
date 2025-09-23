'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, Lightbulb, Calendar, Sparkles } from 'lucide-react'
import { useJournal } from '@/context/JournalContext'
import { WeeklySummary } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getWeekRange, formatDate } from '@/utils'

export function WeeklyInsights() {
  const { summaries, generateWeeklySummary, isLoading, error } = useJournal()
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [currentSummary, setCurrentSummary] = useState<WeeklySummary | null>(null)

  useEffect(() => {
    const { start } = getWeekRange(selectedWeek)
    const weekSummary = summaries.find(s => 
      new Date(s.weekStart).getTime() === start.getTime()
    )
    setCurrentSummary(weekSummary || null)
  }, [selectedWeek, summaries])

  const handleGenerateInsights = async () => {
    await generateWeeklySummary(selectedWeek)
  }

  const getWeekNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setSelectedWeek(newDate)
  }

  const { start, end } = getWeekRange(selectedWeek)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Weekly Insights
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar size={16} />
                  <span>
                    {formatDate(start)} - {formatDate(end)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => getWeekNavigation('prev')}
                  >
                    ← Previous Week
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm" 
                    onClick={() => getWeekNavigation('next')}
                  >
                    Next Week →
                  </Button>
                </div>
              </div>
            </div>
            
            {!currentSummary && (
              <Button
                onClick={handleGenerateInsights}
                isLoading={isLoading}
                className="flex items-center space-x-2"
              >
                <Sparkles size={16} />
                <span>Generate Insights</span>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {currentSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Themes */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="text-blue-500" size={20} />
                <h3 className="font-semibold">Recurring Themes</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSummary.themes.map((theme, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300"
                  >
                    {theme}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emotional Patterns */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-green-500" size={20} />
                <h3 className="font-semibold">Emotional Patterns</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentSummary.emotionalPatterns.map((pattern, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-[#0b0f13]/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{pattern.emotion}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        pattern.trend === 'increasing' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                        pattern.trend === 'decreasing' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                        'bg-gray-100 dark:bg-[#0b0f13]/60 text-gray-700 dark:text-gray-300'
                      }`}>
                        {pattern.trend}
                      </span>
                    </div>
                    {pattern.context && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pattern.context}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="text-purple-500" size={20} />
                <h3 className="font-semibold">Achievements</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSummary.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-2 p-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lightbulb className="text-yellow-500" size={20} />
                <h3 className="font-semibold">Suggestions</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSummary.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-2 p-2"
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Motivational Insight */}
          {currentSummary.motivationalInsight && (
            <Card className="md:col-span-2">
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-6"
                >
                  <Sparkles className="mx-auto mb-4 text-blue-500" size={32} />
                  <blockquote className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
                    "{currentSummary.motivationalInsight}"
                  </blockquote>
                </motion.div>
              </CardContent>
            </Card>
          )}

          {/* Action Steps */}
          {currentSummary.actionSteps.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <h3 className="font-semibold">Action Steps for Next Week</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentSummary.actionSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No insights available for this week
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Generate AI-powered insights from your journal entries for this week
              </p>
              <Button
                onClick={handleGenerateInsights}
                isLoading={isLoading}
                className="flex items-center space-x-2"
              >
                <Sparkles size={16} />
                <span>Generate Insights</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}