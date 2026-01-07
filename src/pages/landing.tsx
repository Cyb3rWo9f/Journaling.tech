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
            <title>Journaling - AI-Powered Personal Journaling | Track Emotions & Grow</title>
            <meta name="description" content="Transform your thoughts into insights with AI-powered journaling. Track emotions, discover patterns, and grow personally with intelligent analysis. Free to use, private & secure." />
            <meta name="keywords" content="journaling, AI journal, mood tracking, personal growth, emotion tracker, daily journal, mental health, self-reflection, diary app, mindfulness" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="author" content="Journaling.tech" />
            <link rel="canonical" href="https://journaling.tech" />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://journaling.tech" />
            <meta property="og:title" content="Journaling - AI-Powered Personal Journaling" />
            <meta property="og:description" content="Transform your thoughts into insights with AI-powered journaling. Track emotions, discover patterns, and grow personally." />
            <meta property="og:image" content="https://journaling.tech/og-image.svg" />
            <meta property="og:site_name" content="Journaling" />
            <meta property="og:locale" content="en_US" />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content="https://journaling.tech" />
            <meta name="twitter:title" content="Journaling - AI-Powered Personal Journaling" />
            <meta name="twitter:description" content="Transform your thoughts into insights with AI-powered journaling." />
            <meta name="twitter:image" content="https://journaling.tech/og-image.svg" />
            
            {/* Additional SEO */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            
            {/* Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebApplication",
                  "name": "Journaling",
                  "url": "https://journaling.tech",
                  "description": "AI-powered personal journaling platform for tracking emotions and personal growth",
                  "applicationCategory": "LifestyleApplication",
                  "operatingSystem": "Web",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "featureList": [
                    "AI-powered insights",
                    "Mood tracking",
                    "Progress analytics",
                    "Private & secure",
                    "Auto-save"
                  ]
                })
              }}
            />
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
