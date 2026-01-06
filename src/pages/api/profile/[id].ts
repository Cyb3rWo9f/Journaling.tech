import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

interface PublicProfile {
  displayName: string
  avatar?: string
  bio?: string
  totalEntries: number
  currentStreak: number
  longestStreak: number
  joinedDate: string
  achievements: string[]
  isPublic: boolean
}

// Firebase config for API route (server-side)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase for API (avoid duplicate initialization)
function getFirebaseApp() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig, 'api')
  }
  return getApps().find(app => app.name === 'api') || initializeApp(firebaseConfig, 'api')
}

// This API endpoint serves public profile data
// In production, this would use Firebase Admin SDK for server-side access
// For now, we return profile data that was stored in a public collection

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Profile ID is required' })
  }

  try {
    // Initialize Firebase for server-side API access
    const app = getFirebaseApp()
    const db = getFirestore(app)
    
    // Try to get from publicProfiles collection (publicly readable)
    const publicProfileRef = doc(db, 'publicProfiles', id)
    const publicProfileSnap = await getDoc(publicProfileRef)

    if (publicProfileSnap.exists()) {
      const data = publicProfileSnap.data()
      
      const publicProfile: PublicProfile = {
        displayName: data.displayName || 'Anonymous Writer',
        avatar: data.avatar || data.photoURL,
        bio: data.bio || 'Passionate journal writer on a journey of self-discovery.',
        totalEntries: data.totalEntries || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        joinedDate: data.joinedDate || new Date().toISOString(),
        achievements: data.achievements || [],
        isPublic: true,
      }

      // Set cache headers for better performance
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
      
      return res.status(200).json(publicProfile)
    }

    return res.status(404).json({ error: 'Profile not found or is private' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' })
  }
}
