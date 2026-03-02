// Dynamic API URL utility
// This function returns the API base URL based on the current browser hostname

export const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5002';
  }
  
  const hostname = window.location.hostname;
  const apiPort = process.env.NEXT_PUBLIC_API_PORT || '5002';
  const protocol = hostname === 'localhost' || hostname === '127.0.0.1' 
    ? 'http' 
    : window.location.protocol.replace(':', '');
  
  return `${protocol}://${hostname}:${apiPort}`;
};

export const API_URL = typeof window !== 'undefined' ? getApiUrl() : 'http://localhost:5002';

// Get auth token from localStorage - check both possible keys
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  // Check both token keys for compatibility
  return localStorage.getItem('token') || localStorage.getItem('strikezone_token');
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Authenticated fetch wrapper
export const authFetch = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  
  // Don't add Content-Type for FormData (file uploads)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 errors - user might need to re-login
  if (response.status === 401) {
    console.warn('Auth token expired or invalid');
    // Optionally clear token and redirect to login
    // localStorage.removeItem('token');
    // window.location.href = '/login';
  }
  
  return response;
};

// Convenience methods
export const api = {
  get: (url) => authFetch(url, { method: 'GET' }),
  
  post: (url, data) => authFetch(url, {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  
  put: (url, data) => authFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (url) => authFetch(url, { method: 'DELETE' }),
};

export default api;
