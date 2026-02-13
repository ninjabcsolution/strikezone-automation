import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setUploading(false);
    }
  };

  const handleCalculateMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/analytics/calculate', {
        method: 'POST',
      });
      const data = await response.json();
      alert(`Metrics calculated!\nTop 20% Contribution: ${data.stats.top20Contribution}%`);
    } catch (err) {
      alert('Failed to calculate metrics');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#003366', margin: '0' }}>Strikezone ERP Data Ingestion</h1>
          <p style={{ margin: '5px 0 0 0' }}>Upload CSV files from any ERP system</p>
        </div>
        <a 
          href="/ceo-dashboard" 
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          }}
        >
          📊 CEO Dashboard
        </a>
      </div>

      <div style={{ border: '2px dashed #ccc', padding: '40px', textAlign: 'center', marginTop: '20px', borderRadius: '8px' }}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <br /><br />
        <button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          style={{
            padding: '12px 24px',
            background: '#3498DB',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: file && !uploading ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
          <strong style={{ color: '#f44336' }}>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px' }}>
          <h3 style={{ color: '#4caf50', margin: '0 0 10px 0' }}>✓ Upload Successful!</h3>
          <p><strong>File:</strong> {result.fileName}</p>
          <p><strong>Type:</strong> {result.fileType}</p>
          <p><strong>Rows Processed:</strong> {result.validation.totalRows}</p>
          <p><strong>Rows Inserted:</strong> {result.ingestion.inserted}</p>
          
          {result.qaReport && Object.keys(result.qaReport.missingValues || {}).length > 0 && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
              <strong>⚠️ Missing Values:</strong>
              <ul>
                {Object.entries(result.qaReport.missingValues).map(([field, data]) => (
                  <li key={field}>{field}: {data.count} rows ({data.percentage}%)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Analytics</h3>
        <button 
          onClick={handleCalculateMetrics}
          style={{
            padding: '10px 20px',
            background: '#27AE60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Calculate Top 20% Metrics
        </button>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Run this after uploading Customers and Orders data
        </p>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' }}>
        <h4>Supported Files:</h4>
        <ul>
          <li>Customers.csv</li>
          <li>Orders.csv</li>
          <li>OrderLines.csv</li>
          <li>Products.csv</li>
        </ul>
      </div>
    </div>
  );
}
