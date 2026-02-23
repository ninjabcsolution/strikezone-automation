import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HiLogout, HiQuestionMarkCircle, HiCog, HiUser, HiChevronDown, HiShieldCheck } from 'react-icons/hi';
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

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Left - Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo size={36} />
      </Link>

      {/* Right - Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Guide Link */}
        <Link href="/guide" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
          <HiQuestionMarkCircle size={18} />
          Guide
        </Link>

        {/* FAQ Link */}
        <Link href="/faq" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
          <HiQuestionMarkCircle size={18} />
          FAQ
        </Link>

        {/* Admin Link (if admin) */}
        {isAdmin && (
          <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6', fontSize: '14px', fontWeight: '500' }}>
            <HiShieldCheck size={18} />
            Admin
          </Link>
        )}

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
            }}>
              {getInitials(user?.fullName)}
            </div>
            <span style={{ fontWeight: '500', color: '#374151' }}>
              {user?.fullName || 'User'}
            </span>
            <HiChevronDown size={16} color="#6b7280" />
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
                  <Link href="/profile" style={{ textDecoration: 'none' }}>
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
                      <HiUser size={18} color="#6b7280" />
                      Profile
                    </div>
                  </Link>

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
                    <HiLogout size={18} />
                    Sign Out
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
