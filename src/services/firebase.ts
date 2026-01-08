/**
 * Firebase Journal Service
 * 
 * DATABASE STRUCTURE:
 * ===================
 * 
 * /users/{userId}/
 *   └── profile/data          - User's private profile settings
 *   └── entries/{entryId}     - Journal entries
 *   └── summaries/{summaryId} - Weekly summaries
 *   └── entrySummaries/{id}   - AI insights for individual entries
 *   └── entryHoldStatus/{id}  - Failed AI generation tracking
 * 
 * /publicProfiles/{userId}    - Public profile data for sharing (anyone can read)
 * 
 * /usernames/{username}       - Username to userId mapping (anyone can read)
 *   └── userId: string
 *   └── createdAt: Timestamp
 * 
 * SECURITY RULES:
 * ===============
 * - /users/{userId}/**        - Only authenticated owner can read/write
 * - /publicProfiles/{userId}  - Anyone can read, only owner can write
 * - /usernames/{username}     - Anyone can read, authenticated users can create,
 *                               only owner can update/delete
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  writeBatch,
} from 'firebase/firestore'
import { updateProfile, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { db } from '@/lib/firebase'
import { JournalEntry, WeeklySummary, EntrySummary, UserProfile, EntryHoldStatus } from '@/types'

// Re-export db for use in pages
export { db }

/**
 * Helper function to filter out undefined values from an object
 * Firestore doesn't accept undefined values
 */
function filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value
    }
  }
  return result as Partial<T>
}

/**
 * Helper function to safely convert Firestore Timestamp to ISO string
 */
function timestampToISO(timestamp: any, fallback?: string): string {
  if (!timestamp) return fallback || new Date().toISOString()
  if (typeof timestamp === 'string') return timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString()
  }
  return fallback || new Date().toISOString()
}

export class FirebaseJournalService {
  private userId: string | null = null

  /**
   * Set the current authenticated user ID
   * Must be called after authentication
   */
  setUserId(userId: string) {
    this.userId = userId
    console.log('🔐 Firebase service initialized for user:', userId)
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this.userId
  }

  /**
   * Get a reference to a user's subcollection
   */
  private getUserCollection(collectionName: string) {
    if (!this.userId) {
      throw new Error('User not authenticated - call setUserId first')
    }
    return collection(db, 'users', this.userId, collectionName)
  }

  /**
   * Get a reference to a document in a user's subcollection
   */
  private getUserDoc(collectionName: string, docId: string) {
    if (!this.userId) {
      throw new Error('User not authenticated - call setUserId first')
    }
    return doc(db, 'users', this.userId, collectionName, docId)
  }

  // ============================================================
  // JOURNAL ENTRIES
  // Path: /users/{userId}/entries/{entryId}
  // ============================================================

