'use client'

import React, { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'

interface DeleteAccountSectionProps {
  onDeleteAccount: () => Promise<void>
  isDeleting: boolean
}

export function DeleteAccountSection({ onDeleteAccount, isDeleting }: DeleteAccountSectionProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (confirmationText.toLowerCase() === 'delete my account') {
      try {
        await onDeleteAccount()
        // Close dialog on success
        setShowConfirmDialog(false)
        setConfirmationText('')
      } catch (error) {
        console.error('Failed to delete account:', error)
        alert(`Account deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for more details.`)
      }
    }
  }

  const handleCancel = () => {
    setShowConfirmDialog(false)
    setConfirmationText('')
  }

  const isConfirmationValid = confirmationText.toLowerCase() === 'delete my account'

  return (
    <>
      {/* Delete Account Section */}
      <div className="bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 rounded-xl p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200">
              Danger Zone
            </h3>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
              Irreversible actions
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-medium text-red-800 dark:text-red-200 mb-2">
                  Delete Account
                </h4>
                <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mb-2 sm:mb-3">
                  This action will permanently delete your account and all associated data including:
                </p>
                <ul className="text-xs sm:text-sm text-red-700 dark:text-red-300 space-y-1 ml-3 sm:ml-4 list-disc">
                  <li>All your journal entries</li>
                  <li>Profile information and achievements</li>
                  <li>Streak data and statistics</li>
                  <li>Account settings and preferences</li>
                </ul>
                <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200 mt-2 sm:mt-3">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-[#0b0f13] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm sm:max-w-md">
            <div className="p-3 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Confirm Deletion
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              {/* Warning Message */}
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg p-2.5 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 font-medium mb-1 sm:mb-2">
                  ⚠️ Final Warning
                </p>
                <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                  You are about to permanently delete your account and all data. This action is 
                  <span className="font-semibold"> irreversible</span> and cannot be undone.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="font-mono bg-gray-100 dark:bg-[#0b0f13] px-1 rounded">DELETE MY ACCOUNT</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0b0f13] text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  disabled={isDeleting}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isDeleting}
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={!isConfirmationValid || isDeleting}
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors font-medium text-xs sm:text-sm"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}