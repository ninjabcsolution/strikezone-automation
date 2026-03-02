import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { getApiUrl } from '../utils/api';

const getAPI_URL = () => typeof window !== 'undefined' ? getApiUrl() : 'http://localhost:5002';

function Section({ title, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section style={styles.card}>
      <div 
        style={{ ...styles.sectionHeader, cursor: collapsible ? 'pointer' : 'default' }}
        onClick={() => collapsible && setOpen(!open)}
      >
        <h2 style={styles.sectionTitle}>
          {collapsible && <span style={{ marginRight: 8 }}>{open ? '▼' : '▶'}</span>}
          {title}
        </h2>
      </div>
      {(!collapsible || open) && children}
    </section>
  );
}

function TierBadge({ tier }) {
  const colors = {
    A: { bg: '#27ae60', text: '#fff' },
    B: { bg: '#3498db', text: '#fff' },
    C: { bg: '#f39c12', text: '#fff' },
    D: { bg: '#95a5a6', text: '#fff' },
  };
  const c = colors[tier] || colors.D;
  return (
    <span style={{ ...styles.badge, background: c.bg, color: c.text }}>{tier}</span>
  );
}

function ScoreBar({ value, label, color = '#3498db' }) {
  return (
    <div style={styles.scoreContainer}>
      <div style={styles.scoreLabel}>{label}</div>
      <div style={styles.scoreBarBg}>
        <div style={{ ...styles.scoreBarFill, width: `${value}%`, background: color }} />
      </div>
      <div style={styles.scoreValue}>{value}%</div>
    </div>
  );
}

function ProviderSelect({ providers, selected, onChange, defaultProvider }) {
  return (
    <div style={styles.providerSelect}>
      {providers.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            ...styles.providerBtn,
            background: selected === p ? '#3498db' : '#f0f0f0',
            color: selected === p ? '#fff' : '#333',
          }}
        >
          {p.toUpperCase()}
          {p === defaultProvider && <span style={styles.defaultTag}>default</span>}
        </button>
      ))}
      <button
        onClick={() => onChange('demo')}
        style={{
          ...styles.providerBtn,
          background: selected === 'demo' ? '#9b59b6' : '#f0f0f0',
          color: selected === 'demo' ? '#fff' : '#333',
        }}
      >
        DEMO
      </button>
    </div>
  );
}

