import Image from 'next/image';

/**
 * Strikezone Logo Component
 * Uses PNG logo images from public folder
 */
export default function Logo({ size = 'large', showText = true }) {
  const isLarge = size === 'large' || size >= 40;
  const logoSrc = isLarge ? '/logo-large.png' : '/logo-small.png';
  const imgSize = typeof size === 'number' ? size : (isLarge ? 50 : 32);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Image
        src={logoSrc}
        alt="Strikezone Logo"
        width={imgSize}
        height={imgSize}
        style={{ objectFit: 'contain' }}
        priority
      />
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: imgSize * 0.4,
            fontWeight: 800,
            color: '#1f2937',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>
            Strike<span style={{ color: '#2563eb' }}>zone</span>
          </span>
          {imgSize >= 30 && (
            <span style={{
              fontSize: imgSize * 0.18,
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
export function LogoIcon({ size = 32 }) {
  return (
    <Image
      src="/logo-small.png"
      alt="Strikezone"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );
}

/**
 * Large logo for login/signup pages
 */
export function LogoLarge({ width = 120, height = 120 }) {
  return (
    <Image
      src="/logo-large.png"
      alt="Strikezone"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}
