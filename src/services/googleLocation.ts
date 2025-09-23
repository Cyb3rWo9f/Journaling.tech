'use client'

export interface GoogleLocationData {
  latitude: number
  longitude: number
  city?: string
  country?: string
  address?: string
  source: 'google_account' | 'google_maps' | 'fallback'
  timestamp: number
}

export interface GoogleUserLocation {
  homeAddress?: {
    locality?: string
    country?: string
    postalCode?: string
    streetAddress?: string
    region?: string
  }
  workAddress?: {
    locality?: string
    country?: string
    postalCode?: string
    streetAddress?: string
    region?: string
  }
}

class GoogleLocationService {
  private apiKey: string | null = null
  private accessToken: string | null = null

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }

  setApiKey(key: string) {
    this.apiKey = key
  }

  /**
   * Get user's location from Google account profile
   * This requires specific scopes during OAuth
   */
  async getUserLocationFromProfile(): Promise<GoogleLocationData | null> {
    if (!this.accessToken) {
      throw new Error('No access token available. User must be signed in.')
    }

    try {
      console.log('🔍 Fetching user location from Google profile...')
      
      // Try to get user's addresses from Google People API
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
        const address = data.addresses[0] // Use first address
        
        if (address.city || address.region) {
          // Try to geocode the address to get coordinates
          const coordinates = await this.geocodeAddress(
            `${address.city || ''} ${address.region || ''} ${address.country || ''}`.trim()
          )

          if (coordinates) {
            const locationData: GoogleLocationData = {
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              city: address.city,
              country: address.country,
              address: address.formattedValue,
              source: 'google_account',
              timestamp: Date.now()
            }

            // Store in localStorage
            localStorage.setItem('googleLocationData', JSON.stringify(locationData))
            return locationData
          }
        }
      }

      // Check locations field (if available)
      if (data.locations && data.locations.length > 0) {
        const location = data.locations[0]
        if (location.value) {
          const coordinates = await this.geocodeAddress(location.value)
          if (coordinates) {
            const locationData: GoogleLocationData = {
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              address: location.value,
              source: 'google_account',
              timestamp: Date.now()
            }

            localStorage.setItem('googleLocationData', JSON.stringify(locationData))
            return locationData
          }
        }
      }

      console.log('📍 No location data found in Google profile')
      return null

    } catch (error) {
      console.error('Error fetching user location from Google profile:', error)
      throw error
    }
  }

  /**
   * Get user's current location using Google Maps Geolocation API
   * This uses IP-based location detection
   */
  async getCurrentLocationFromGoogle(): Promise<GoogleLocationData | null> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    try {
      console.log('🔍 Getting location from Google Maps Geolocation API...')

      // Use Google Maps Geolocation API
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            considerIp: true,
            wifiAccessPoints: [],
            cellTowers: []
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Google Geolocation API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('📍 Google Geolocation response:', data)

      if (data.location) {
        // Get address information using reverse geocoding
        const addressInfo = await this.reverseGeocode(data.location.lat, data.location.lng)

        const locationData: GoogleLocationData = {
          latitude: data.location.lat,
          longitude: data.location.lng,
          city: addressInfo.city,
          country: addressInfo.country,
          address: addressInfo.formattedAddress,
          source: 'google_maps',
          timestamp: Date.now()
        }

        // Store in localStorage
        localStorage.setItem('googleLocationData', JSON.stringify(locationData))
        return locationData
      }

      return null

    } catch (error) {
      console.error('Error getting location from Google Maps API:', error)
      throw error
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!this.apiKey || !address.trim()) {
      return null
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      }

      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  /**
   * Reverse geocode coordinates to get address information
   */
  private async reverseGeocode(lat: number, lng: number): Promise<{
    city?: string
    country?: string
    formattedAddress?: string
  }> {
    if (!this.apiKey) {
      return {}
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        const components = result.address_components

        let city, country

        for (const component of components) {
          if (component.types.includes('locality')) {
            city = component.long_name
          } else if (component.types.includes('administrative_area_level_1') && !city) {
            city = component.long_name
          } else if (component.types.includes('country')) {
            country = component.long_name
          }
        }

        return {
          city,
          country,
          formattedAddress: result.formatted_address
        }
      }

      return {}
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return {}
    }
  }

  /**
   * Get stored location data
   */
  getStoredGoogleLocation(): GoogleLocationData | null {
    try {
      const stored = localStorage.getItem('googleLocationData')
      if (stored) {
        const locationData = JSON.parse(stored)
        
        // Check if location is still fresh (1 hour cache)
        const oneHour = 60 * 60 * 1000
        if (Date.now() - locationData.timestamp < oneHour) {
          return locationData
        }
      }
    } catch (error) {
      console.error('Error reading stored Google location:', error)
    }
    
    return null
  }

  /**
   * Get location with fallback strategies
   */
  async getLocationWithFallback(): Promise<GoogleLocationData> {
    console.log('🔍 Getting location with Google fallback strategies...')

    // 1. Try stored location first
    const stored = this.getStoredGoogleLocation()
    if (stored) {
      console.log('📍 Using stored Google location')
      return stored
    }

    // 2. Try Google profile location (if user is signed in)
    if (this.accessToken) {
      try {
        const profileLocation = await this.getUserLocationFromProfile()
        if (profileLocation) {
          console.log('📍 Using Google profile location')
          return profileLocation
        }
      } catch (error) {
        console.warn('Failed to get location from Google profile:', error)
      }
    }

    // 3. Try Google Maps Geolocation API
    if (this.apiKey) {
      try {
        const mapsLocation = await this.getCurrentLocationFromGoogle()
        if (mapsLocation) {
          console.log('📍 Using Google Maps location')
          return mapsLocation
        }
      } catch (error) {
        console.warn('Failed to get location from Google Maps API:', error)
      }
    }

    // 4. Fallback to browser geolocation
    console.log('📍 Falling back to browser geolocation')
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('No location access available'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const addressInfo = await this.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          )

          const locationData: GoogleLocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: addressInfo.city,
            country: addressInfo.country,
            address: addressInfo.formattedAddress,
            source: 'fallback',
            timestamp: Date.now()
          }

          localStorage.setItem('googleLocationData', JSON.stringify(locationData))
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
    localStorage.removeItem('googleLocationData')
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }
}

export const googleLocationService = new GoogleLocationService()