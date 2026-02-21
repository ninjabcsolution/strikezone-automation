import { useState } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { 
  HiUpload, HiChartBar, HiClipboardCheck, HiUserGroup, HiMail,
  HiLightningBolt, HiQuestionMarkCircle, HiCheckCircle, HiXCircle,
  HiDocumentText, HiOutlineRefresh
} from 'react-icons/hi';
import Loading from '../components/Loading';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success(`Successfully uploaded ${data.fileName}`);
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Failed to connect to server');
    } finally {
      setUploading(false);
    }
  };

  const handleCalculateMetrics = async () => {
    setCalculating(true);
    try {
      const response = await fetch(`${API_URL}/api/analytics/calculate`, {
        method: 'POST',
      });
      const data = await response.json();
      toast.success(`Top 20% customers contribute ${data.stats.top20Contribution}% of gross margin!`);
    } catch (err) {
      toast.error('Failed to calculate metrics');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HiLightningBolt size={36} color="#f59e0b" />
          <div>
            <h1 style={{ color: '#1f2937', margin: '0', fontSize: '24px' }}>Strikezone Platform</h1>
            <p style={{ margin: '3px 0 0 0', color: '#6b7280', fontSize: '14px' }}>ERP Data Ingestion & Analysis</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/guide">
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
              <HiQuestionMarkCircle size={18} /> Guide
            </button>
          </Link>
          <Link href="/faq">
            <button style={{
              padding: '10px 16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '500',
            }}>
              <HiQuestionMarkCircle size={18} /> FAQ
            </button>
          </Link>
        </div>
      </div>

      {/* Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '25px' }}>
        {[
          { href: '/ceo-dashboard', icon: HiChartBar, label: 'CEO Dashboard', color: '#2563eb' },
          { href: '/icp-dashboard', icon: HiUserGroup, label: 'ICP Dashboard', color: '#10b981' },
          { href: '/approval-portal', icon: HiClipboardCheck, label: 'Approval Portal', color: '#f59e0b' },
          { href: '/messaging-portal', icon: HiMail, label: 'Messaging', color: '#8b5cf6' },
        ].map((nav) => (
          <Link key={nav.href} href={nav.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              borderTop: `3px solid ${nav.color}`,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}>
              <nav.icon size={24} color={nav.color} />
              <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                {nav.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Upload Panel */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <HiUpload size={22} color="#2563eb" /> Upload ERP Data
        </h3>
        <div style={{ border: '2px dashed #d1d5db', padding: '30px', textAlign: 'center', borderRadius: '8px', background: '#f9fafb' }}>
          <HiDocumentText size={40} color="#9ca3af" style={{ marginBottom: '15px' }} />
          <input type="file" accept=".csv" onChange={handleFileChange} style={{ marginBottom: '15px' }} />
          <br />
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            style={{
              padding: '12px 24px',
              background: uploading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: file && !uploading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {uploading ? <><HiOutlineRefresh size={16} /> Uploading...</> : <><HiUpload size={16} /> Upload CSV</>}
          </button>
        </div>
      </div>

      {/* Upload Result */}
      {result && (
        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #86efac', marginBottom: '20px' }}>
          <h3 style={{ color: '#166534', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiCheckCircle size={22} /> Upload Successful
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div><strong>File:</strong><br/>{result.fileName}</div>
            <div><strong>Type:</strong><br/>{result.fileType}</div>
            <div><strong>Rows Processed:</strong><br/>{result.validation?.totalRows || 0}</div>
            <div><strong>Rows Inserted:</strong><br/>{result.ingestion?.inserted || 0}</div>
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <HiChartBar size={22} color="#10b981" /> Analytics
        </h3>
        <button 
          onClick={handleCalculateMetrics}
          disabled={calculating}
          style={{
            padding: '12px 20px',
            background: calculating ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: calculating ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {calculating ? <><HiOutlineRefresh size={16} /> Calculating...</> : 'Calculate Top 20% Metrics'}
        </button>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>
          Run after uploading Customers and Orders data
        </p>
      </div>

      {/* Supported Files Info */}
      <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '20px', border: '1px solid #bfdbfe' }}>
        <h4 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiDocumentText size={18} color="#2563eb" /> Supported Files
        </h4>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {['Customers.csv', 'Orders.csv', 'OrderLines.csv', 'Products.csv'].map(f => (
            <span key={f} style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '25px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
        Strikezone Platform • BDaaS Solution
      </div>
    </div>
  );
}
