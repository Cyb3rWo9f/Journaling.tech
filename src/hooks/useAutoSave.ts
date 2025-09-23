'use client'

import { useEffect, useRef } from 'react'
import { JournalEntry } from '@/types'
import { debounce } from '@/utils'

interface UseAutoSaveOptions {
  delay?: number
  onSave: (entry: JournalEntry) => void
  enabled?: boolean
}

export function useAutoSave(
  entry: JournalEntry | null, 
  { delay = 2000, onSave, enabled = true }: UseAutoSaveOptions
) {
  const debouncedSave = useRef(
    debounce((entryToSave: JournalEntry) => {
      onSave(entryToSave)
    }, delay)
  ).current

  useEffect(() => {
    if (enabled && entry) {
      debouncedSave(entry)
    }
  }, [entry, enabled, debouncedSave])

  return debouncedSave
}