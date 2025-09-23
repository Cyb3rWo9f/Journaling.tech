'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const typeStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      confirmStyle: 'bg-red-500 hover:bg-red-600 text-white'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      confirmStyle: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-blue-500',
      confirmStyle: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  }

  const currentStyle = typeStyles[type]
  const Icon = currentStyle.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-[var(--background)] rounded-lg transition-colors"
          >
            <X size={16} className="text-[var(--text-secondary)]" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 p-2 rounded-lg bg-${type === 'danger' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-100/10`}>
              <Icon size={20} className={currentStyle.iconColor} />
            </div>

            {/* Text content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  className="px-4"
                >
                  {cancelText}
                </Button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStyle.confirmStyle}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}