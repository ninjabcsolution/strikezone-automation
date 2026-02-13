# Phase 1 Implementation (Part 3) — React Frontend

## Frontend Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Frontend Structure                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  App.jsx (Main Container)                                 │
│    ├─ FileUpload.jsx (Upload UI)                          │
│    ├─ ValidationReport.jsx (Validation Results)           │
│    └─ QAReport.jsx (Data Quality Report)                  │
│                                                            │
│  API Service (axios)                                       │
│    └─ /api/upload endpoint                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Step 1: Frontend Package Setup

### Create `frontend/package.json`

```json
{
  "name": "strikezone-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "axios": "^1.6.0",
    "react-dropzone": "^14.2.3",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

---

## Step 2: Next.js Configuration

### Create `frontend/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
}

module.exports = nextConfig
```

### Create `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Step 3: Tailwind CSS Setup

### Create `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003366',
        accent: '#3498DB',
        success: '#27AE60',
        error: '#E74C3C',
        warning: '#F39C12',
      },
    },
  },
  plugins: [],
}
```

### Create `frontend/src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

---

## Step 4: API Service

### Create `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Failed to upload file');
  }
};

export const getIngestionLogs = async () => {
  try {
    const response = await api.get('/api/upload/logs');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch logs');
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    throw new Error('API is not available');
  }
};

