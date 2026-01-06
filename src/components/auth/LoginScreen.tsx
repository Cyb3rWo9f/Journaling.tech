'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Cloud, Heart, Sparkles, PenTool, Lock, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function LoginScreen() {
  const { signInWithGoogle, loading, error } = useAuth()

  const features = [
    { icon: Shield, text: 'Secure & Private', color: 'from-blue-500 to-cyan-500' },
    { icon: Cloud, text: 'Sync Across Devices', color: 'from-purple-500 to-pink-500' },
    { icon: Sparkles, text: 'AI-Powered Insights', color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[var(--primary)]/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[var(--secondary)]/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-[var(--primary)] via-purple-500 to-[var(--secondary)] p-6 pb-10 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white/30"
            >
              <PenTool className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* Card pull-up effect */}
          <div className="bg-[var(--surface)] rounded-t-3xl -mt-6 relative">
            <div className="p-6 pt-8">
              {/* Title */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Welcome to Journaling
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your personal space for reflection and growth
                </p>
              </motion.div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-md`}>
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-[var(--text-primary)] font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Google Sign In Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-3 transition-all duration-300 hover:border-[var(--primary)]/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-gray-300 border-t-[var(--primary)] rounded-full"
                    />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </motion.button>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                </motion.div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-muted)] uppercase">Secure Login</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              {/* Security badges */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-4"
              >
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Lock className="w-3 h-3" />
                  <span>Encrypted</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Shield className="w-3 h-3" />
                  <span>Private</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Zap className="w-3 h-3" />
                  <span>Fast</span>
                </div>
              </motion.div>

              {/* Privacy Note */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-[10px] text-[var(--text-muted)] text-center mt-5 leading-relaxed"
              >
                By signing in, you agree to our privacy-first approach. Your journal entries are encrypted and only accessible by you.
              </motion.p>
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-[var(--text-muted)]">
            Made with <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> for thoughtful minds
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}