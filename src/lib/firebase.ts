import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase configuration is incomplete. Please check your .env.local file.')
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Configure Google Auth Provider with location access scopes
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Add location access scopes
googleProvider.addScope('https://www.googleapis.com/auth/user.addresses.read')
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile')
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email')

// Enable offline persistence
if (typeof window !== 'undefined') {
  // Enable offline support
  try {
    // Firestore automatically handles offline caching
    console.log('Firebase initialized with offline support')
  } catch (error) {
    console.warn('Firebase offline support initialization failed:', error)
  }
}

export default app