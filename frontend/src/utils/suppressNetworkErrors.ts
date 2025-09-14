/**
 * Complete network error suppression
 * This will hide ALL network errors from the console
 * Use with caution - you might miss important errors
 */

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Override console.error to suppress network errors
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this is a network-related error
  const isNetworkError = 
    message.includes('POST') ||
    message.includes('GET') ||
    message.includes('PUT') ||
    message.includes('DELETE') ||
    message.includes('PATCH') ||
    message.includes('Failed to load resource') ||
    message.includes('net::') ||
    message.includes('ERR_') ||
    message.includes('Conflict') ||
    message.includes('Bad Request') ||
    message.includes('Unprocessable Entity') ||
    message.includes('Not Found') ||
    /^\d{3}/.test(message) || // Status codes like 409, 400, etc.
    /http:\/\/localhost:5000/.test(message) || // Local API calls
    /https:\/\/.*\.onrender\.com/.test(message); // Production API calls
  
  // Only log non-network errors
  if (!isNetworkError) {
    originalConsoleError.apply(console, args);
  }
};

// Override console.warn for network warnings
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  const isNetworkWarning = 
    message.includes('POST') ||
    message.includes('GET') ||
    message.includes('PUT') ||
    message.includes('DELETE') ||
    message.includes('Failed to load resource') ||
    message.includes('Conflict') ||
    message.includes('Bad Request') ||
    /http:\/\/localhost:5000/.test(message) ||
    /https:\/\/.*\.onrender\.com/.test(message);
  
  if (!isNetworkWarning) {
    originalConsoleWarn.apply(console, args);
  }
};

// Override console.log to suppress network logs
console.log = (...args: any[]) => {
  const message = args.join(' ');
  
  const isNetworkLog = 
    message.includes('POST') ||
    message.includes('GET') ||
    message.includes('PUT') ||
    message.includes('DELETE') ||
    message.includes('Conflict') ||
    message.includes('Bad Request') ||
    /http:\/\/localhost:5000/.test(message) ||
    /https:\/\/.*\.onrender\.com/.test(message);
  
  if (!isNetworkLog) {
    originalConsoleLog.apply(console, args);
  }
};

// Also override the global error handler to catch unhandled network errors
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  const messageStr = String(message);
  
  const isNetworkError = 
    messageStr.includes('POST') ||
    messageStr.includes('GET') ||
    messageStr.includes('PUT') ||
    messageStr.includes('DELETE') ||
    messageStr.includes('Conflict') ||
    messageStr.includes('Bad Request') ||
    messageStr.includes('Failed to load resource') ||
    /http:\/\/localhost:5000/.test(messageStr) ||
    /https:\/\/.*\.onrender\.com/.test(messageStr);
  
  if (!isNetworkError && originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  
  return true; // Prevent default error handling
};

export const restoreConsole = () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  window.onerror = originalOnError;
};