export default function LookalikeSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Provider info
  const [providers, setProviders] = useState([]);
  const [defaultProvider, setDefaultProvider] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('demo');

  // Search params
  const [searchQuery, setSearchQuery] = useState('');
  const [useIntent, setUseIntent] = useState(false);
  const [intentKeywords, setIntentKeywords] = useState('');
  const [minBuyingStage, setMinBuyingStage] = useState('Consideration');

  // Results
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);

  // Seed companies (ICP profile)
  const [seedCompanies, setSeedCompanies] = useState([]);
  const [icpProfile, setIcpProfile] = useState(null);

  // Load provider info on mount
  useEffect(() => {
    fetchProviders();
    fetchSeedCompanies();
    fetchIcpProfile();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch(`${getAPI_URL()}/api/lookalike/providers`);
      const data = await res.json();
      if (data.providers) {
        setProviders(data.providers);
        setDefaultProvider(data.default);
        setSelectedProvider(data.default || 'demo');
      }
    } catch (e) {
      console.error('Failed to fetch providers:', e);
    }
  };

  const fetchSeedCompanies = async () => {
    try {
      const res = await fetch(`${getAPI_URL()}/api/lookalike/seed-companies`);
      const data = await res.json();
      if (data.seedCompanies) {
        setSeedCompanies(data.seedCompanies);
      }
    } catch (e) {
      console.error('Failed to fetch seed companies:', e);
    }
  };

  const fetchIcpProfile = async () => {
    try {
      const res = await fetch(`${getAPI_URL()}/api/lookalike/icp-profile`);
      const data = await res.json();
      if (data.profile) {
        setIcpProfile(data.profile);
      }
    } catch (e) {
      console.error('Failed to fetch ICP profile:', e);
    }
  };

  const generateLookalikes = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        provider: selectedProvider,
        page: pageNum,
        perPage,
        useIntent,
      };

      if (useIntent) {
        body.filters = {
          keywords: intentKeywords.split(',').map(k => k.trim()).filter(Boolean),
          minBuyingStage,
        };
      } else if (searchQuery) {
        body.filters = { q: searchQuery };
        body.q = searchQuery; // Legacy support
      }

      const res = await fetch(`${getAPI_URL()}/api/lookalike/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || 'Failed to generate lookalikes');

      setResults(data);
      setPage(pageNum);

      const msg = data.fallbackReason 
        ? `${data.fallbackReason}. Found ${data.totalFetched} companies.`
        : `Found ${data.totalFetched} companies. Inserted: ${data.inserted}, Updated: ${data.updated}`;
      toast.success(msg);
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    generateLookalikes(1);
  };

  const handlePageChange = (newPage) => {
    generateLookalikes(newPage);
  };

  return (
    <Layout>
      <div style={styles.page}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Lookalike Search</h1>
            <div style={styles.subtitle}>
              Phase 2 • Find companies similar to your Top 20% customers
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <Section title="Data Provider">
          <ProviderSelect
            providers={providers}
            selected={selectedProvider}
            onChange={setSelectedProvider}
            defaultProvider={defaultProvider}
          />
          {selectedProvider === 'demo' && (
            <div style={styles.hint}>
              Demo mode generates sample data without requiring API keys.
              Configure APOLLO_API_KEY, ZOOMINFO_API_KEY, or SIXSENSE_API_KEY for real data.
            </div>
          )}
        </Section>

        {/* Search Controls */}
        <Section title="Search Options">
          <div style={styles.searchToggle}>
            <label style={styles.toggleLabel}>
              <input
                type="radio"
                checked={!useIntent}
                onChange={() => setUseIntent(false)}
              />
              <span style={{ marginLeft: 8 }}>Standard Search</span>
            </label>
            <label style={styles.toggleLabel}>
              <input
                type="radio"
                checked={useIntent}
                onChange={() => setUseIntent(true)}
              />
              <span style={{ marginLeft: 8 }}>Intent-Based Search</span>
            </label>
          </div>

          {!useIntent ? (
            <div style={styles.row}>
              <input
                type="text"
                placeholder="Search query (industry, company name, etc.)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.input}
              />
            </div>
          ) : (
            <>
              <div style={styles.row}>
                <label style={styles.label}>Intent Keywords</label>
                <input
                  type="text"
                  placeholder="e.g., industrial supplies, manufacturing equipment"
                  value={intentKeywords}
                  onChange={(e) => setIntentKeywords(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.row}>
                <label style={styles.label}>Min Buying Stage</label>
                <select
                  value={minBuyingStage}
                  onChange={(e) => setMinBuyingStage(e.target.value)}
                  style={styles.select}
                >
                  <option value="Awareness">Awareness</option>
                  <option value="Consideration">Consideration</option>
                  <option value="Decision">Decision</option>
                  <option value="Purchase">Purchase</option>
                </select>
              </div>
            </>
          )}

          <button 
            onClick={handleSearch} 
            style={styles.searchBtn}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Generate Lookalikes'}
          </button>
        </Section>

        {error && <div style={styles.error}>Error: {error}</div>}

        {/* ICP Profile Preview */}
        <Section title="ICP Profile (Seed Criteria)" collapsible defaultOpen={false}>
          {icpProfile ? (
            <div style={styles.icpGrid}>
              <div style={styles.icpCard}>
                <h4 style={styles.icpTitle}>Top Industries</h4>
                {icpProfile.industries?.slice(0, 5).map((i, idx) => (
                  <div key={idx} style={styles.icpItem}>
                    {i.value} <span style={styles.icpWeight}>({(i.weight * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
              <div style={styles.icpCard}>
                <h4 style={styles.icpTitle}>Top States</h4>
                {icpProfile.states?.slice(0, 5).map((s, idx) => (
                  <div key={idx} style={styles.icpItem}>
                    {s.value} <span style={styles.icpWeight}>({(s.weight * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
              <div style={styles.icpCard}>
                <h4 style={styles.icpTitle}>Employee Count</h4>
                <div style={styles.icpItem}>
                  {icpProfile.employeeCount?.p25?.toLocaleString() || 'N/A'} - {icpProfile.employeeCount?.p75?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div style={styles.icpCard}>
                <h4 style={styles.icpTitle}>Annual Revenue</h4>
                <div style={styles.icpItem}>
                  ${(icpProfile.annualRevenue?.p25 / 1000000)?.toFixed(1) || 'N/A'}M - ${(icpProfile.annualRevenue?.p75 / 1000000)?.toFixed(1) || 'N/A'}M
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.hint}>Loading ICP profile...</div>
          )}
        </Section>

        {/* Seed Companies */}
        <Section title={`Seed Companies (${seedCompanies.length})`} collapsible defaultOpen={false}>
          <div style={styles.seedGrid}>
            {seedCompanies.slice(0, 10).map((c, idx) => (
              <div key={idx} style={styles.seedCard}>
                <div style={styles.seedName}>{c.company_name}</div>
                <div style={styles.seedInfo}>{c.industry || 'N/A'} • {c.state || 'N/A'}</div>
                {c.total_gross_margin && (
                  <div style={styles.seedMargin}>
                    Margin: ${(c.total_gross_margin / 1000).toFixed(0)}K
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={styles.hint}>
            These are your Top 20% customers by margin, used as the basis for finding similar companies.
          </div>
        </Section>

        {/* Results */}
        {results && (
          <Section title={`Results (${results.totalFetched} found)`}>
            {results.note && <div style={styles.hint}>{results.note}</div>}
            
            <div style={styles.resultsMeta}>
              <span>Provider: <strong>{results.provider}</strong></span>
              <span>Inserted: <strong>{results.inserted}</strong></span>
              <span>Updated: <strong>{results.updated}</strong></span>
            </div>

            <div style={styles.resultsGrid}>
              {(results.companies || []).map((c, idx) => (
                <div key={idx} style={styles.resultCard}>
                  <div style={styles.resultHeader}>
                    <TierBadge tier={c.tier} />
                    <span style={styles.resultName}>{c.company_name}</span>
                  </div>
                  
                  <div style={styles.resultDetails}>
                    <div>{c.industry || 'N/A'}</div>
                    <div>{c.city}, {c.state} • {c.country}</div>
                    <div>
                      {c.employee_count?.toLocaleString() || 'N/A'} employees
                      {c.annual_revenue && ` • $${(c.annual_revenue / 1000000).toFixed(1)}M revenue`}
                    </div>
                  </div>

                  <ScoreBar 
                    value={c.similarityScore || c.similarity_score || 0} 
                    label="Similarity" 
                    color="#27ae60" 
                  />
                  <ScoreBar 
                    value={c.opportunityScore || c.opportunity_score || 0} 
                    label="Opportunity" 
                    color="#3498db" 
                  />

                  {c.reasonCodes && c.reasonCodes.length > 0 && (
                    <div style={styles.reasonCodes}>
                      {c.reasonCodes.slice(0, 3).map((code, i) => (
                        <span key={i} style={styles.reasonCode}>{code}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {results.pagination && (
              <Pagination
                currentPage={page}
                totalPages={Math.ceil((results.pagination.totalResults || 100) / perPage)}
                onPageChange={handlePageChange}
              />
            )}
          </Section>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  page: {
    maxWidth: 1200,
    margin: '24px auto',
    padding: '0 16px 60px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: '#2c3e50',
  },
  subtitle: {
    marginTop: 6,
    color: '#555',
    fontSize: 14,
  },
  card: {
    background: 'white',
    border: '1px solid #eee',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    marginBottom: 16,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: 16,
    fontWeight: 800,
    color: '#2c3e50',
  },
  row: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  label: {
    minWidth: 140,
    fontSize: 13,
    color: '#555',
    fontWeight: 700,
  },
  input: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
    minWidth: 250,
  },
  select: {
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
    minWidth: 180,
  },
  searchBtn: {
    padding: '12px 24px',
    borderRadius: 8,
    border: 'none',
    background: '#27ae60',
    color: 'white',
    fontWeight: 800,
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginTop: 10,
  },
  error: {
    padding: 12,
    background: '#ffebee',
    border: '1px solid #f44336',
    borderRadius: 8,
    color: '#b71c1c',
    fontWeight: 700,
    marginBottom: 12,
  },
  providerSelect: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  providerBtn: {
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 12,
    position: 'relative',
  },
  defaultTag: {
    position: 'absolute',
    top: -6,
    right: -6,
    background: '#27ae60',
    color: 'white',
    fontSize: 8,
    padding: '2px 4px',
    borderRadius: 4,
  },
  searchToggle: {
    display: 'flex',
    gap: 24,
    marginBottom: 16,
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  icpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
  },
  icpCard: {
    background: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  icpTitle: {
    margin: '0 0 8px 0',
    fontSize: 13,
    fontWeight: 700,
    color: '#555',
  },
  icpItem: {
    fontSize: 13,
    marginBottom: 4,
  },
  icpWeight: {
    color: '#888',
    fontSize: 11,
  },
  seedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 10,
    marginBottom: 12,
  },
  seedCard: {
    background: '#f0f7ff',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #d0e3ff',
  },
  seedName: {
    fontWeight: 700,
    fontSize: 13,
    color: '#2c3e50',
    marginBottom: 4,
  },
  seedInfo: {
    fontSize: 11,
    color: '#666',
  },
  seedMargin: {
    fontSize: 11,
    color: '#27ae60',
    fontWeight: 600,
    marginTop: 4,
  },
  resultsMeta: {
    display: 'flex',
    gap: 24,
    marginBottom: 16,
    fontSize: 13,
    color: '#555',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16,
  },
  resultCard: {
    background: '#fafafa',
    border: '1px solid #eee',
    borderRadius: 10,
    padding: 14,
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  resultName: {
    fontWeight: 700,
    fontSize: 14,
    color: '#2c3e50',
  },
  resultDetails: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 6,
    fontWeight: 800,
    fontSize: 12,
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#666',
    minWidth: 70,
  },
  scoreBarBg: {
    flex: 1,
    height: 8,
    background: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: 700,
    minWidth: 35,
    textAlign: 'right',
  },
  reasonCodes: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  reasonCode: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
  },
};