  /**
   * Sync all public profile stats (entries, streaks) 
   * This is called automatically after creating or deleting entries
   */
  async syncPublicProfileStats(): Promise<void> {
    if (!this.userId) return
    
    try {
      // Get all entries to calculate stats
      const entriesCollection = this.getUserCollection('entries')
      const entriesSnapshot = await getDocs(entriesCollection)
      const totalEntries = entriesSnapshot.size
      
      // Calculate streaks from entries
      const entries = entriesSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        }
      })
      
      // Sort by date descending
      entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      let currentStreak = 0
      let longestStreak = 0
      
      if (entries.length > 0) {
        // Get unique dates
        const uniqueDates = [...new Set(entries.map(e => {
          const d = new Date(e.createdAt)
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        }))]
        
        // Calculate current streak
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        
        const mostRecentEntry = entries[0].createdAt
        const mostRecentDate = new Date(mostRecentEntry)
        mostRecentDate.setHours(0, 0, 0, 0)
        
        // Check if most recent entry is today or yesterday
        if (mostRecentDate.getTime() === today.getTime() || mostRecentDate.getTime() === yesterday.getTime()) {
          currentStreak = 1
          let checkDate = new Date(mostRecentDate)
          checkDate.setDate(checkDate.getDate() - 1)
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const entryDate = entries.find(e => {
              const d = new Date(e.createdAt)
              d.setHours(0, 0, 0, 0)
              return d.getTime() === checkDate.getTime()
            })
            if (entryDate) {
              currentStreak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
        }
        
        // Calculate longest streak
        let tempStreak = 1
        const sortedDates = entries
          .map(e => {
            const d = new Date(e.createdAt)
            d.setHours(0, 0, 0, 0)
            return d.getTime()
          })
          .filter((date, index, self) => self.indexOf(date) === index)
          .sort((a, b) => a - b)
        
        for (let i = 1; i < sortedDates.length; i++) {
          const diff = sortedDates[i] - sortedDates[i - 1]
          if (diff === 86400000) { // 1 day in ms
            tempStreak++
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak)
      }
      
      // Update the public profile with all stats
      const publicProfileDoc = doc(db, 'publicProfiles', this.userId)
      await setDoc(publicProfileDoc, {
        totalEntries,
        currentStreak,
        longestStreak,
        updatedAt: Timestamp.now(),
      }, { merge: true })
      
      console.log(`📊 Public profile synced: ${totalEntries} entries, ${currentStreak} current streak, ${longestStreak} longest streak`)
    } catch (error) {
      console.error('Error syncing public profile stats:', error)
    }
  }

  // Keep old function name for backward compatibility
  async syncEntryCountToPublicProfile(): Promise<void> {
    return this.syncPublicProfileStats()
  }

  async createEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    try {
      const entriesCollection = this.getUserCollection('entries')
      
      // Filter out undefined values
      const cleanEntry = filterUndefined(entry)
      
      const entryData = {
        ...cleanEntry,
        createdAt: Timestamp.fromDate(new Date(entry.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(entry.updatedAt)),
      }
      
      console.log('📤 Creating journal entry...')
      const docRef = await addDoc(entriesCollection, entryData)
      
      // Sync entry count to public profile
      await this.syncEntryCountToPublicProfile()
      
      return {
        ...entry,
        id: docRef.id,
      }
    } catch (error) {
      console.error('Error creating entry:', error)
      throw new Error('Failed to create journal entry')
    }
  }

  async updateEntry(entry: JournalEntry): Promise<void> {
    try {
      const entryDoc = this.getUserDoc('entries', entry.id)
      
      // Filter out undefined values
      const cleanEntry = filterUndefined(entry)
      
      const entryData = {
        ...cleanEntry,
        updatedAt: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.fromDate(new Date(entry.createdAt)),
      }
      
      await updateDoc(entryDoc, entryData)
    } catch (error) {
      console.error('Error updating entry:', error)
      throw new Error('Failed to update journal entry')
    }
  }

  async deleteEntry(entryId: string): Promise<void> {
    try {
      console.log('🗑️ Firebase: Deleting entry:', entryId)
      const entryDoc = this.getUserDoc('entries', entryId)
      await deleteDoc(entryDoc)
      console.log('✅ Firebase: Entry deleted successfully')
      
      // Sync entry count to public profile
      await this.syncEntryCountToPublicProfile()
    } catch (error) {
      console.error('❌ Firebase: Error deleting entry:', error)
      throw new Error('Failed to delete journal entry')
    }
  }

  async getEntries(): Promise<JournalEntry[]> {
    try {
      const entriesCollection = this.getUserCollection('entries')
      const q = query(entriesCollection, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToISO(data.createdAt),
          updatedAt: timestampToISO(data.updatedAt),
        } as JournalEntry
      })
    } catch (error) {
      console.error('Error getting entries:', error)
      throw new Error('Failed to load journal entries')
    }
  }

  async getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    try {
      const entriesCollection = this.getUserCollection('entries')
      const q = query(
        entriesCollection,
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToISO(data.createdAt),
          updatedAt: timestampToISO(data.updatedAt),
        } as JournalEntry
      })
    } catch (error) {
      console.error('Error getting entries by date range:', error)
      throw new Error('Failed to load journal entries for date range')
    }
  }

  /**
   * Subscribe to real-time updates on entries
   */
  subscribeToEntries(callback: (entries: JournalEntry[]) => void): () => void {
    try {
      const entriesCollection = this.getUserCollection('entries')
      const q = query(entriesCollection, orderBy('createdAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: timestampToISO(data.createdAt),
            updatedAt: timestampToISO(data.updatedAt),
          } as JournalEntry
        })
        
        callback(entries)
      }, (error) => {
        console.error('Error in entries subscription:', error)
      })
      
      return unsubscribe
    } catch (error) {
      console.error('Error setting up entries subscription:', error)
      return () => {}
    }
  }

  // ============================================================
  // ENTRY SUMMARIES (AI Insights for individual entries)
  // Path: /users/{userId}/entrySummaries/{summaryId}
  // ============================================================

  async createEntrySummary(summary: Omit<EntrySummary, 'id'>): Promise<EntrySummary> {
    try {
      const summariesCollection = this.getUserCollection('entrySummaries')
      const summaryData = {
        ...filterUndefined(summary),
        createdAt: Timestamp.fromDate(new Date(summary.createdAt)),
      }
      
      const docRef = await addDoc(summariesCollection, summaryData)
      
      return {
        ...summary,
        id: docRef.id,
      }
    } catch (error) {
      console.error('Error creating entry summary:', error)
      throw new Error('Failed to create entry summary')
    }
  }

  async getEntrySummaries(): Promise<EntrySummary[]> {
    try {
      const summariesCollection = this.getUserCollection('entrySummaries')
      const q = query(summariesCollection, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToISO(data.createdAt),
        } as EntrySummary
      })
    } catch (error) {
      console.error('Error getting entry summaries:', error)
      throw new Error('Failed to load entry summaries')
    }
  }

  async deleteEntrySummary(entryId: string): Promise<void> {
    try {
      const summariesCollection = this.getUserCollection('entrySummaries')
      const q = query(summariesCollection, where('entryId', '==', entryId))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      console.log(`Deleted ${querySnapshot.docs.length} summary(ies) for entry ${entryId}`)
    } catch (error) {
      console.error('Error deleting entry summary:', error)
      throw new Error('Failed to delete entry summary')
    }
  }

  // ============================================================
  // ENTRY HOLD STATUS (Failed AI generation tracking)
  // Path: /users/{userId}/entryHoldStatus/{statusId}
  // ============================================================

  async createOrUpdateHoldStatus(holdStatus: EntryHoldStatus): Promise<void> {
    try {
      const holdCollection = this.getUserCollection('entryHoldStatus')
      const q = query(holdCollection, where('entryId', '==', holdStatus.entryId))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        await addDoc(holdCollection, {
          ...filterUndefined(holdStatus),
          createdAt: Timestamp.fromDate(new Date(holdStatus.createdAt)),
          lastAttempt: Timestamp.fromDate(new Date(holdStatus.lastAttempt)),
        })
      } else {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, filterUndefined({
          reason: holdStatus.reason,
          errorMessage: holdStatus.errorMessage,
          errorCode: holdStatus.errorCode,
          retryCount: holdStatus.retryCount,
          lastAttempt: Timestamp.fromDate(new Date(holdStatus.lastAttempt)),
        }))
      }
    } catch (error) {
      console.error('Error creating/updating hold status:', error)
      throw error
    }
  }

  async getHoldStatuses(): Promise<EntryHoldStatus[]> {
    try {
      const holdCollection = this.getUserCollection('entryHoldStatus')
      const q = query(holdCollection, orderBy('lastAttempt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          entryId: data.entryId,
          reason: data.reason,
          errorMessage: data.errorMessage,
          errorCode: data.errorCode,
          retryCount: data.retryCount,
          lastAttempt: timestampToISO(data.lastAttempt),
          createdAt: timestampToISO(data.createdAt),
        } as EntryHoldStatus
      })
    } catch (error) {
      console.error('Error getting hold statuses:', error)
      return []
    }
  }

  async removeHoldStatus(entryId: string): Promise<void> {
    try {
      const holdCollection = this.getUserCollection('entryHoldStatus')
      const q = query(holdCollection, where('entryId', '==', entryId))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      console.log(`Removed hold status for entry ${entryId}`)
    } catch (error) {
      console.error('Error removing hold status:', error)
      throw error
    }
  }

  // ============================================================
  // WEEKLY SUMMARIES
  // Path: /users/{userId}/summaries/{summaryId}
  // ============================================================

  async createSummary(summary: Omit<WeeklySummary, 'id'>): Promise<WeeklySummary> {
    try {
      const summariesCollection = this.getUserCollection('summaries')
      const summaryData = {
        ...filterUndefined(summary),
        createdAt: Timestamp.fromDate(new Date(summary.createdAt)),
      }
      
      const docRef = await addDoc(summariesCollection, summaryData)
      
      return {
        ...summary,
        id: docRef.id,
      }
    } catch (error) {
      console.error('Error creating summary:', error)
      throw new Error('Failed to create weekly summary')
    }
  }

  async getSummaries(): Promise<WeeklySummary[]> {
    try {
      const summariesCollection = this.getUserCollection('summaries')
      const q = query(summariesCollection, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToISO(data.createdAt),
        } as WeeklySummary
      })
    } catch (error) {
      console.error('Error getting summaries:', error)
      throw new Error('Failed to load weekly summaries')
    }
  }

  // ============================================================
  // USER PROFILE (Private)
  // Path: /users/{userId}/profile/data
  // ============================================================

  /**
   * Create or update the user's private profile
   * Also syncs relevant data to publicProfiles for sharing
   */
  async createOrUpdateProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      if (!this.userId) throw new Error('User not authenticated')
      
      // Filter out undefined values - Firestore doesn't accept undefined
      const filteredProfile = filterUndefined(profile)
      
      // === UPDATE PRIVATE PROFILE ===
      const profileDoc = doc(db, 'users', this.userId, 'profile', 'data')
      
      // Get existing profile to merge data
      const existingProfileSnap = await getDoc(profileDoc)
      const existingProfile = existingProfileSnap.exists() ? existingProfileSnap.data() : {}
      
      const privateProfileData: Record<string, any> = {
        ...existingProfile,
        ...filteredProfile,
        userId: this.userId,
        updatedAt: Timestamp.now(),
      }
      
      // Only set createdAt if it doesn't exist
      if (!existingProfile.createdAt) {
        privateProfileData.createdAt = Timestamp.now()
      }
      
      await setDoc(profileDoc, privateProfileData)
      console.log('✅ Private profile updated')

      // === UPDATE PUBLIC PROFILE ===
      // This collection has public read access for sharing
      const publicProfileDoc = doc(db, 'publicProfiles', this.userId)
      
      // Get existing public profile to preserve data
      const existingPublicSnap = await getDoc(publicProfileDoc)
      const existingPublicData = existingPublicSnap.exists() ? existingPublicSnap.data() : {}
      
      // Build public profile with merged data
      const publicProfileData: Record<string, any> = {
        ...existingPublicData,
        updatedAt: Timestamp.now(),
      }
      
      // Sync specific fields to public profile
      if (filteredProfile.displayName) publicProfileData.displayName = filteredProfile.displayName
      if (filteredProfile.username) publicProfileData.username = filteredProfile.username
      if (filteredProfile.avatar) publicProfileData.avatar = filteredProfile.avatar
      if (filteredProfile.bio) publicProfileData.bio = filteredProfile.bio
      if (filteredProfile.totalEntries !== undefined) publicProfileData.totalEntries = filteredProfile.totalEntries
      if (filteredProfile.currentStreak !== undefined) publicProfileData.currentStreak = filteredProfile.currentStreak
      if (filteredProfile.longestStreak !== undefined) publicProfileData.longestStreak = filteredProfile.longestStreak
      if (filteredProfile.joinedDate) publicProfileData.joinedDate = filteredProfile.joinedDate
      if (filteredProfile.achievements !== undefined) publicProfileData.achievements = filteredProfile.achievements
      
      // Set defaults for required fields if not present
      if (!publicProfileData.displayName) publicProfileData.displayName = 'Anonymous Writer'
      if (!publicProfileData.joinedDate) publicProfileData.joinedDate = new Date().toISOString()
      if (publicProfileData.totalEntries === undefined) publicProfileData.totalEntries = 0
      if (publicProfileData.currentStreak === undefined) publicProfileData.currentStreak = 0
      if (publicProfileData.longestStreak === undefined) publicProfileData.longestStreak = 0
      if (publicProfileData.achievements === undefined) publicProfileData.achievements = []
      
      await setDoc(publicProfileDoc, publicProfileData)
      console.log('✅ Public profile updated')
      
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  /**
   * Get the current user's profile from private storage
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      if (!this.userId) throw new Error('User not authenticated')
      
      const profileDoc = doc(db, 'users', this.userId, 'profile', 'data')
      const docSnap = await getDoc(profileDoc)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: this.userId,
          userId: this.userId,
          username: data.username || undefined,
          displayName: data.displayName || 'Anonymous Writer',
          bio: data.bio || undefined,
          location: data.location || undefined,
          avatar: data.avatar || undefined,
          language: data.language || 'en',
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          totalEntries: data.totalEntries || 0,
          joinedDate: data.joinedDate || timestampToISO(data.createdAt),
          lastEntryDate: data.lastEntryDate || undefined,
          achievements: data.achievements || [],
          updatedAt: timestampToISO(data.updatedAt),
        } as UserProfile
      }
      
      return null
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  /**
   * Sync profile with public profile - call this when loading settings
   * Ensures both private and public profiles are in sync
   */
  async syncProfileFromPublic(): Promise<UserProfile | null> {
    try {
      if (!this.userId) throw new Error('User not authenticated')
      
      // Get public profile data
      const publicProfileDoc = doc(db, 'publicProfiles', this.userId)
      const publicSnap = await getDoc(publicProfileDoc)
      const publicData = publicSnap.exists() ? publicSnap.data() : {}
      
      // Get private profile data
      const privateProfileDoc = doc(db, 'users', this.userId, 'profile', 'data')
      const privateSnap = await getDoc(privateProfileDoc)
      const privateData = privateSnap.exists() ? privateSnap.data() : {}
      
      // Merge data, preferring public profile for shared fields (it's the source of truth for public data)
      const mergedProfile: Partial<UserProfile> = {
        displayName: publicData.displayName || privateData.displayName || 'Anonymous Writer',
        username: publicData.username || privateData.username,
        avatar: publicData.avatar || privateData.avatar,
        bio: publicData.bio || privateData.bio,
        location: privateData.location, // Keep location private
        language: privateData.language || 'en',
        totalEntries: publicData.totalEntries ?? privateData.totalEntries ?? 0,
        currentStreak: publicData.currentStreak ?? privateData.currentStreak ?? 0,
        longestStreak: publicData.longestStreak ?? privateData.longestStreak ?? 0,
        joinedDate: publicData.joinedDate || privateData.joinedDate || new Date().toISOString(),
        lastEntryDate: privateData.lastEntryDate,
        achievements: publicData.achievements || privateData.achievements || [],
      }
      
      // Update both profiles with merged data
      await this.createOrUpdateProfile(mergedProfile)
      
      // Return the merged profile
      return await this.getProfile()
    } catch (error) {
      console.error('Error syncing profile:', error)
      throw error
    }
  }

  // ============================================================
  // USERNAME MANAGEMENT
  // Path: /usernames/{username}
  // ============================================================

  /**
   * Check if a username is available
   * @param username - The username to check (will be normalized)
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const normalizedUsername = username.toLowerCase().trim()
      
      // Validate format
      if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
        return false
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        return false
      }
      
      // Check reserved usernames
      const reserved = ['admin', 'support', 'help', 'journaling', 'journal', 'app', 'api', 'www', 'mail', 'email', 'root', 'system']
      if (reserved.includes(normalizedUsername)) {
        return false
      }
      
      // Check if username exists in database
      const usernameDoc = doc(db, 'usernames', normalizedUsername)
      const docSnap = await getDoc(usernameDoc)
      
      // If it exists, check if it belongs to current user
      if (docSnap.exists()) {
        const data = docSnap.data()
        return data.userId === this.userId // Available if it's our own username
      }
      
      return true
    } catch (error) {
      console.error('Error checking username availability:', error)
      return false
    }
  }

  /**
   * Claim a username for the current user
   * @param username - The username to claim (will be normalized)
   */
  async claimUsername(username: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.userId) throw new Error('User not authenticated')
      
      const normalizedUsername = username.toLowerCase().trim()
      const displayUsername = username.trim() // Keep original casing for display
      
      // Validate username
      if (normalizedUsername.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' }
      }
      
      if (normalizedUsername.length > 20) {
        return { success: false, error: 'Username must be 20 characters or less' }
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        return { success: false, error: 'Username can only contain letters, numbers, and underscores' }
      }
      
      // Check reserved usernames
      const reserved = ['admin', 'support', 'help', 'journaling', 'journal', 'app', 'api', 'www', 'mail', 'email', 'root', 'system']
      if (reserved.includes(normalizedUsername)) {
        return { success: false, error: 'This username is reserved' }
      }
      
      // Check if username is available
      const isAvailable = await this.isUsernameAvailable(normalizedUsername)
      if (!isAvailable) {
        return { success: false, error: 'Username is already taken' }
      }
      
      // Use a batch write for atomicity
      const batch = writeBatch(db)
      
      // Get current user's username (if any) to release it
      const privateProfileDoc = doc(db, 'users', this.userId, 'profile', 'data')
      const privateProfileSnap = await getDoc(privateProfileDoc)
      const currentUsernameData = privateProfileSnap.exists() ? privateProfileSnap.data() : null
      const currentNormalizedUsername = currentUsernameData?.username?.toLowerCase()
      
      // Release old username if exists and is different
      if (currentNormalizedUsername && currentNormalizedUsername !== normalizedUsername) {
        const oldUsernameDoc = doc(db, 'usernames', currentNormalizedUsername)
        batch.delete(oldUsernameDoc)
      }
      
      // Claim new username - store displayUsername for display purposes
      const newUsernameDoc = doc(db, 'usernames', normalizedUsername)
      batch.set(newUsernameDoc, {
        userId: this.userId,
        displayUsername: displayUsername, // Store with original casing
        createdAt: Timestamp.now()
      })
      
      // Update private profile with display username
      const existingPrivateData = privateProfileSnap.exists() ? privateProfileSnap.data() : {}
      batch.set(privateProfileDoc, {
        ...existingPrivateData,
        username: displayUsername, // Store display version
        updatedAt: Timestamp.now(),
        createdAt: existingPrivateData.createdAt || Timestamp.now(),
      })
      
      // Update public profile with display username
      const publicProfileDoc = doc(db, 'publicProfiles', this.userId)
      const existingPublicSnap = await getDoc(publicProfileDoc)
      const existingPublicData = existingPublicSnap.exists() ? existingPublicSnap.data() : {}
      batch.set(publicProfileDoc, {
        ...existingPublicData,
        username: displayUsername, // Store display version
        displayName: existingPublicData.displayName || 'Anonymous Writer',
        totalEntries: existingPublicData.totalEntries ?? 0,
        currentStreak: existingPublicData.currentStreak ?? 0,
        longestStreak: existingPublicData.longestStreak ?? 0,
        joinedDate: existingPublicData.joinedDate || new Date().toISOString(),
        achievements: existingPublicData.achievements || [],
        updatedAt: Timestamp.now(),
      })
      
      // Commit all changes atomically
      await batch.commit()
      
      console.log('✅ Username claimed successfully:', displayUsername)
      return { success: true }
    } catch (error: any) {
      console.error('Error claiming username:', error)
      return { success: false, error: error.message || 'Failed to claim username' }
    }
  }

  /**
   * Get user ID from username
   * @param username - The username to look up
   */
  async getUserIdFromUsername(username: string): Promise<string | null> {
    try {
      const normalizedUsername = username.toLowerCase().trim()
      const usernameDoc = doc(db, 'usernames', normalizedUsername)
      const docSnap = await getDoc(usernameDoc)
      
      if (docSnap.exists()) {
        return docSnap.data().userId
      }
      
      return null
    } catch (error) {
      console.error('Error getting user ID from username:', error)
      return null
    }
  }

  /**
   * Get public profile by username (for public profile pages)
   * @param username - The username to look up
   */
  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const normalizedUsername = username.toLowerCase().trim()
      
      // Get userId from username
      const userId = await this.getUserIdFromUsername(normalizedUsername)
      if (!userId) {
        console.log('Username not found:', normalizedUsername)
        return null
      }
      
      // Get public profile
      const publicProfileDoc = doc(db, 'publicProfiles', userId)
      const docSnap = await getDoc(publicProfileDoc)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: userId,
          userId: userId,
          username: normalizedUsername,
          displayName: data.displayName || 'Anonymous Writer',
          avatar: data.avatar,
          bio: data.bio,
          totalEntries: data.totalEntries || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          joinedDate: data.joinedDate || new Date().toISOString(),
          achievements: data.achievements || [],
          updatedAt: timestampToISO(data.updatedAt),
        } as UserProfile
      }
      
      return null
    } catch (error) {
      console.error('Error getting profile by username:', error)
      return null
    }
  }

  /**
   * Get public profile by user ID (for public profile pages)
   * @param userId - The user ID to look up
   */
  async getPublicProfile(userId: string): Promise<UserProfile | null> {
    try {
      const publicProfileDoc = doc(db, 'publicProfiles', userId)
      const docSnap = await getDoc(publicProfileDoc)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: userId,
          userId: userId,
          username: data.username,
          displayName: data.displayName || 'Anonymous Writer',
          avatar: data.avatar,
          bio: data.bio,
          totalEntries: data.totalEntries || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          joinedDate: data.joinedDate || new Date().toISOString(),
          achievements: data.achievements || [],
          updatedAt: timestampToISO(data.updatedAt),
        } as UserProfile
      }
      
      return null
    } catch (error) {
      console.error('Error getting public profile:', error)
      return null
    }
  }

  // ============================================================
  // AUTH PROFILE (Firebase Auth user metadata)
  // ============================================================

  async updateAuthProfile(updates: { displayName?: string; photoURL?: string }, user: any): Promise<void> {
    try {
      await updateProfile(user, updates)
    } catch (error) {
      console.error('Error updating auth profile:', error)
      throw error
    }
  }

  // ============================================================
  // ACCOUNT DELETION
  // Deletes all user data from all collections
  // ============================================================

  async deleteUserAccount(user: any): Promise<void> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated')
      }

      console.log('🗑️ Starting account deletion process...')

      // Step 1: Get username before deleting (we need it to delete from usernames collection)
      let username: string | null = null
      try {
        const publicProfileRef = doc(db, 'publicProfiles', this.userId)
        const publicProfileSnap = await getDoc(publicProfileRef)
        if (publicProfileSnap.exists()) {
          username = publicProfileSnap.data()?.username || null
        }
        console.log('📝 Retrieved username for deletion:', username)
      } catch (error) {
        console.error('Error getting username:', error)
      }

      // Step 2: Delete all user entries
      try {
        const entriesCollection = this.getUserCollection('entries')
        const entriesSnapshot = await getDocs(entriesCollection)
        const batch = writeBatch(db)
        entriesSnapshot.docs.forEach(doc => batch.delete(doc.ref))
        await batch.commit()
        console.log(`✅ Deleted ${entriesSnapshot.docs.length} journal entries`)
      } catch (error) {
        console.error('Error deleting entries:', error)
      }

      // Step 3: Delete all weekly summaries
      try {
        const summariesCollection = this.getUserCollection('summaries')
        const summariesSnapshot = await getDocs(summariesCollection)
        const batch = writeBatch(db)
        summariesSnapshot.docs.forEach(doc => batch.delete(doc.ref))
        await batch.commit()
        console.log(`✅ Deleted ${summariesSnapshot.docs.length} weekly summaries`)
      } catch (error) {
        console.error('Error deleting summaries:', error)
      }

      // Step 4: Delete all entry summaries
      try {
        const entrySummariesCollection = this.getUserCollection('entrySummaries')
        const entrySummariesSnapshot = await getDocs(entrySummariesCollection)
        const batch = writeBatch(db)
        entrySummariesSnapshot.docs.forEach(doc => batch.delete(doc.ref))
        await batch.commit()
        console.log(`✅ Deleted ${entrySummariesSnapshot.docs.length} entry summaries`)
      } catch (error) {
        console.error('Error deleting entry summaries:', error)
      }

      // Step 5: Delete all entry hold statuses
      try {
        const holdStatusCollection = this.getUserCollection('entryHoldStatus')
        const holdStatusSnapshot = await getDocs(holdStatusCollection)
        const batch = writeBatch(db)
        holdStatusSnapshot.docs.forEach(doc => batch.delete(doc.ref))
        await batch.commit()
        console.log(`✅ Deleted ${holdStatusSnapshot.docs.length} hold statuses`)
      } catch (error) {
        console.error('Error deleting hold statuses:', error)
      }

      // Step 6: Delete username from usernames collection
      if (username) {
        try {
          const usernameRef = doc(db, 'usernames', username.toLowerCase())
          await deleteDoc(usernameRef)
          console.log('✅ Deleted username:', username)
        } catch (error) {
          console.error('Error deleting username:', error)
        }
      }

      // Step 7: Delete public profile
      try {
        const publicProfileRef = doc(db, 'publicProfiles', this.userId)
        await deleteDoc(publicProfileRef)
        console.log('✅ Deleted public profile')
      } catch (error) {
        console.error('Error deleting public profile:', error)
      }

      // Step 8: Delete private profile
      try {
        const profileRef = doc(db, 'users', this.userId, 'profile', 'data')
        await deleteDoc(profileRef)
        console.log('✅ Deleted private profile')
      } catch (error) {
        console.error('Error deleting profile:', error)
      }

      // Step 9: Delete the user document
      try {
        const userDocRef = doc(db, 'users', this.userId)
        await deleteDoc(userDocRef)
        console.log('✅ Deleted user document')
      } catch (error) {
        console.error('Error deleting user document:', error)
      }

      // Step 10: Reauthenticate user before deleting account
      try {
        console.log('🔐 Reauthenticating user for account deletion...')
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(user, provider)
        console.log('✅ Reauthentication successful')
      } catch (reauthError: any) {
        console.log('Reauthentication failed:', reauthError?.message || reauthError)
        
        if (reauthError?.code === 'auth/requires-recent-login') {
          throw new Error('Please sign out and sign in again, then try deleting your account. This is a security requirement.')
        }
        
        console.log('Continuing with account deletion despite reauthentication failure...')
      }

      // Step 11: Delete the Firebase Auth account
      try {
        await deleteUser(user)
        console.log('✅ Deleted Firebase Auth account')
      } catch (deleteError: any) {
        console.error('Error deleting Firebase Auth account:', deleteError)
        
        if (deleteError?.code === 'auth/requires-recent-login') {
          throw new Error('Account deletion requires recent authentication. Please sign out, sign in again, and try deleting your account.')
        }
        
        throw new Error(`Failed to delete account: ${deleteError?.message || deleteError}`)
      }

      console.log('🎉 Account deletion completed successfully')
    } catch (error) {
      console.error('Error deleting user account:', error)
      throw error
    }
  }

  // ============================================================
  // OFFLINE SUPPORT
  // ============================================================

  async enableOffline(): Promise<void> {
    try {
      await disableNetwork(db)
      console.log('Firebase offline mode enabled')
    } catch (error) {
      console.error('Error enabling offline mode:', error)
    }
  }

  async enableOnline(): Promise<void> {
    try {
      await enableNetwork(db)
      console.log('Firebase online mode enabled')
    } catch (error) {
      console.error('Error enabling online mode:', error)
    }
  }
}

// Export a singleton instance
export const firebaseJournalService = new FirebaseJournalService()
