'use client'

import React, { useEffect } from 'react'
import { auth } from '@/lib/firebase'

export function FirebaseTest() {
  useEffect(() => {
    console.log('Firebase Auth object:', auth)
    console.log('Auth config:', auth.config)
    console.log('Environment variables:')
    console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET')
    console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  }, [])

  return (
    <div className="p-4 bg-red-100 border border-red-300 rounded">
      <p className="text-red-800">Check the browser console for Firebase debug info</p>
    </div>
  )
}