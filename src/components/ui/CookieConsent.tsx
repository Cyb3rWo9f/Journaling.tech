'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Check, Shield } from 'lucide-react'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent')
    if (!hasAccepted) {
      // Small delay before showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/10 backdrop-blur-xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Icon and Text */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                      We value your privacy
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                      By clicking "Accept All", you consent to our use of cookies.{' '}
                      <a href="#" className="text-[var(--primary)] hover:underline">Learn more</a>
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={declineCookies}
                    className="flex-1 md:flex-none px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--background)] border border-[var(--border)] rounded-lg transition-all"
                  >
                    Decline
                  </button>
                  <motion.button
                    onClick={acceptCookies}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-lg shadow-lg shadow-[var(--primary)]/25 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept All
                  </motion.button>
                </div>

                {/* Close button */}
                <button
                  onClick={declineCookies}
                  className="absolute top-3 right-3 md:static p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] rounded-lg transition-all hidden md:flex"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
