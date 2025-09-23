'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LogIn, Shield, Cloud, Heart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function LoginScreen() {
  const { signInWithGoogle, loading, error } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--background)] to-[var(--surface)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="glass-surface elevated-element border border-white/20">
          <CardContent className="p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl mx-auto mb-4 flex items-center justify-center"
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Welcome to Journaling
              </h1>
              
              <p className="text-[var(--text-secondary)] text-sm">
                Your private space for thoughts, reflections, and growth
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-3 text-sm text-[var(--text-secondary)]">
                <Shield className="w-4 h-4 text-[var(--primary)]" />
                <span>Private and secure with Google authentication</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-[var(--text-secondary)]">
                <Cloud className="w-4 h-4 text-[var(--secondary)]" />
                <span>Automatic sync across all your devices</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-[var(--text-secondary)]">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>AI-powered insights and weekly summaries</span>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={signInWithGoogle}
              disabled={loading}
              variant="primary"
              className="w-full py-3 text-base font-semibold"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-red-500 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* Privacy Note */}
            <p className="text-xs text-[var(--text-secondary)] text-center mt-6 leading-relaxed">
              Your journal entries are stored securely in Firebase and are only accessible by you. 
              We never read or share your personal content.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}