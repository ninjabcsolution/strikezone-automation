import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const router = useRouter();
  const { user, isAdmin, signout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    signout();
    router.push('/login');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Navigation items
  const navItems = [
    { href: '/', label: 'Upload', icon: '📤' },
    { href: '/ceo-dashboard', label: 'CEO Dashboard', icon: '📊' },
    { href: '/icp-dashboard', label: 'ICP Dashboard', icon: '🎯' },
    { href: '/approval-portal', label: 'Approval', icon: '✅' },
    { href: '/messaging-portal', label: 'Messaging', icon: '📨' },
  ];

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      height: '60px',
    }}>
      {/* Left - Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <Logo size={32} />
      </Link>

      {/* Center - Main Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: isActive(item.href) ? '600' : '500',
              color: isActive(item.href) ? '#2563eb' : '#6b7280',
              background: isActive(item.href) ? '#eff6ff' : 'transparent',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right - User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Help Links */}
        <Link href="/guide" style={{ 
          textDecoration: 'none', 
          color: '#9ca3af', 
          fontSize: '13px',
          padding: '6px 10px',
          borderRadius: '6px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = '#f3f4f6'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
        >
          Help
        </Link>

        {/* Admin Link (if admin) */}
        {isAdmin && (
          <Link href="/admin" style={{ 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            color: '#8b5cf6', 
            fontSize: '13px', 
            fontWeight: '500',
            padding: '6px 10px',
            background: '#f5f3ff',
            borderRadius: '6px',
          }}>
            🛡️ Admin
          </Link>
        )}

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 4px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '700',
            }}>
              {getInitials(user?.fullName)}
            </div>
            <span style={{ fontWeight: '500', color: '#374151', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName?.split(' ')[0] || 'User'}
            </span>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>▼</span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                onClick={() => setShowDropdown(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 50,
                }}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                minWidth: '200px',
                zIndex: 100,
                overflow: 'hidden',
              }}>
                {/* User Info */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{user?.fullName}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{user?.email}</div>
                  {isAdmin && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      padding: '2px 8px',
                      background: '#dbeafe',
                      color: '#2563eb',
                      fontSize: '11px',
                      fontWeight: '600',
                      borderRadius: '4px',
                    }}>
                      ADMIN
                    </span>
                  )}
                </div>

                {/* Menu Items */}
                <div style={{ padding: '8px' }}>
                  <Link href="/guide" onClick={() => setShowDropdown(false)} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      color: '#374151',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      📖 Guide
                    </div>
                  </Link>

                  <Link href="/faq" onClick={() => setShowDropdown(false)} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      color: '#374151',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      ❓ FAQ
                    </div>
                  </Link>

                  <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                  <div
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    🚪 Sign Out
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
