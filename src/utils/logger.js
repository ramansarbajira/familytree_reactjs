/**
 * PHASE 6 OPTIMIZATION: Centralized logging utility
 * Logs only show in development mode, production console stays clean
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * General log - only in development
   */
  log: (...args) => {
    if (isDev) console.log(...args);
  },

  /**
   * Error log - always shown (important for debugging)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Warning log - only in development
   */
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },

  /**
   * Info log - only in development
   */
  info: (...args) => {
    if (isDev) console.info(...args);
  },

  /**
   * Debug log - only in development
   */
  debug: (...args) => {
    if (isDev) console.debug(...args);
  }
};

export default logger;
