import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  onSnapshot,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore'
import { updateProfile, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { db } from '@/lib/firebase'
import { JournalEntry, WeeklySummary, EntrySummary, UserProfile } from '@/types'

export class FirebaseJournalService {
  private userId: string | null = null

  setUserId(userId: string) {
    this.userId = userId
  }

  private getUserCollection(collectionName: string) {
    if (!this.userId) {
      throw new Error('User not authenticated')
    }
    return collection(db, 'users', this.userId, collectionName)
  }

  // Journal Entries
  async createEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    try {
      const entriesCollection = this.getUserCollection('entries')
      
      // Filter out undefined values for Firestore
      const cleanEntry = Object.fromEntries(
        Object.entries(entry).filter(([_, value]) => value !== undefined)
      )
      
      const entryData = {
        ...cleanEntry,
        createdAt: Timestamp.fromDate(new Date(entry.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(entry.updatedAt)),
      }
      
      console.log('📤 Saving to Firebase:', entryData)
      
      const docRef = await addDoc(entriesCollection, entryData)
      
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
      const entryDoc = doc(this.getUserCollection('entries'), entry.id)
      
      // Filter out undefined values for Firestore
      const cleanEntry = Object.fromEntries(
        Object.entries(entry).filter(([_, value]) => value !== undefined)
      )
      
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
      const entryDoc = doc(this.getUserCollection('entries'), entryId)
      await deleteDoc(entryDoc)
    } catch (error) {
      console.error('Error deleting entry:', error)
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
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
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
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
        } as JournalEntry
      })
    } catch (error) {
      console.error('Error getting entries by date range:', error)
      throw new Error('Failed to load journal entries for date range')
    }
  }

  // Real-time subscription to entries
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
            createdAt: data.createdAt.toDate().toISOString(),
            updatedAt: data.updatedAt.toDate().toISOString(),
          } as JournalEntry
        })
        
        callback(entries)
      }, (error) => {
        console.error('Error in entries subscription:', error)
      })
      
      return unsubscribe
    } catch (error) {
      console.error('Error setting up entries subscription:', error)
      return () => {} // Return empty function if subscription fails
    }
  }

  // Entry Summaries
  async createEntrySummary(summary: Omit<EntrySummary, 'id'>): Promise<EntrySummary> {
    try {
      const summariesCollection = this.getUserCollection('entrySummaries')
      const summaryData = {
        ...summary,
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
          createdAt: data.createdAt.toDate().toISOString(),
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
      
      // Delete all summaries for this entry (there should typically be only one)
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      console.log(`Deleted ${querySnapshot.docs.length} summary(ies) for entry ${entryId}`)
    } catch (error) {
      console.error('Error deleting entry summary:', error)
      throw new Error('Failed to delete entry summary')
    }
  }

  // Weekly Summaries
  async createSummary(summary: Omit<WeeklySummary, 'id'>): Promise<WeeklySummary> {
    try {
      const summariesCollection = this.getUserCollection('summaries')
      const summaryData = {
        ...summary,
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
          createdAt: data.createdAt.toDate().toISOString(),
        } as WeeklySummary
      })
    } catch (error) {
      console.error('Error getting summaries:', error)
      throw new Error('Failed to load weekly summaries')
    }
  }

  // User Profile Management
  async createOrUpdateProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      if (!this.userId) throw new Error('User not authenticated')
      
      const profileDoc = doc(db, 'users', this.userId, 'profile', 'data')
      const profileData = {
        ...profile,
        updatedAt: Timestamp.now(),
      }
      
      await updateDoc(profileDoc, profileData).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'users', this.userId!, 'profile'), {
          ...profileData,
          createdAt: Timestamp.now(),
        })
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  async getProfile(): Promise<UserProfile | null> {
    try {
      if (!this.userId) throw new Error('User not authenticated')
      
      const profileDoc = doc(db, 'users', this.userId, 'profile', 'data')
      const docSnap = await getDoc(profileDoc)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          userId: this.userId,
          ...data,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          joinedDate: data.joinedDate || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as UserProfile
      }
      
      return null
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  async updateAuthProfile(updates: { displayName?: string; photoURL?: string }, user: any): Promise<void> {
    try {
      await updateProfile(user, updates)
    } catch (error) {
      console.error('Error updating auth profile:', error)
      throw error
    }
  }

  // Delete user account and all associated data
  async deleteUserAccount(user: any): Promise<void> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated')
      }

      console.log('Starting account deletion process...')

      // Step 1: Delete all user entries
      try {
        const entriesCollection = this.getUserCollection('entries')
        const entriesSnapshot = await getDocs(entriesCollection)
        const deleteEntriesPromises = entriesSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deleteEntriesPromises)
        console.log(`Deleted ${entriesSnapshot.docs.length} journal entries`)
      } catch (error) {
        console.error('Error deleting entries:', error)
        // Continue with deletion process
      }

      // Step 2: Delete all user summaries
      try {
        const summariesCollection = this.getUserCollection('summaries')
        const summariesSnapshot = await getDocs(summariesCollection)
        const deleteSummariesPromises = summariesSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deleteSummariesPromises)
        console.log(`Deleted ${summariesSnapshot.docs.length} summaries`)
      } catch (error) {
        console.error('Error deleting summaries:', error)
        // Continue with deletion process
      }

      // Step 3: Delete user profile
      try {
        const profileRef = doc(db, 'users', this.userId, 'profile', 'data')
        await deleteDoc(profileRef)
        console.log('Deleted user profile')
      } catch (error) {
        console.error('Error deleting profile:', error)
        // Continue with deletion process
      }

      // Step 4: Delete the user document itself
      try {
        const userDocRef = doc(db, 'users', this.userId)
        await deleteDoc(userDocRef)
        console.log('Deleted user document')
      } catch (error) {
        console.error('Error deleting user document:', error)
        // Continue with deletion process
      }

      // Step 5: Reauthenticate user before deleting account (Firebase requirement)
      try {
        console.log('Reauthenticating user for account deletion...')
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(user, provider)
        console.log('Reauthentication successful')
      } catch (reauthError: any) {
        console.log('Reauthentication failed:', reauthError?.message || reauthError)
        
        // Check if this is a "requires-recent-login" error
        if (reauthError?.code === 'auth/requires-recent-login') {
          throw new Error('Please sign out and sign in again, then try deleting your account. This is a security requirement.')
        }
        
        // For other reauthentication errors, continue with deletion attempt
        console.log('Continuing with account deletion despite reauthentication failure...')
      }

      // Step 6: Finally, delete the Firebase Auth account
      try {
        await deleteUser(user)
        console.log('Deleted Firebase Auth account')
      } catch (deleteError: any) {
        console.error('Error deleting Firebase Auth account:', deleteError)
        
        if (deleteError?.code === 'auth/requires-recent-login') {
          throw new Error('Account deletion requires recent authentication. Please sign out, sign in again, and try deleting your account.')
        }
        
        throw new Error(`Failed to delete account: ${deleteError?.message || deleteError}`)
      }

      console.log('Account deletion completed successfully')
    } catch (error) {
      console.error('Error deleting user account:', error)
      throw error
    }
  }

  // Offline support
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

export const firebaseJournalService = new FirebaseJournalService()