export default api;
```

---

## Step 5: File Upload Component

### Create `frontend/src/components/FileUpload.jsx`

```javascript
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadedFile({ name: file.name, size: file.size });

    try {
      const { uploadCSV } = await import('../services/api');
      const result = await uploadCSV(file);
      onUploadSuccess(result);
    } catch (error) {
      onUploadError(error);
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          ERP Data Ingestion
        </h1>
        <p className="text-gray-600">
          Upload CSV files (Customers, Orders, Order Lines, Products)
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-accent bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent hover:bg-gray-50'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <Upload className={`w-16 h-16 mb-4 ${uploading ? 'text-gray-400' : 'text-accent'}`} />
          
          {uploading ? (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Uploading {uploadedFile?.name}...
              </p>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-accent animate-pulse"></div>
              </div>
            </>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-accent">
              Drop the CSV file here...
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop a CSV file here
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to select</p>
              <button className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors">
                Select File
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Supported Files:</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-accent" />
            Customers.csv (customer_id, customer_name, industry, etc.)
          </li>
          <li className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-accent" />
            Orders.csv (order_id, order_date, customer_id, revenue, margin)
          </li>
          <li className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-accent" />
            OrderLines.csv (order_line_id, order_id, product_id, etc.)
          </li>
          <li className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-accent" />
            Products.csv (product_id, product_name, product_category)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
```

---

## Step 6: Validation Report Component

### Create `frontend/src/components/ValidationReport.jsx`

```javascript
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ValidationReport = ({ result }) => {
  if (!result) return null;

  const { status, fileType, fileName, validation, ingestion } = result;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 mt-6">
      <div className={`
        rounded-lg p-6 border-2
        ${status === 'success' ? 'bg-green-50 border-success' : 'bg-red-50 border-error'}
      `}>
        <div className="flex items-center mb-4">
          {status === 'success' ? (
            <CheckCircle className="w-8 h-8 text-success mr-3" />
          ) : (
            <XCircle className="w-8 h-8 text-error mr-3" />
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {status === 'success' ? 'Upload Successful' : 'Upload Failed'}
            </h2>
            <p className="text-gray-600">{fileName} ({fileType})</p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Rows</p>
              <p className="text-3xl font-bold text-primary">
                {validation.totalRows}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Rows Inserted</p>
              <p className="text-3xl font-bold text-success">
                {ingestion.inserted}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Validation Errors</p>
              <p className="text-xl font-bold text-error">
                {validation.errorRows} rows failed validation
              </p>
            </div>
          </div>
        )}

        {status === 'validation_failed' && validation.errors && (
          <div className="mt-4 bg-white p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-2">Error Details:</h3>
            <div className="space-y-2">
              {validation.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="text-sm p-2 bg-red-50 rounded">
                  <span className="font-semibold">Row {error.row}:</span>{' '}
                  {error.errors.join(', ')}
                </div>
              ))}
              {validation.errors.length > 10 && (
                <p className="text-sm text-gray-500 italic">
                  ... and {validation.errors.length - 10} more errors
                </p>
              )}
            </div>
          </div>
        )}

        {ingestion?.errors && ingestion.errors.length > 0 && (
          <div className="mt-4 bg-white p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-warning mr-2" />
              <h3 className="font-semibold text-gray-700">
                Partial Success: {ingestion.failed} rows failed to insert
              </h3>
            </div>
            <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
              {ingestion.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="p-2 bg-yellow-50 rounded mb-1">
                  {Object.keys(error)[0]}: {error.error}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationReport;
```

---

## Step 7: QA Report Component

### Create `frontend/src/components/QAReport.jsx`

```javascript
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const QAReport = ({ qaReport }) => {
  if (!qaReport) return null;

  const hasMissingValues = Object.keys(qaReport.missingValues || {}).length > 0;
  const hasDuplicates = Object.keys(qaReport.duplicates || {}).length > 0;

  if (!hasMissingValues && !hasDuplicates) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 mt-6">
        <div className="bg-green-50 border-2 border-success rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-success mr-3" />
            <h3 className="text-lg font-semibold text-success">
              Data Quality: Excellent
            </h3>
          </div>
          <p className="text-gray-600 mt-2">
            No missing values or duplicates detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 mt-6">
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-primary mb-4">
          Data Quality Report
        </h3>

        {hasMissingValues && (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <AlertCircle className="w-5 h-5 text-warning mr-2" />
              <h4 className="font-semibold text-gray-700">Missing Values</h4>
            </div>
            <div className="space-y-2">
              {Object.entries(qaReport.missingValues).map(([field, data]) => (
                <div key={field} className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                  <span className="font-medium">{field}</span>
                  <div className="text-right">
                    <span className="text-warning font-semibold">{data.count} rows</span>
                    <span className="text-gray-500 text-sm ml-2">({data.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasDuplicates && (
          <div>
            <div className="flex items-center mb-3">
              <AlertCircle className="w-5 h-5 text-error mr-2" />
              <h4 className="font-semibold text-gray-700">Duplicate IDs</h4>
            </div>
            <div className="space-y-2">
              {Object.entries(qaReport.duplicates).map(([field, data]) => (
                <div key={field} className="p-3 bg-red-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{field}</span>
                    <span className="text-error font-semibold">{data.count} duplicates</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Examples:</span> {data.examples.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QAReport;
```

---

## Step 8: Main Page

### Create `frontend/src/pages/index.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import FileUpload from '../components/FileUpload';
import ValidationReport from '../components/ValidationReport';
import QAReport from '../components/QAReport';
import { checkHealth } from '../services/api';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(true);

  useEffect(() => {
    // Check API health on mount
    checkHealth()
      .then(() => setApiHealthy(true))
      .catch(() => setApiHealthy(false));
  }, []);

  const handleUploadSuccess = (result) => {
    setUploadResult(result);
    setError(null);
  };

  const handleUploadError = (err) => {
    setError(err);
    setUploadResult(null);
  };

  const handleReset = () => {
    setUploadResult(null);
    setError(null);
  };

  return (
    <>
      <Head>
        <title>Strikezone - ERP Data Ingestion</title>
        <meta name="description" content="ERP-neutral data ingestion system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100 py-8">
        {!apiHealthy && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-50 border-2 border-error rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-error mr-2" />
              <p className="text-error font-semibold">
                Backend API is not available. Please start the backend server.
              </p>
            </div>
          </div>
        )}

        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />

        {error && (
          <div className="w-full max-w-4xl mx-auto p-6 mt-6">
            <div className="bg-red-50 border-2 border-error rounded-lg p-6">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-6 h-6 text-error mr-3" />
                <h3 className="text-lg font-semibold text-error">Upload Error</h3>
              </div>
              <p className="text-gray-700">{error.error || error.message || 'Unknown error'}</p>
              {error.headers && (
                <div className="mt-3 p-3 bg-white rounded text-sm">
                  <p className="font-medium mb-1">Detected headers:</p>
                  <p className="text-gray-600">{error.headers.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {uploadResult && (
          <>
            <ValidationReport result={uploadResult} />
            {uploadResult.qaReport && <QAReport qaReport={uploadResult.qaReport} />}
            
            <div className="w-full max-w-4xl mx-auto p-6 mt-6 text-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Upload Another File
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
```

---

## Step 9: Setup & Run Instructions

### 9.1 Initialize Frontend

```bash
# Navigate to frontend directory
cd /home/ninja/project/KodeLinker/ERP/phase1-app/frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start development server
npm run dev
```

### 9.2 Access the Application

Open browser: **http://localhost:3000**

---

## Step 10: Testing Phase 1 End-to-End

### Test with sample data:

```bash
# 1. Start PostgreSQL (if not running)
sudo systemctl start postgresql

# 2. Start backend (terminal 1)
cd /home/ninja/project/KodeLinker/ERP/phase1-app/backend
npm run dev

# 3. Start frontend (terminal 2)
cd /home/ninja/project/KodeLinker/ERP/phase1-app/frontend
npm run dev

# 4. Open browser
# http://localhost:3000

# 5. Upload test files
# - sample_data_ceo/Customers.csv
# - sample_data_ceo/Orders.csv
# - sample_data_ceo/OrderLines.csv
# - sample_data_ceo/Products.csv
```

---

## Phase 1 Complete! ✅

You now have a fully functional ERP-neutral data ingestion system.

### What works:
- ✅ CSV file upload
- ✅ Automatic file type detection
- ✅ Row-by-row validation
- ✅ Data quality reporting
- ✅ PostgreSQL storage
- ✅ Audit logging
- ✅ Professional UI

### Next Phase:
**Phase 2** - Top 20% Engine + ICP Extraction + Look-Alikes
