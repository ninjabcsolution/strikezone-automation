import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

// Simple SVG Icon components
const Icons = {
  Upload: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Chart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Target: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Help: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Book: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Question: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export default function Header() {
  const router = useRouter();
  const { user, isAdmin, signout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    signout();
    router.push('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { href: '/', label: 'Upload', Icon: Icons.Upload },
    { href: '/ceo-dashboard', label: 'CEO Dashboard', Icon: Icons.Chart },
    { href: '/icp-dashboard', label: 'ICP', Icon: Icons.Target },
    { href: '/lookalike-search', label: 'Lookalike', Icon: Icons.Search },
    { href: '/approval-portal', label: 'Approval', Icon: Icons.Check },
    { href: '/messaging-portal', label: 'Messaging', Icon: Icons.Mail },
  ];

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <>
      <header className="header">
        {/* Left - Logo */}
        <Link href="/" className="logo-link">
          <Logo size={isMobile ? 44 : 45} showText={!isMobile} />
        </Link>

        {/* Center - Desktop Navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <item.Icon />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right - User Menu (Desktop) */}
        <div className="right-section">
          {/* Help Link - Desktop */}
          <Link href="/guide" className="help-link desktop-only">
            <Icons.Help />
            <span>Help</span>
          </Link>

          {/* Admin Link */}
          {isAdmin && (
            <Link href="/admin" className="admin-link desktop-only">
              <Icons.Shield />
              <span>Admin</span>
            </Link>
          )}

          {/* Profile Dropdown - Desktop */}
          <div className="profile-dropdown desktop-only">
            <button onClick={() => setShowDropdown(!showDropdown)} className="profile-button">
              <div className="avatar">{getInitials(user?.fullName)}</div>
              <span className="user-name">{user?.fullName?.split(' ')[0] || 'User'}</span>
              <Icons.ChevronDown />
            </button>

            {showDropdown && (
              <>
                <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user?.fullName}</div>
                    <div className="dropdown-email">{user?.email}</div>
                    {isAdmin && <span className="admin-badge">ADMIN</span>}
                  </div>
                  <div className="dropdown-items">
                    <Link href="/guide" onClick={() => setShowDropdown(false)} className="dropdown-item">
                      <Icons.Book /> Guide
                    </Link>
                    <Link href="/faq" onClick={() => setShowDropdown(false)} className="dropdown-item">
                      <Icons.Question /> FAQ
                    </Link>
                    <div className="dropdown-divider" />
                    <div onClick={handleLogout} className="dropdown-item logout">
                      <Icons.Logout /> Sign Out
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-user">
            <div className="avatar large">{getInitials(user?.fullName)}</div>
            <div>
              <div className="mobile-user-name">{user?.fullName}</div>
              <div className="mobile-user-email">{user?.email}</div>
            </div>
          </div>
          
          <nav className="mobile-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.Icon />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mobile-menu-footer">
            {isAdmin && (
              <Link href="/admin" className="mobile-nav-link admin" onClick={() => setMobileMenuOpen(false)}>
                <Icons.Shield />
                <span>Admin Panel</span>
              </Link>
            )}
            <Link href="/guide" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <Icons.Book />
              <span>Guide</span>
            </Link>
            <Link href="/faq" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <Icons.Question />
              <span>FAQ</span>
            </Link>
            <div className="mobile-nav-link logout" onClick={handleLogout}>
              <Icons.Logout />
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          height: 60px;
        }

        @media (min-width: 768px) {
          .header { padding: 0 24px; }
        }

        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 4px;
        }

        @media (min-width: 1024px) {
          .desktop-nav { display: flex; }
        }

        .nav-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          background: transparent;
          transition: all 0.15s ease;
        }

        .nav-link:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .nav-link.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
        }

        /* Right Section */
        .right-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .desktop-only {
          display: none;
        }

        @media (min-width: 768px) {
          .desktop-only { display: flex; }
        }

        .help-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #9ca3af;
          font-size: 13px;
          padding: 6px 10px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .help-link:hover {
          color: #6b7280;
          background: #f3f4f6;
        }

        .admin-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #8b5cf6;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 10px;
          background: #f5f3ff;
          border-radius: 6px;
        }

        /* Profile Dropdown */
        .profile-dropdown {
          position: relative;
        }

        .profile-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          cursor: pointer;
          font-size: 13px;
        }

        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .avatar.large {
          width: 48px;
          height: 48px;
          font-size: 16px;
        }

        .user-name {
          font-weight: 500;
          color: #374151;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          min-width: 200px;
          z-index: 100;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .dropdown-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .dropdown-email {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .admin-badge {
          display: inline-block;
          margin-top: 6px;
          padding: 2px 8px;
          background: #dbeafe;
          color: #2563eb;
          font-size: 11px;
          font-weight: 600;
          border-radius: 4px;
        }

        .dropdown-items {
          padding: 8px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 6px;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
        }

        .dropdown-item:hover {
          background: #f3f4f6;
        }

        .dropdown-item.logout {
          color: #ef4444;
        }

        .dropdown-item.logout:hover {
          background: #fef2f2;
        }

        .dropdown-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 4px 0;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #374151;
        }

        @media (min-width: 1024px) {
          .mobile-menu-btn { display: none; }
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 99;
          overflow-y: auto;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-menu-user {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .mobile-user-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }

        .mobile-user-email {
          font-size: 13px;
          color: #6b7280;
          margin-top: 2px;
        }

        .mobile-nav {
          padding: 12px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 10px;
          color: #374151;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
        }

        .mobile-nav-link:hover, .mobile-nav-link.active {
          background: #f3f4f6;
        }

        .mobile-nav-link.active {
          background: #eff6ff;
          color: #2563eb;
        }

        .mobile-nav-link.admin {
          color: #8b5cf6;
          background: #f5f3ff;
        }

        .mobile-nav-link.logout {
          color: #ef4444;
        }

        .mobile-nav-link.logout:hover {
          background: #fef2f2;
        }

        .mobile-menu-footer {
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          margin-top: 12px;
        }

        @media (min-width: 1024px) {
          .mobile-menu { display: none; }
        }
      `}</style>
    </>
  );
}
