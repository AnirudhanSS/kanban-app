/**
 * Console filter to suppress expected network errors
 * This prevents 409, 400, 422 errors from cluttering the console
 */

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Override console.error to filter out expected network errors
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this is a network error we want to suppress
  const suppressPatterns = [
    /POST.*409.*Conflict/i,
    /POST.*400.*Bad Request/i,
    /POST.*422.*Unprocessable Entity/i,
    /GET.*404.*Not Found/i,
    /PUT.*409.*Conflict/i,
    /DELETE.*404.*Not Found/i
  ];
  
  const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
  
  if (!shouldSuppress) {
    originalError.apply(console, args);
  }
};

// Override console.warn to filter out expected warnings
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this is a warning we want to suppress
  const suppressPatterns = [
    /Failed to load resource.*409/i,
    /Failed to load resource.*400/i,
    /Failed to load resource.*422/i
  ];
  
  const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
  
  if (!shouldSuppress) {
    originalWarn.apply(console, args);
  }
};

// Export function to restore original console methods if needed
export const restoreConsole = () => {
  console.error = originalError;
  console.warn = originalWarn;
};

// Export function to add custom suppression patterns
export const addSuppressionPattern = (pattern: RegExp) => {
  // This could be extended to add more patterns dynamically
  console.log('Custom suppression pattern added:', pattern);
};
