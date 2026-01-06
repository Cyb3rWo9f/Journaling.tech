/**
 * Production-safe logger utility
 * Suppresses all console output in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development'

type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug'

interface Logger {
  log: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

const createLogger = (): Logger => {
  const noop = () => {}

  if (!isDevelopment) {
    // In production, suppress all console output
    return {
      log: noop,
      error: noop, // Even errors are suppressed to prevent info leakage
      warn: noop,
      info: noop,
      debug: noop,
    }
  }

  // In development, use normal console methods
  return {
    log: (...args: unknown[]) => console.log(...args),
    error: (...args: unknown[]) => console.error(...args),
    warn: (...args: unknown[]) => console.warn(...args),
    info: (...args: unknown[]) => console.info(...args),
    debug: (...args: unknown[]) => console.debug(...args),
  }
}

export const logger = createLogger()

// Disable console methods globally in production (client-side)
if (typeof window !== 'undefined' && !isDevelopment) {
  const noop = () => {}
  
  // Store original methods in case we need them for critical errors
  const originalError = console.error
  
  console.log = noop
  console.debug = noop
  console.info = noop
  console.warn = noop
  console.error = noop
  console.trace = noop
  console.dir = noop
  console.dirxml = noop
  console.table = noop
  console.group = noop
  console.groupCollapsed = noop
  console.groupEnd = noop
  console.time = noop
  console.timeEnd = noop
  console.timeLog = noop
  console.count = noop
  console.countReset = noop
  console.assert = noop
  console.profile = noop
  console.profileEnd = noop
}

export default logger
