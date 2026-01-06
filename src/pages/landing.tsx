import React from 'react'
import Head from 'next/head'
import { ThemeProvider } from '../context/ThemeContext'
import { 
  LandingNav, 
  LandingFooter, 
  BrowserMockup, 
  HeroCTA, 
  FeaturesSection, 
  CTASection 
} from '../components/landing'
import { CookieConsent } from '../components/ui/CookieConsent'

function LandingPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] relative overflow-hidden flex flex-col">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/[0.03] via-transparent to-[var(--secondary)]/[0.03]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[var(--primary)]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--secondary)]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[var(--primary)]/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Head>
            <title>Journling - AI-Powered Personal Journaling</title>
            <meta name="description" content="Transform your thoughts into insights with AI-powered journaling. Track emotions, discover patterns, and grow personally with intelligent analysis." />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            <meta property="og:title" content="Journling - AI-Powered Personal Journaling" />
            <meta property="og:description" content="Transform your thoughts into insights with AI-powered journaling" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
          </Head>

          {/* Navigation */}
          <LandingNav />

          {/* Main Content */}
          <main className="flex-1 pt-20">
            {/* Hero Section with Browser Mockup */}
            <section id="demo" className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-5xl">
              <div className="w-full max-w-4xl mx-auto">
                {/* Browser mockup - hidden on mobile */}
                <div className="hidden md:block">
                  <BrowserMockup />
                </div>
                <HeroCTA />
              </div>
            </section>

            {/* Features Section */}
            <FeaturesSection />

            {/* CTA Section */}
            <CTASection />
          </main>

          {/* Footer */}
          <LandingFooter />
          
          {/* Cookie Consent Banner */}
          <CookieConsent />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default LandingPage
