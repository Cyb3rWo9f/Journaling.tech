'use client'

export interface FreeLocationData {
  latitude: number
  longitude: number
  city?: string
  country?: string
  address?: string
  source: 'google_profile' | 'ip_geolocation' | 'browser_fallback'
  timestamp: number
}

class FreeGoogleLocationService {
  private accessToken: string | null = null

  setAccessToken(token: string) {
    this.accessToken = token
  }

  /**
   * Get user's location from Google account profile (FREE)
   * Uses Google People API which is free for basic usage
   */
  async getUserLocationFromProfile(): Promise<FreeLocationData | null> {
    if (!this.accessToken) {
      throw new Error('No access token available. User must be signed in.')
    }

    try {
      console.log('🔍 Fetching user location from Google profile (FREE)...')
      
      // Get user's addresses from Google People API (FREE)
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=addresses,locations',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        console.warn('Google People API request failed:', response.status, response.statusText)
        return null
      }

      const data = await response.json()
      console.log('📍 Google profile data received:', data)

      // Extract location from addresses
      if (data.addresses && data.addresses.length > 0) {
        const address = data.addresses[0] // Use first address (usually home)
        
        if (address.city && address.region) {
          // Use free geocoding service to get coordinates
          const coordinates = await this.freeGeocode(
            `${address.city}, ${address.region}, ${address.country || ''}`
          )

          if (coordinates) {
            const locationData: FreeLocationData = {
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              city: address.city,
              country: address.country,
              address: address.formattedValue || `${address.city}, ${address.region}`,
              source: 'google_profile',
              timestamp: Date.now()
            }

            // Store in localStorage
            localStorage.setItem('freeLocationData', JSON.stringify(locationData))
            console.log('✅ Location obtained from Google profile (FREE)')
            return locationData
          }
        }
      }

      console.log('📍 No location data found in Google profile')
      return null

    } catch (error) {
      console.error('Error fetching user location from Google profile:', error)
      return null
    }
  }

  /**
   * Get location using free IP geolocation service
   * Uses ipapi.co which provides free IP-based location
   */
  async getLocationFromIP(): Promise<FreeLocationData | null> {
    try {
      console.log('🔍 Getting location from IP address (FREE)...')

      // Use free IP geolocation service
      const response = await fetch('https://ipapi.co/json/')

      if (!response.ok) {
        throw new Error(`IP geolocation service error: ${response.status}`)
      }

      const data = await response.json()
      console.log('📍 IP geolocation response:', data)

      if (data.latitude && data.longitude) {
        const locationData: FreeLocationData = {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          city: data.city,
          country: data.country_name,
          address: `${data.city}, ${data.region}, ${data.country_name}`,
          source: 'ip_geolocation',
          timestamp: Date.now()
        }

        // Store in localStorage
        localStorage.setItem('freeLocationData', JSON.stringify(locationData))
        console.log('✅ Location obtained from IP geolocation (FREE)')
        return locationData
      }

      return null

    } catch (error) {
      console.error('Error getting location from IP:', error)
      return null
    }
  }

  /**
   * Free geocoding using OpenStreetMap Nominatim (FREE)
   * No API key required, completely free
   */
  private async freeGeocode(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!address.trim()) {
      return null
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'JournalingApp/1.0' // Required by Nominatim
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Free geocoding error: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        }
      }

      return null
    } catch (error) {
      console.error('Free geocoding error:', error)
      return null
    }
  }

  /**
   * Free reverse geocoding using OpenStreetMap Nominatim (FREE)
   */
  private async freeReverseGeocode(lat: number, lng: number): Promise<{
    city?: string
    country?: string
    formattedAddress?: string
  }> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        {
          headers: {
            'User-Agent': 'JournalingApp/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Free reverse geocoding error: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.address) {
        return {
          city: data.address.city || data.address.town || data.address.village,
          country: data.address.country,
          formattedAddress: data.display_name
        }
      }

      return {}
    } catch (error) {
      console.error('Free reverse geocoding error:', error)
      return {}
    }
  }

  /**
   * Get stored location data
   */
  getStoredLocation(): FreeLocationData | null {
    try {
      const stored = localStorage.getItem('freeLocationData')
      if (stored) {
        const locationData = JSON.parse(stored)
        
        // Check if location is still fresh (1 hour cache)
        const oneHour = 60 * 60 * 1000
        if (Date.now() - locationData.timestamp < oneHour) {
          return locationData
        }
      }
    } catch (error) {
      console.error('Error reading stored location:', error)
    }
    
    return null
  }

  /**
   * Get location with completely free fallback strategies
   * No API keys required!
   */
  async getFreeLocationWithFallback(): Promise<FreeLocationData> {
    console.log('🔍 Getting location with FREE strategies...')

    // 1. Try stored location first
    const stored = this.getStoredLocation()
    if (stored) {
      console.log('📍 Using stored location (FREE)')
      return stored
    }

    // 2. Try Google profile location (if user is signed in) - FREE
    if (this.accessToken) {
      try {
        const profileLocation = await this.getUserLocationFromProfile()
        if (profileLocation) {
          console.log('📍 Using Google profile location (FREE)')
          return profileLocation
        }
      } catch (error) {
        console.warn('Failed to get location from Google profile:', error)
      }
    }

    // 3. Try free IP geolocation - FREE
    try {
      const ipLocation = await this.getLocationFromIP()
      if (ipLocation) {
        console.log('📍 Using IP geolocation (FREE)')
        return ipLocation
      }
    } catch (error) {
      console.warn('Failed to get location from IP:', error)
    }

    // 4. Fallback to browser geolocation - FREE
    console.log('📍 Falling back to browser geolocation (FREE)')
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('No location access available'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const addressInfo = await this.freeReverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          )

          const locationData: FreeLocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: addressInfo.city,
            country: addressInfo.country,
            address: addressInfo.formattedAddress,
            source: 'browser_fallback',
            timestamp: Date.now()
          }

          localStorage.setItem('freeLocationData', JSON.stringify(locationData))
          console.log('✅ Location obtained from browser (FREE)')
          resolve(locationData)
        },
        (error) => {
          reject(new Error('Unable to access location'))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    })
  }

  clearStoredLocation(): void {
    localStorage.removeItem('freeLocationData')
  }

  /**
   * Check if user has granted location access in their Google account
   */
  async checkGoogleLocationPermission(): Promise<boolean> {
    if (!this.accessToken) {
      return false
    }

    try {
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=addresses',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.ok
    } catch (error) {
      return false
    }
  }
}

export const freeGoogleLocationService = new FreeGoogleLocationService()