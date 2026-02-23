/**
 * Strikezone Logo Component
 * SVG-based logo with customizable size and color
 */
export default function Logo({ size = 40, color = '#2563eb', showText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Logo Icon - Target/Crosshair design */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="4" fill="none" />
        
        {/* Middle circle */}
        <circle cx="50" cy="50" r="30" stroke={color} strokeWidth="3" fill="none" />
        
        {/* Inner circle - filled */}
        <circle cx="50" cy="50" r="15" fill={color} />
        
        {/* Crosshair lines */}
        <line x1="50" y1="5" x2="50" y2="20" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="80" x2="50" y2="95" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="5" y1="50" x2="20" y2="50" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="80" y1="50" x2="95" y2="50" stroke={color} strokeWidth="4" strokeLinecap="round" />
        
        {/* Lightning bolt accent (representing speed/power) */}
        <path
          d="M55 35 L48 50 L55 50 L45 65"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: size * 0.5,
            fontWeight: 800,
            color: '#1f2937',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>
            Strike<span style={{ color }}>zone</span>
          </span>
          {size >= 30 && (
            <span style={{
              fontSize: size * 0.2,
              color: '#6b7280',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}>
              BDaaS Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Small logo icon only (for favicon, small spaces)
 */
export function LogoIcon({ size = 32, color = '#2563eb' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="4" fill="none" />
      <circle cx="50" cy="50" r="30" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="50" cy="50" r="15" fill={color} />
      <line x1="50" y1="5" x2="50" y2="20" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="80" x2="50" y2="95" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <line x1="5" y1="50" x2="20" y2="50" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="50" x2="95" y2="50" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M55 35 L48 50 L55 50 L45 65"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
