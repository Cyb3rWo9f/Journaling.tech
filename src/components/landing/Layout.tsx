import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { PenTool, Sparkles, Github, Twitter, Heart } from 'lucide-react'
import { SimpleThemeToggle } from '../ui/ThemeToggle'

// Landing Navigation Component
export function LandingNav() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface)]/90 backdrop-blur-xl border-b border-[var(--border)]"
    >
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="relative w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/25"
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <PenTool size={20} className="text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles size={8} className="text-white" />
              </div>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">
                Journaling
              </h1>
              <p className="text-[10px] text-[var(--text-secondary)] -mt-0.5 tracking-wide">AI-Powered Journal</p>
            </div>
          </motion.div>

          {/* Center Nav Links */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex items-center"
          >
            <div className="flex items-center gap-1 bg-[var(--surface-elevated)]/80 backdrop-blur-sm px-2 py-1.5 rounded-full border border-[var(--border)]">
              <a href="#features" className="px-4 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-full transition-all font-medium">
                Features
              </a>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            {/* Theme Toggle */}
            <SimpleThemeToggle />
            
            <Link href="https://app.journaling.tech">
              <motion.button 
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-5 py-2 text-sm rounded-full shadow-lg shadow-[var(--primary)]/25 cursor-pointer group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <span className="relative flex items-center gap-2">
                  Get Started
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">Free</span>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  )
}

// Landing Footer Component
export function LandingFooter() {
  return (
    <footer className="relative bg-[var(--surface)] border-t border-[var(--border)] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/[0.02] to-[var(--primary)]/[0.05]" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--secondary)]/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-5 justify-center md:justify-start"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-[var(--text-primary)]">Journaling</span>
                <p className="text-xs text-[var(--text-secondary)]">AI-Powered Journal</p>
              </div>
            </motion.div>
            <p className="text-[var(--text-secondary)] mb-6 max-w-sm leading-relaxed mx-auto md:mx-0">
              Transform your thoughts into insights with AI-powered journaling. Start your personal growth journey today.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <a href="#" className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-4 sm:gap-8 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-[var(--text-primary)] mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Product</h3>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <li><a href="#features" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Features</a></li>
                <li><Link href="https://app.journaling.tech" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Get Started</Link></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-[var(--text-primary)] mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <li><a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">About</a></li>
                <li><a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Blog</a></li>
                <li><a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Contact</a></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-[var(--text-primary)] mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <li><a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Privacy</a></li>
                <li><a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Terms</a></li>
                <li><a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Cookies</a></li>
              </ul>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-[var(--border)] mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-xs md:text-sm text-[var(--text-secondary)]">
            © 2026 Journaling. All rights reserved.
          </p>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] flex items-center gap-1">
            Made with <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--primary)] fill-[var(--primary)]" /> for mindful journaling
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
