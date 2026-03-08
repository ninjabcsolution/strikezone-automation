import Image from 'next/image';

/**
 * Beautiful Loading Component with multiple variants
 */
export default function Loading({ 
  message = 'Loading...', 
  fullPage = false, 
  variant = 'pulse', // 'pulse', 'dots', 'bars', 'spinner'
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const sizes = {
    small: { logo: 32, text: 14 },
    medium: { logo: 48, text: 16 },
    large: { logo: 64, text: 18 },
  };

  const s = sizes[size] || sizes.medium;

  const containerStyle = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    zIndex: 9999,
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center' }}>
        {/* Logo with pulse animation */}
        <div className="loading-logo">
          <Image
            src="/logo-large.png"
            alt="Strikezone"
            width={s.logo}
            height={s.logo}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Loading indicator based on variant */}
        <div style={{ marginTop: '20px' }}>
          {variant === 'dots' && <DotsLoader />}
          {variant === 'bars' && <BarsLoader />}
          {variant === 'spinner' && <SpinnerLoader />}
          {variant === 'pulse' && <PulseLoader />}
        </div>

        {/* Message */}
        <p style={{ 
          marginTop: '16px', 
          color: '#64748b', 
          fontSize: s.text,
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>
          {message}
        </p>
      </div>

      <style jsx global>{`
        .loading-logo {
          animation: logoPulse 2s ease-in-out infinite;
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        /* Dots Loader */
        .dots-loader {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .dots-loader span {
          width: 10px;
          height: 10px;
          background: #2563eb;
          border-radius: 50%;
          animation: dotBounce 1.4s ease-in-out infinite both;
        }
        .dots-loader span:nth-child(1) { animation-delay: -0.32s; }
        .dots-loader span:nth-child(2) { animation-delay: -0.16s; }
        .dots-loader span:nth-child(3) { animation-delay: 0s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        /* Bars Loader */
        .bars-loader {
          display: flex;
          gap: 4px;
          justify-content: center;
          align-items: flex-end;
          height: 24px;
        }
        .bars-loader span {
          width: 4px;
          background: linear-gradient(to top, #2563eb, #7c3aed);
          border-radius: 2px;
          animation: barGrow 1s ease-in-out infinite;
        }
        .bars-loader span:nth-child(1) { animation-delay: 0s; }
        .bars-loader span:nth-child(2) { animation-delay: 0.1s; }
        .bars-loader span:nth-child(3) { animation-delay: 0.2s; }
        .bars-loader span:nth-child(4) { animation-delay: 0.3s; }
        .bars-loader span:nth-child(5) { animation-delay: 0.4s; }

        @keyframes barGrow {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }

        /* Spinner Loader */
        .spinner-loader {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Pulse Loader */
        .pulse-loader {
          display: flex;
          gap: 6px;
          justify-content: center;
        }
        .pulse-loader span {
          width: 8px;
          height: 8px;
          background: #2563eb;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .pulse-loader span:nth-child(1) { animation-delay: 0s; }
        .pulse-loader span:nth-child(2) { animation-delay: 0.2s; }
        .pulse-loader span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function DotsLoader() {
  return (
    <div className="dots-loader">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function BarsLoader() {
  return (
    <div className="bars-loader">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function SpinnerLoader() {
  return <div className="spinner-loader"></div>;
}

function PulseLoader() {
  return (
    <div className="pulse-loader">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

/**
 * Full page loading screen with branding
 */
export function PageLoading({ message = 'Loading...' }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      zIndex: 9999,
    }}>
      <div className="page-loading-logo">
        <Image
          src="/logo-large.png"
          alt="Strikezone"
          width={80}
          height={80}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      
      <h1 style={{
        marginTop: '24px',
        fontSize: '28px',
        fontWeight: 800,
        color: '#1e293b',
        letterSpacing: '-0.02em',
      }}>
        Strike<span style={{ color: '#2563eb' }}>zone</span>
      </h1>
      
      <p style={{
        marginTop: '8px',
        fontSize: '14px',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '2px',
      }}>
        BDaaS Platform
      </p>

      <div style={{ marginTop: '40px' }}>
        <BarsLoader />
      </div>

      <p style={{
        marginTop: '20px',
        fontSize: '15px',
        color: '#94a3b8',
      }}>
        {message}
      </p>

      <style jsx global>{`
        .page-loading-logo {
          animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .bars-loader {
          display: flex;
          gap: 4px;
          justify-content: center;
          align-items: flex-end;
          height: 24px;
        }
        .bars-loader span {
          width: 4px;
          background: linear-gradient(to top, #2563eb, #7c3aed);
          border-radius: 2px;
          animation: barGrow 1s ease-in-out infinite;
        }
        .bars-loader span:nth-child(1) { animation-delay: 0s; }
        .bars-loader span:nth-child(2) { animation-delay: 0.1s; }
        .bars-loader span:nth-child(3) { animation-delay: 0.2s; }
        .bars-loader span:nth-child(4) { animation-delay: 0.3s; }
        .bars-loader span:nth-child(5) { animation-delay: 0.4s; }

        @keyframes barGrow {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
      `}</style>
    </div>
  );
}

/**
 * Skeleton loader for content placeholders
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 4 }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

/**
 * Card skeleton for dashboard cards
 */
export function CardSkeleton() {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <Skeleton width={120} height={14} />
      <div style={{ marginTop: '12px' }}>
        <Skeleton width={80} height={32} />
      </div>
      <div style={{ marginTop: '16px' }}>
        <Skeleton width="100%" height={12} />
      </div>
    </div>
  );
}
