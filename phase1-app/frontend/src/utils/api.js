// Dynamic API URL utility
// This function returns the API base URL based on the current browser hostname
// This allows the same build to work for localhost AND external IP access

export const getApiUrl = () => {
  // On server-side (SSR), use localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:5002';
  }
  
  // On client-side, use the same hostname as the browser
  const hostname = window.location.hostname;
  const apiPort = process.env.NEXT_PUBLIC_API_PORT || '5002';
  
  // Use http for localhost, otherwise match the current protocol
  const protocol = hostname === 'localhost' || hostname === '127.0.0.1' 
    ? 'http' 
    : window.location.protocol.replace(':', '');
  
  return `${protocol}://${hostname}:${apiPort}`;
};

// Export a constant for components that need it
// Note: This will be evaluated once when the module loads
// For dynamic hostname detection, always call getApiUrl() directly
export const API_URL = typeof window !== 'undefined' ? getApiUrl() : 'http://localhost:5002';
