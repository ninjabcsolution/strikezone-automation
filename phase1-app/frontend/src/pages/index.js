import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { 
  HiUpload, HiChartBar, HiClipboardCheck, HiUserGroup, HiMail,
  HiCheckCircle, HiDocumentText, HiOutlineRefresh, HiCloudUpload
} from 'react-icons/hi';
import Layout from '../components/Layout';

import { getApiUrl, authFetch, getAuthHeaders, getAuthToken } from '../utils/api';

const FILE_TYPES = [
  { key: 'customers', label: 'Customers.csv', description: 'Customer master data', order: 1 },
  { key: 'products', label: 'Products.csv', description: 'Product catalog', order: 2 },
  { key: 'orders', label: 'Orders.csv', description: 'Order headers', order: 3 },
  { key: 'orderlines', label: 'OrderLines.csv', description: 'Order line items', order: 4 },
];

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [selectedType, setSelectedType] = useState('customers');
  const fileInputRef = useRef(null);

  // Fetch upload status from database on load
  useEffect(() => {
    const fetchUploadStatus = async () => {
      try {
        const API_URL = getApiUrl();
        const response = await authFetch(`${API_URL}/api/upload/status`);
        const data = await response.json();
        
        if (response.ok && data.status) {
          setUploadedFiles(data.status);
          
          // Auto-select first non-uploaded file type
          const firstEmpty = FILE_TYPES.find(ft => !data.status[ft.key]);
          if (firstEmpty) {
            setSelectedType(firstEmpty.key);
          }
        }
      } catch (e) {
        console.error('Failed to fetch upload status:', e);
      }
    };
    
    fetchUploadStatus();
  }, []);

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
      const API_URL = getApiUrl();
      // Use authFetch which automatically adds auth headers
      const response = await authFetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        
        // Mark this file type as uploaded
        // Normalize key: order_lines -> orderlines (no underscore)
        let fileType = data.fileType?.toLowerCase().replace('.csv', '') || selectedType;
        if (fileType === 'order_lines') fileType = 'orderlines';
        
        const uploadInfo = {
          fileName: data.fileName,
          rows: data.ingestion?.inserted || 0,
          timestamp: new Date().toISOString(),
        };
        
        setUploadedFiles(prev => ({
          ...prev,
          [fileType]: uploadInfo
        }));
        
        toast.success(`Successfully uploaded ${data.fileName} (${uploadInfo.rows} rows)`);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Auto-advance to next file type
        const currentIndex = FILE_TYPES.findIndex(ft => ft.key === fileType);
        if (currentIndex < FILE_TYPES.length - 1) {
          setSelectedType(FILE_TYPES[currentIndex + 1].key);
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
      const API_URL = getApiUrl();
      const response = await authFetch(`${API_URL}/api/analytics/calculate`, {
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

  const resetUploadState = () => {
    setUploadedFiles({});
    localStorage.removeItem('strikezone_uploaded_files');
    setSelectedType('customers');
    setResult(null);
    toast.success('Upload state reset. Ready for fresh upload.');
  };

  const allFilesUploaded = FILE_TYPES.every(ft => uploadedFiles[ft.key]);
  const uploadProgress = FILE_TYPES.filter(ft => uploadedFiles[ft.key]).length;

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

        {/* Upload Progress Bar */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>
              Upload Progress: {uploadProgress} / {FILE_TYPES.length} files
            </h3>
            <button
              onClick={resetUploadState}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Reset All
            </button>
          </div>
          
          {/* Progress Bar */}
          <div style={{ 
            height: '8px', 
            background: '#e5e7eb', 
            borderRadius: '4px', 
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{ 
              width: `${(uploadProgress / FILE_TYPES.length) * 100}%`, 
              height: '100%', 
              background: allFilesUploaded ? '#10b981' : '#2563eb',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* File Type Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {FILE_TYPES.map((ft, idx) => {
              const isUploaded = !!uploadedFiles[ft.key];
              const isSelected = selectedType === ft.key;
              const isNext = !isUploaded && FILE_TYPES.slice(0, idx).every(f => uploadedFiles[f.key]);
              
              return (
                <button
                  key={ft.key}
                  onClick={() => setSelectedType(ft.key)}
                  style={{
                    padding: '15px',
                    background: isUploaded ? '#f0fdf4' : isSelected ? '#eff6ff' : 'white',
                    border: isSelected ? '2px solid #2563eb' : isUploaded ? '2px solid #10b981' : '2px solid #e5e7eb',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Step number */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '10px',
                    background: isUploaded ? '#10b981' : isSelected ? '#2563eb' : '#9ca3af',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}>
                    {isUploaded ? <HiCheckCircle size={16} /> : ft.order}
                  </div>
                  
                  <div style={{ marginTop: '5px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: isUploaded ? '#166534' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {ft.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {isUploaded ? (
                        <span style={{ color: '#16a34a' }}>
                          ✓ {uploadedFiles[ft.key].rows} rows
                        </span>
                      ) : (
                        ft.description
                      )}
                    </div>
                  </div>
                  
                  {isNext && !isUploaded && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '10px',
                      background: '#fef3c7',
                      color: '#d97706',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '600',
                    }}>
                      NEXT
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Panel */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '25px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '18px', color: '#1f2937' }}>
            <HiCloudUpload size={24} color="#2563eb" /> 
            Upload {FILE_TYPES.find(ft => ft.key === selectedType)?.label}
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
                  Drag & drop {FILE_TYPES.find(ft => ft.key === selectedType)?.label} here
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

        {/* All Files Uploaded Success */}
        {allFilesUploaded && (
          <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '14px', border: '2px solid #10b981', marginBottom: '25px', textAlign: 'center' }}>
            <HiCheckCircle size={48} color="#10b981" style={{ marginBottom: '10px' }} />
            <h3 style={{ color: '#166534', margin: '0 0 10px 0', fontSize: '20px' }}>
              All Files Uploaded Successfully!
            </h3>
            <p style={{ color: '#16a34a', marginBottom: '20px' }}>
              You can now calculate customer metrics and analyze your data.
            </p>
            <Link href="/ceo-dashboard" style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: '#10b981',
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
            }}>
              Go to CEO Dashboard →
            </Link>
          </div>
        )}

        {/* Analytics Panel */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '25px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', fontSize: '18px', color: '#1f2937' }}>
            <HiChartBar size={24} color="#10b981" /> Analytics
          </h3>
          <button 
            onClick={handleCalculateMetrics}
            disabled={calculating || !uploadedFiles.customers || !uploadedFiles.orders}
            style={{
              padding: '14px 24px',
              background: calculating || !uploadedFiles.customers || !uploadedFiles.orders ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: calculating || !uploadedFiles.customers || !uploadedFiles.orders ? 'not-allowed' : 'pointer',
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
            {uploadedFiles.customers && uploadedFiles.orders 
              ? 'Ready to calculate! Click the button above.'
              : 'Upload Customers and Orders data first to enable analytics'}
          </p>
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
