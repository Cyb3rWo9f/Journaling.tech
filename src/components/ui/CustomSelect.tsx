'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import * as ReactDOM from 'react-dom'

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Array<{value: string, label: string}>
  icon?: React.ReactNode
  iconBgColor?: string
  chevronColor?: string
  placeholder?: string
  label?: string
}

// Create a dedicated element for our dropdowns
const createPortalRoot = () => {
  if (typeof document === 'undefined') return null;
  
  let root = document.getElementById('dropdown-portal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'dropdown-portal-root';
    root.style.position = 'fixed';
    root.style.zIndex = '9999';
    root.style.top = '0';
    root.style.left = '0';
    root.style.width = '100%';
    document.body.appendChild(root);
  }
  return root;
}

// Helper to lock/unlock page scrolling
const scrollLock = {
  enable: () => {
    if (typeof document !== 'undefined') {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body element
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.bottom = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      
      // Store the scroll position as a data attribute
      document.body.dataset.scrollY = scrollY.toString();
    }
  },
  disable: () => {
    if (typeof document !== 'undefined') {
      // Restore previous scroll position
      const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      
      // Remove all inline styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
      
      // Clean up data attribute
      delete document.body.dataset.scrollY;
    }
  }
};

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  icon, 
  iconBgColor = "bg-blue-100 dark:bg-blue-900/40",
  chevronColor = "text-blue-500 dark:text-blue-400",
  placeholder = "Select...",
  label
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const portalRoot = typeof document !== 'undefined' ? createPortalRoot() : null

  // Handle component mounting for client-side rendering
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen) {
      if (selectRef.current) {
        // Calculate position immediately
        const rect = selectRef.current.getBoundingClientRect()
        
        // For mobile, check if dropdown would go off screen
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top
        const dropdownHeight = Math.min(280, options.length * 36 + 8) // Estimate height
        
        // Determine if dropdown should appear above or below
        const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
        
        setDropdownPosition({
          top: showAbove ? rect.top - dropdownHeight : rect.bottom,
          left: rect.left,
          width: rect.width
        })
      }
    }
    
    return () => {
      // Only unlock if we're unmounting while the dropdown is open
      if (isOpen) {
        scrollLock.disable();
      }
    }
  }, [isOpen, options.length])
  
  // Find the selected option label
  const selectedLabel = options.find(option => option.value === value)?.label || placeholder
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        // Check if click is on the dropdown itself
        const dropdown = document.querySelector('[data-dropdown-portal="true"]')
        if (dropdown && dropdown.contains(event.target as Node)) {
          return // Don't close if clicking inside dropdown
        }
        // Unlock scroll when closing via outside click
        scrollLock.disable();
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      
      // Handle escape key to close dropdown
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          scrollLock.disable();
          setIsOpen(false);
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    }
  }, [isOpen])
  
  // Handle opening/closing the dropdown
  const toggleDropdown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle dropdown called, current state:", isOpen);
    
    // Apply scroll lock immediately if opening dropdown
    if (!isOpen) {
      scrollLock.enable();
    } else {
      scrollLock.disable();
    }
    
    setIsOpen(!isOpen);
  }
  
  // Create portal for dropdown
  const renderDropdown = () => {
    if (!isOpen || !isMounted || typeof document === 'undefined') return null
    
    console.log("Rendering dropdown at position:", dropdownPosition);
    
    const dropdown = (
      <div 
        data-dropdown-portal="true"
        className="fixed bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-y-auto"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          maxHeight: 280,
          zIndex: 99999
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          {options.map(option => (
            <div
              key={option.value}
              className={`px-4 py-3 cursor-pointer text-sm active:bg-[var(--primary)]/20 ${
                option.value === value 
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                  : 'text-[var(--text-primary)] hover:bg-[var(--background)]'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
                scrollLock.disable();
                setIsOpen(false);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                onChange(option.value);
                scrollLock.disable();
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    )
    
    return ReactDOM.createPortal(dropdown, portalRoot || document.body);
  }

  return (
    <div className="relative w-full" ref={selectRef}>
      {label && (
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
          {label}
        </label>
      )}
      
      <div 
        className="relative w-full cursor-pointer"
        onClick={toggleDropdown}
        onTouchEnd={toggleDropdown}
      >
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        
        {/* Selected value display */}
        <div 
          className={`w-full appearance-none bg-[var(--background)] border border-[var(--border)] rounded-lg ${icon ? 'pl-10' : 'pl-4'} pr-8 py-2.5 text-[var(--text-primary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-sm shadow-sm transition-all duration-200 hover:border-[var(--primary)]/50 flex items-center`}
        >
          {selectedLabel}
        </div>
        
        {/* Chevron indicator */}
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${iconBgColor} rounded-full p-1`}>
          <ChevronDown size={14} className={chevronColor} />
        </div>
      </div>
      
      {/* Render dropdown through portal */}
      {renderDropdown()}
    </div>
  )
}