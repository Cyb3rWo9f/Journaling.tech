'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, X, ShieldAlert, AlertCircle } from 'lucide-react'

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

      {/* Enhanced Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[var(--background)] rounded-2xl shadow-2xl border border-red-500/20 w-full max-w-sm sm:max-w-md overflow-hidden"
            >
              {/* Red gradient header */}
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      initial={{ rotate: 0 }}
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                    >
                      <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        Confirm Deletion
                      </h3>
                      <p className="text-xs sm:text-sm text-red-100">
                        This action is permanent
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* Warning Message */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 mb-5"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                        ⚠️ Final Warning
                      </p>
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 leading-relaxed">
                        You are about to permanently delete your account and all data. This action is 
                        <span className="font-bold text-red-800 dark:text-red-200"> irreversible</span> and cannot be undone.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* What will be deleted */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-5"
                >
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">What will be deleted:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Journal entries', 'Profile data', 'Achievements', 'All settings'].map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Confirmation Input */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-5"
                >
                  <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                    Type <span className="font-mono bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md text-xs">DELETE MY ACCOUNT</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all text-sm ${
                      confirmationText 
                        ? isConfirmationValid 
                          ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20' 
                          : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-[var(--border)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    }`}
                    disabled={isDeleting}
                  />
                  {confirmationText && !isConfirmationValid && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 mt-1.5"
                    >
                      Please type exactly: DELETE MY ACCOUNT
                    </motion.p>
                  )}
                  {isConfirmationValid && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-500 mt-1.5 flex items-center gap-1"
                    >
                      ✓ Confirmation matched
                    </motion.p>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={handleCancel}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 text-[var(--text-primary)] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-sm disabled:opacity-50"
                  >
                    Keep Account
                  </button>
                  <motion.button
                    onClick={handleConfirmDelete}
                    disabled={!isConfirmationValid || isDeleting}
                    whileHover={isConfirmationValid && !isDeleting ? { scale: 1.02 } : {}}
                    whileTap={isConfirmationValid && !isDeleting ? { scale: 0.98 } : {}}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      isConfirmationValid && !isDeleting
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Forever
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}