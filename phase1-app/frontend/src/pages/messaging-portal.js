import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  HiMail, HiUserGroup, HiCheck, HiX, HiPencil, HiDownload, 
  HiSparkles, HiClock, HiCheckCircle, HiXCircle, HiPencilAlt,
  HiOutlineRefresh, HiEye, HiPlus
} from 'react-icons/hi';
import Layout from '../components/Layout';

import { getApiUrl } from '../utils/api';

const getAPI_BASE = () => `${typeof window !== 'undefined' ? getApiUrl() : 'http://localhost:5002'}/api`;

export default function MessagingPortal() {
  const [activeTab, setActiveTab] = useState('pending');
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, edited: 0 });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Generation form state
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageType, setMessageType] = useState('email');
  const [customInstructions, setCustomInstructions] = useState('');

  // Edit modal state
  const [editBody, setEditBody] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? '' : activeTab;
      const res = await axios.get(`${getAPI_BASE()}/messaging/messages`, {
        params: { status: status || undefined, limit: 100 },
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${getAPI_BASE()}/messaging/messages/stats`);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${getAPI_BASE()}/messaging/templates`);
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.error('Failed to load templates');
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${getAPI_BASE()}/enrichment/contacts`, {
        params: { limit: 200 },
      });
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchStats();
    fetchTemplates();
    fetchContacts();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`${getAPI_BASE()}/messaging/messages/${id}/approve`);
      toast.success('Message approved!');
      setSelectedMessage(null);
      fetchMessages();
      fetchStats();
    } catch (err) {
      toast.error('Failed to approve message');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`${getAPI_BASE()}/messaging/messages/${id}/reject`, {
        reason: rejectReason || 'Rejected by reviewer',
      });
      toast.success('Message rejected');
      setSelectedMessage(null);
      setRejectReason('');
      fetchMessages();
      fetchStats();
    } catch (err) {
      toast.error('Failed to reject message');
    }
  };

  const handleEditAndApprove = async (id) => {
    try {
      await axios.post(`${getAPI_BASE()}/messaging/messages/${id}/edit`, {
        body: editBody,
        subject: editSubject,
      });
      toast.success('Message edited and approved!');
      setSelectedMessage(null);
      setEditBody('');
      setEditSubject('');
      fetchMessages();
      fetchStats();
    } catch (err) {
      toast.error('Failed to edit message');
    }
  };

  const handleBulkApprove = async () => {
    const pendingIds = messages.filter(m => m.approval_status === 'pending').map(m => m.id);
    if (!pendingIds.length) return;
    
    try {
      await axios.post(`${getAPI_BASE()}/messaging/messages/bulk/approve`, { ids: pendingIds });
      toast.success(`Approved ${pendingIds.length} messages`);
      fetchMessages();
      fetchStats();
    } catch (err) {
      toast.error('Failed to bulk approve');
    }
  };

  const handleGenerate = async () => {
    if (!selectedContacts.length) {
      toast.error('Please select at least one contact');
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post(`${getAPI_BASE()}/messaging/generate/batch`, {
        contactIds: selectedContacts,
        templateId: selectedTemplate || undefined,
        messageType,
        customInstructions: customInstructions || undefined,
      });
      toast.success(`Generated ${res.data.generatedCount} messages (${res.data.failedCount} failed)`);
      setSelectedContacts([]);
      fetchMessages();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate messages');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    window.open(`${getAPI_BASE()}/messaging/export?type=${messageType}`, '_blank');
  };

  const openMessageDetail = (msg) => {
    setSelectedMessage(msg);
    setEditBody(msg.body || '');
    setEditSubject(msg.subject || '');
    setRejectReason('');
  };

  const statusBadge = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      edited: '#3b82f6',
    };
    return (
      <span style={{
        background: colors[status] || '#6b7280',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        textTransform: 'capitalize',
      }}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <h1 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HiMail size={28} color="#2563eb" /> AI Messaging Portal
        </h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Generate, review, and approve AI-powered outreach messages
      </p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: 'Total', value: stats.total, color: '#6b7280' },
          { label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { label: 'Approved', value: stats.approved, color: '#10b981' },
          { label: 'Edited', value: stats.edited, color: '#3b82f6' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${stat.color}`,
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stat.value || 0}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Generation Panel */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiSparkles size={20} color="#8b5cf6" /> Generate AI Messages
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Message Type</label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            >
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="call_script">Call Script</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Template (Optional)</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            >
              <option value="">-- No template --</option>
              {templates.filter(t => t.type === messageType).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Custom Instructions</label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g., Mention our new product..."
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Select Contacts ({selectedContacts.length} selected)
          </label>
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px' }}>
            {contacts.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>No enriched contacts available. Run contact enrichment first.</p>
            ) : (
              contacts.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts([...selectedContacts, c.id]);
                      } else {
                        setSelectedContacts(selectedContacts.filter(id => id !== c.id));
                      }
                    }}
                    style={{ marginRight: '10px' }}
                  />
                  <span>{c.full_name || c.first_name} - {c.title} @ {c.company_name}</span>
                </label>
              ))
            )}
          </div>
          <div style={{ marginTop: '5px' }}>
            <button
              onClick={() => setSelectedContacts(contacts.map(c => c.id))}
              style={{ marginRight: '10px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedContacts([])}
              style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !selectedContacts.length}
          style={{
            background: generating ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: generating || !selectedContacts.length ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {generating ? <HiOutlineRefresh size={18} className="animate-spin" /> : <HiSparkles size={18} />}
          {generating ? 'Generating...' : `Generate ${selectedContacts.length} Messages`}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        {['pending', 'approved', 'edited', 'rejected', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: activeTab === tab ? '2px solid #2563eb' : '1px solid #d1d5db',
              background: activeTab === tab ? '#eff6ff' : 'white',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontWeight: activeTab === tab ? '600' : '400',
            }}
          >
            {tab}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {activeTab === 'pending' && messages.length > 0 && (
          <button
            onClick={handleBulkApprove}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HiCheckCircle size={16} /> Approve All Pending
          </button>
        )}
        <button
          onClick={handleExport}
          style={{
            background: '#6b7280',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <HiDownload size={16} /> Export Approved
        </button>
      </div>

      {/* Messages Table */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No messages found. Generate some messages to get started!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Contact</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Company</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Subject</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{msg.contact_name || msg.first_name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{msg.contact_email}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{msg.company_name}</td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>{msg.message_type}</td>
                  <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.subject || '(No subject)'}
                  </td>
                  <td style={{ padding: '12px' }}>{statusBadge(msg.approval_status)}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => openMessageDetail(msg)}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Message Details</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>To:</strong> {selectedMessage.contact_name} ({selectedMessage.contact_email})
              <br />
              <strong>Company:</strong> {selectedMessage.company_name}
              <br />
              <strong>Type:</strong> {selectedMessage.message_type}
              <br />
              <strong>Status:</strong> {statusBadge(selectedMessage.approval_status)}
            </div>

            {selectedMessage.message_type === 'email' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Subject:</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  disabled={selectedMessage.approval_status !== 'pending'}
                />
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Message Body:</label>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontFamily: 'inherit',
                }}
                disabled={selectedMessage.approval_status !== 'pending'}
              />
            </div>

            {selectedMessage.approval_status === 'pending' && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Rejection Reason (if rejecting):</label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Why are you rejecting this message?"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleApprove(selectedMessage.id)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <HiCheckCircle size={18} /> Approve
                  </button>
                  <button
                    onClick={() => handleEditAndApprove(selectedMessage.id)}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <HiPencilAlt size={18} /> Save Edits & Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedMessage.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <HiXCircle size={18} /> Reject
                  </button>
                </div>
              </>
            )}

            {selectedMessage.approval_status === 'rejected' && selectedMessage.rejection_reason && (
              <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
                <strong>Rejection Reason:</strong> {selectedMessage.rejection_reason}
              </div>
            )}
          </div>
        </div>
      )}

        <div style={{ marginTop: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
          Strikezone AI Messaging Portal • Phase 4B
        </div>
      </div>
    </Layout>
  );
}
