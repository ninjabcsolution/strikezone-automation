import { useState, useRef } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { 
  HiUpload, HiChartBar, HiClipboardCheck, HiUserGroup, HiMail,
  HiCheckCircle, HiDocumentText, HiOutlineRefresh, HiCloudUpload
} from 'react-icons/hi';
import Layout from '../components/Layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('strikezone_token');
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success(`Successfully uploaded ${data.fileName}`);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
      const token = localStorage.getItem('strikezone_token');
      const response = await fetch(`${API_URL}/api/analytics/calculate`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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
    <Layout>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Navigation Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
          {[
            { href: '/ceo-dashboard', icon: HiChartBar, label: 'CEO Dashboard', color: '#2563eb' },
            { href: '/icp-dashboard', icon: HiUserGroup, label: 'ICP Dashboard', color: '#10b981' },
            { href: '/approval-portal', icon: HiClipboardCheck, label: 'Approval Portal', color: '#f59e0b' },
            { href: '/messaging-portal', icon: HiMail, label: 'Messaging', color: '#8b5cf6' },
          ].map((nav) => (
            <Link key={nav.href} href={nav.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderTop: `4px solid ${nav.color}`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
              >
                <nav.icon size={28} color={nav.color} />
                <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  {nav.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Upload Panel */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '25px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '18px', color: '#1f2937' }}>
            <HiCloudUpload size={24} color="#2563eb" /> Upload ERP Data
          </h3>
          
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? '#2563eb' : '#d1d5db'}`,
              borderRadius: '12px',
              padding: '40px 30px',
              textAlign: 'center',
              background: dragActive ? '#eff6ff' : '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            <HiCloudUpload size={50} color={dragActive ? '#2563eb' : '#9ca3af'} style={{ marginBottom: '15px' }} />
            
            {file ? (
              <div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', marginBottom: '5px' }}>
                  {file.name}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  {(file.size / 1024).toFixed(1)} KB • Click to change
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
                  Drag & drop your CSV file here
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  or click to browse
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              style={{
                padding: '14px 28px',
                background: !file || uploading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: file && !uploading ? 'pointer' : 'not-allowed',
                fontSize: '15px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
            >
              {uploading ? (
                <><HiOutlineRefresh size={18} className="spin" /> Uploading...</>
              ) : (
                <><HiUpload size={18} /> Upload CSV</>
              )}
            </button>
            
            {file && !uploading && (
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                style={{
                  padding: '14px 20px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Upload Result */}
        {result && (
          <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '14px', border: '1px solid #86efac', marginBottom: '25px' }}>
            <h3 style={{ color: '#166534', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
              <HiCheckCircle size={24} /> Upload Successful
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>File</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{result.fileName}</div>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Type</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{result.fileType}</div>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Rows Processed</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{result.validation?.totalRows || 0}</div>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Rows Inserted</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{result.ingestion?.inserted || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Panel */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '25px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', fontSize: '18px', color: '#1f2937' }}>
            <HiChartBar size={24} color="#10b981" /> Analytics
          </h3>
          <button 
            onClick={handleCalculateMetrics}
            disabled={calculating}
            style={{
              padding: '14px 24px',
              background: calculating ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: calculating ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {calculating ? <><HiOutlineRefresh size={18} /> Calculating...</> : 'Calculate Top 20% Metrics'}
          </button>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>
            Run after uploading Customers and Orders data to analyze your top customers
          </p>
        </div>

        {/* Supported Files Info */}
        <div style={{ background: '#eff6ff', borderRadius: '14px', padding: '24px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#1e40af' }}>
            <HiDocumentText size={20} /> Supported Files
          </h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['Customers.csv', 'Orders.csv', 'OrderLines.csv', 'Products.csv'].map(f => (
              <span key={f} style={{ 
                background: 'white', 
                padding: '8px 14px', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: '500',
                color: '#374151',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
