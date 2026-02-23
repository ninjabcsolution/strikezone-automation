import { useState } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { HiMail, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '50px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <HiCheckCircle size={70} color="#10b981" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '22px', color: '#1f2937', marginBottom: '12px' }}>
            Check Your Email
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '25px', lineHeight: '1.6' }}>
            If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
          </p>
          <Link href="/login">
            <button style={{
              padding: '12px 25px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}>
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

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
          <Logo size={45} />
        </div>

        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '24px', color: '#1f2937' }}>
          Reset Password
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#6b7280', fontSize: '14px' }}>
          Enter your email to receive reset instructions
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
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <HiArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
