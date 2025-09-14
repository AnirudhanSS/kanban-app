/**
 * Aggressive network error suppression
 * This approach tries to intercept network errors at multiple levels
 */

// 1. Override console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  info: console.info
};

// Function to check if message is a network error
const isNetworkError = (message: string): boolean => {
  const networkPatterns = [
    /POST.*409.*Conflict/i,
    /POST.*400.*Bad Request/i,
    /POST.*422.*Unprocessable Entity/i,
    /GET.*404.*Not Found/i,
    /PUT.*409.*Conflict/i,
    /DELETE.*404.*Not Found/i,
    /Failed to load resource/i,
    /net::/i,
    /ERR_/i,
    /http:\/\/localhost:5000/i,
    /https:\/\/.*\.onrender\.com/i,
    /^\d{3}/, // Status codes
    /Conflict/i,
    /Bad Request/i,
    /Unprocessable Entity/i,
    /Not Found/i
  ];
  
  return networkPatterns.some(pattern => pattern.test(message));
};

// Override all console methods
Object.keys(originalConsole).forEach(method => {
  (console as any)[method] = (...args: any[]) => {
    const message = args.join(' ');
    if (!isNetworkError(message)) {
      (originalConsole as any)[method].apply(console, args);
    }
  };
});

// 2. Override global error handlers
const originalOnError = window.onerror;
const originalOnUnhandledRejection = window.onunhandledrejection;

window.onerror = (message, source, lineno, colno, error) => {
  const messageStr = String(message);
  if (!isNetworkError(messageStr)) {
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
  }
  return true; // Prevent default error handling
};

window.onunhandledrejection = (event) => {
  const message = event.reason?.message || String(event.reason);
  if (!isNetworkError(message)) {
    if (originalOnUnhandledRejection) {
      originalOnUnhandledRejection.call(window, event);
    }
  }
  // Prevent default handling
  event.preventDefault();
};

// 3. Override fetch to suppress network errors
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    
    // Don't log 4xx errors to console
    if (response.status >= 400 && response.status < 500) {
      // Suppress these from console
    }
    
    return response;
  } catch (error) {
    // Don't log network errors to console
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!isNetworkError(errorMessage)) {
      throw error;
    }
    throw error; // Still throw, just don't log
  }
};

// 4. Override XMLHttpRequest to suppress network errors
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

// Extend XMLHttpRequest interface to add custom properties
interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  _method?: string;
  _url?: string;
}

XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
  (this as ExtendedXMLHttpRequest)._method = method;
  (this as ExtendedXMLHttpRequest)._url = url.toString();
  return originalXHROpen.call(this, method, url, async ?? true, username, password);
};

XMLHttpRequest.prototype.send = function(data?: Document | XMLHttpRequestBodyInit | null) {
  const xhr = this as ExtendedXMLHttpRequest;
  
  const originalOnError = xhr.onerror;
  const originalOnLoad = xhr.onload;
  
  xhr.onerror = function(event) {
    // Suppress network errors from console
    const url = xhr._url || '';
    if (!isNetworkError(url)) {
      if (originalOnError) {
        originalOnError.call(this, event);
      }
    }
  };
  
  xhr.onload = function(event) {
    // Suppress 4xx errors from console
    if (xhr.status >= 400 && xhr.status < 500) {
      // Don't log to console
    }
    
    if (originalOnLoad) {
      originalOnLoad.call(this, event);
    }
  };
  
  return originalXHRSend.call(this, data);
};

// Export function to restore original behavior
export const restoreNetworkLogging = () => {
  Object.keys(originalConsole).forEach(method => {
    (console as any)[method] = (originalConsole as any)[method];
  });
  
  window.onerror = originalOnError;
  window.onunhandledrejection = originalOnUnhandledRejection;
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
};
