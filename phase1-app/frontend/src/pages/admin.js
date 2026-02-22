import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  HiUserGroup, HiCheck, HiX, HiBan, HiRefresh, HiHome,
  HiShieldCheck, HiClock, HiXCircle, HiUser
} from 'react-icons/hi';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const statusColors = {
  pending: { bg: '#fef3c7', color: '#92400e', icon: HiClock },
  active: { bg: '#d1fae5', color: '#065f46', icon: HiCheck },
  suspended: { bg: '#fee2e2', color: '#991b1b', icon: HiBan },
  rejected: { bg: '#f3f4f6', color: '#6b7280', icon: HiXCircle },
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, token, loading: authLoading } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [authLoading, isAdmin, router]);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isAdmin) {
      fetchUsers();
    }
  }, [token, isAdmin, statusFilter]);

  const handleAction = async (userId, action) => {
    try {
      await axios.post(`${API_URL}/api/auth/users/${userId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`User ${action} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} user`);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`${API_URL}/api/auth/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Logo size={40} />
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Admin Dashboard</h1>
            <p style={{ margin: '3px 0 0', color: '#6b7280', fontSize: '14px' }}>User Management</p>
          </div>
        </div>
        <Link href="/">
          <button style={{
            padding: '10px 16px',
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '500',
          }}>
            <HiHome size={18} /> Home
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#2563eb' },
          { label: 'Pending', value: pendingCount, color: '#f59e0b' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, color: '#10b981' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: '#ef4444' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderTop: `3px solid ${stat.color}`,
          }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '20px',
        background: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <HiUserGroup size={20} color="#6b7280" />
        <span style={{ fontWeight: '600' }}>Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
        >
          <option value="">All Users</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={fetchUsers}
          style={{
            padding: '8px 14px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <HiRefresh size={16} /> Refresh
        </button>
      </div>

      {/* User Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No users found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Company</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Created</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const statusStyle = statusColors[u.status] || statusColors.pending;
                const StatusIcon = statusStyle.icon;
                return (
                  <tr key={u.user_id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{u.full_name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#4b5563' }}>{u.company_name || '—'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}>
                        <StatusIcon size={14} />
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                        disabled={u.email === user?.email}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '13px',
                          background: u.role === 'admin' ? '#dbeafe' : 'white',
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {u.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(u.user_id, 'approve')}
                              style={{
                                padding: '6px 10px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <HiCheck size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleAction(u.user_id, 'reject')}
                              style={{
                                padding: '6px 10px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <HiX size={14} /> Reject
                            </button>
                          </>
                        )}
                        {u.status === 'active' && u.email !== user?.email && (
                          <button
                            onClick={() => handleAction(u.user_id, 'suspend')}
                            style={{
                              padding: '6px 10px',
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <HiBan size={14} /> Suspend
                          </button>
                        )}
                        {(u.status === 'suspended' || u.status === 'rejected') && (
                          <button
                            onClick={() => handleAction(u.user_id, 'approve')}
                            style={{
                              padding: '6px 10px',
                              background: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <HiCheck size={14} /> Activate
                          </button>
                        )}
                        <Link href={`/?viewAsUser=${u.user_id}`}>
                          <button
                            style={{
                              padding: '6px 10px',
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <HiUser size={14} /> View Data
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
        Strikezone Admin Panel • Logged in as {user?.email}
      </div>
    </div>
  );
}
