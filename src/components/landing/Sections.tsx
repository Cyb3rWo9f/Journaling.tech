import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Brain, Heart, BarChart3, Shield, Zap, TrendingUp, Sparkles, ArrowRight, Star, Check } from 'lucide-react'

// Features data
export const featuresData = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Insights",
    description: "Get intelligent analysis of your emotional patterns and personal growth trends.",
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Mood Tracking",
    description: "Track your emotions with our comprehensive mood selector and see patterns over time.",
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Progress Analytics",
    description: "Visualize your journaling consistency and emotional well-being trends.",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Private & Secure",
    description: "Your thoughts are safe with enterprise-grade encryption and privacy protection.",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Smart Auto-Save",
    description: "Never lose your thoughts with intelligent auto-save and backup features.",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Growth Tracking",
    description: "Monitor your personal development journey with detailed progress reports.",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20"
  }
]

// Features Section Component
export function FeaturesSection() {
  return (
    <section id="features" className="pt-24 pb-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/[0.02] to-transparent" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-[var(--secondary)]/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 rounded-full border border-[var(--primary)]/30 mb-6"
          >
            <Star className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--primary)]">Powerful Features</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
            Everything You Need for
            <span className="block mt-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              Mindful Journaling
            </span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Transform your daily thoughts into meaningful insights with our comprehensive suite of journaling tools
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuresData.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-[var(--surface)] backdrop-blur-xl rounded-2xl p-6 border border-[var(--border)] shadow-lg hover:shadow-xl hover:border-[var(--primary)] transition-all duration-300 overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon */}
                <div className={`relative w-12 h-12 rounded-xl ${feature.bgColor} ${feature.borderColor} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="relative text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                  {feature.title}
                </h3>
                <p className="relative text-[var(--text-secondary)] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section Component
export function CTASection() {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/[0.03] to-[var(--primary)]/[0.08]" />
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-[var(--primary)]/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Card with gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] via-[#ff7a7a] to-[var(--secondary)] rounded-3xl blur-sm opacity-20" />
          <div className="relative bg-[var(--surface)]/95 backdrop-blur-2xl rounded-3xl p-8 md:p-14 border border-[var(--border)] shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-[var(--primary)]/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-6 left-6 w-24 h-24 bg-gradient-to-tr from-[var(--secondary)]/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-full border border-[var(--primary)]/30 mb-8"
              >
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm font-medium text-[var(--primary)]">Start Your Transformation Today</span>
              </motion.div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
                Ready to Start
                <span className="block mt-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                  Your Journaling Journey?
                </span>
              </h2>
              
              <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of writers capturing their thoughts, tracking their progress, and discovering insights they never knew existed.
              </p>
              
              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Link href="https://app.journaling.tech">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative inline-flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 text-lg rounded-2xl shadow-xl shadow-[var(--primary)]/30 cursor-pointer group min-w-64"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative flex items-center gap-2">
                      Start Journaling Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span>Always Free</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-blue-500" />
                  </div>
                  <span>No Account Required</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-purple-500" />
                  </div>
                  <span>Instant AI Insights</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
