'use client'

export interface LocationData {
  latitude: number
  longitude: number
  city?: string
  country?: string
  timestamp: number
}

export interface LocationPermissionState {
  granted: boolean
  denied: boolean
  prompt: boolean
}

class LocationService {
  private currentLocation: LocationData | null = null
  private permissionState: LocationPermissionState = {
    granted: false,
    denied: false,
    prompt: true
  }

  async requestLocationPermission(): Promise<LocationPermissionState> {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser')
        this.permissionState = { granted: false, denied: true, prompt: false }
        return this.permissionState
      }

      // Check current permission state
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        
        switch (permission.state) {
          case 'granted':
            this.permissionState = { granted: true, denied: false, prompt: false }
            break
          case 'denied':
            this.permissionState = { granted: false, denied: true, prompt: false }
            break
          case 'prompt':
            this.permissionState = { granted: false, denied: false, prompt: true }
            break
        }
      }

      return this.permissionState
    } catch (error) {
      console.error('Error checking location permission:', error)
      this.permissionState = { granted: false, denied: false, prompt: true }
      return this.permissionState
    }
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 300000 // 5 minutes
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          }

          // Try to get city/country information using reverse geocoding
          try {
            const cityInfo = await this.reverseGeocode(locationData.latitude, locationData.longitude)
            locationData.city = cityInfo.city
            locationData.country = cityInfo.country
          } catch (error) {
            console.warn('Could not get city information:', error)
          }

          this.currentLocation = locationData
          
          // Store in localStorage for persistence
          localStorage.setItem('userLocation', JSON.stringify(locationData))
          
          resolve(locationData)
        },
        (error) => {
          console.error('Error getting location:', error)
          
          let errorMessage = 'Failed to get location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              this.permissionState = { granted: false, denied: true, prompt: false }
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          
          reject(new Error(errorMessage))
        },
        options
      )
    })
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<{ city?: string; country?: string }> {
    try {
      // Using OpenStreetMap's Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'JournalingApp/1.0' // Required by Nominatim
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch location data')
      }

      const data = await response.json()
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village || data.address?.hamlet,
        country: data.address?.country
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      throw error
    }
  }

  getStoredLocation(): LocationData | null {
    try {
      const stored = localStorage.getItem('userLocation')
      if (stored) {
        const locationData = JSON.parse(stored)
        
        // Check if location is still fresh (less than 1 hour old)
        const oneHour = 60 * 60 * 1000
        if (Date.now() - locationData.timestamp < oneHour) {
          this.currentLocation = locationData
          return locationData
        }
      }
    } catch (error) {
      console.error('Error reading stored location:', error)
    }
    
    return null
  }

  getCurrentLocationData(): LocationData | null {
    return this.currentLocation
  }

  getPermissionState(): LocationPermissionState {
    return this.permissionState
  }

  clearStoredLocation(): void {
    localStorage.removeItem('userLocation')
    this.currentLocation = null
  }
}

export const locationService = new LocationService()