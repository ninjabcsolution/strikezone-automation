import { HiOutlineRefresh } from 'react-icons/hi';

export default function Loading({ message = 'Loading...', fullPage = false }) {
  const containerStyle = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.9)',
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
        <div style={{
          animation: 'spin 1s linear infinite',
          display: 'inline-block',
        }}>
          <HiOutlineRefresh size={40} color="#2563eb" />
        </div>
        <p style={{ marginTop: '15px', color: '#6b7280', fontSize: '16px' }}>
          {message}
        </p>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
