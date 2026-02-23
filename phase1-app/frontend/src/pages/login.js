import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const userData = await signin(email, password);
      toast.success('Welcome back!');
      // Redirect admins to admin page, others to home
      if (userData?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <Toaster position="top-center" />
      
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Logo size={50} />
        </div>

        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '24px', color: '#1f2937' }}>
          Welcome Back
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#6b7280' }}>
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <HiMail size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: '500', color: '#374151' }}>Password</label>
              <Link href="/forgot-password" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none' }}>
                Forgot?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <HiLockClosed size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Signing in...' : <>Sign In <HiArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <span style={{ color: '#6b7280' }}>Don't have an account? </span>
          <Link href="/signup" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
