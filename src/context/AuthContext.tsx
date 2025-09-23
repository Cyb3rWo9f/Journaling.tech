'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { firebaseJournalService } from '@/services/firebase'
import { freeGoogleLocationService } from '@/services/freeGoogleLocation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  error: string | null
  locationPermissionRequested: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      
      // Set user ID in Firebase service
      if (user) {
        firebaseJournalService.setUserId(user.uid)
      }
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)
      
      console.log('Attempting Google sign-in...')
      console.log('Auth object:', auth)
      console.log('Auth app:', auth.app)
      console.log('Auth config:', auth.config)
      console.log('Google provider:', googleProvider)
      
      // Check if Firebase is properly initialized
      if (!auth.app) {
        throw new Error('Firebase app not initialized')
      }
      
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Set user ID in Firebase service
      firebaseJournalService.setUserId(user.uid)
      
      console.log('Successfully signed in:', user.displayName)
      
      // Get access token for Google APIs
      try {
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const accessToken = credential?.accessToken
        
        if (accessToken) {
          console.log('🔑 Google access token obtained')
          freeGoogleLocationService.setAccessToken(accessToken)
          
          // Try to get location from Google account (FREE)
          setLocationPermissionRequested(true)
          console.log('🔍 Getting location from Google account (FREE)...')
          
          try {
            const location = await freeGoogleLocationService.getFreeLocationWithFallback()
            console.log('📍 FREE location obtained from Google:', location)
          } catch (locationError) {
            console.warn('Google location access failed:', locationError)
            // Don't fail login if location fails
          }
        } else {
          console.warn('No access token received from Google')
        }
      } catch (tokenError) {
        console.warn('Failed to get Google access token:', tokenError)
      }
      
    } catch (error: any) {
      console.error('Detailed error information:')
      console.error('Error object:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      let userFriendlyMessage = 'Failed to sign in with Google'
      
      if (error.code === 'auth/configuration-not-found') {
        userFriendlyMessage = 'Firebase authentication is not properly configured. Please check the setup.'
      } else if (error.code === 'auth/popup-blocked') {
        userFriendlyMessage = 'Pop-up was blocked. Please allow pop-ups for this site.'
      } else if (error.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = 'Sign-in was cancelled.'
      }
      
      setError(userFriendlyMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
      console.log('Successfully signed out')
    } catch (error: any) {
      console.error('Error signing out:', error)
      setError(error.message || 'Failed to sign out')
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    logout,
    error,
    locationPermissionRequested
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}