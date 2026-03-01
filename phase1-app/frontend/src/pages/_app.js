import Head from 'next/head';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';

// Error boundary to catch runtime errors (including from browser extensions)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error but don't break the app
    console.error('App Error:', error, errorInfo);
    
    // Check if error is from a browser extension (ignore these)
    if (error?.stack?.includes('chrome-extension://') || 
        error?.message?.includes('chrome-extension://') ||
        error?.message?.includes('sseError')) {
      console.warn('Error from browser extension - ignoring');
      this.setState({ hasError: false, error: null });
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.toString() || '';
      const isExtensionError = 
        errorMessage.includes('chrome-extension://') ||
        errorMessage.includes('sseError') ||
        this.state.error?.stack?.includes('chrome-extension://');
      
      if (isExtensionError) {
        // Don't show error UI for extension errors, just render children
        return this.props.children;
      }
      
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h1 style={{ color: '#ef4444' }}>Something went wrong</h1>
          <p style={{ color: '#6b7280' }}>Please refresh the page or try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
          <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
            <summary style={{ cursor: 'pointer', color: '#9ca3af' }}>Error Details</summary>
            <pre style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px', overflow: 'auto', fontSize: '12px' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Head>
          <title>Strikezone - BDaaS Platform</title>
        </Head>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
