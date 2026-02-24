import { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout';
import { getApiUrl } from '../utils/api';

const getAPI_URL = () => typeof window !== 'undefined' ? getApiUrl() : 'http://localhost:5002';

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(num);
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat('en-US').format(num);
}

export default function ApprovalPortal() {
  const [actor, setActor] = useState('local-dev');

  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [tierFilter, setTierFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [query, setQuery] = useState('');

  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [apolloQuery, setApolloQuery] = useState('industrial');
  const [apolloLoading, setApolloLoading] = useState(false);

  const [winbackInactiveDays, setWinbackInactiveDays] = useState(180);
  const [winbackLimit, setWinbackLimit] = useState(200);
  const [winbackLoading, setWinbackLoading] = useState(false);

  const [pbiJsonText, setPbiJsonText] = useState('');
  const [pbiImporting, setPbiImporting] = useState(false);
  const [pbiCsvFile, setPbiCsvFile] = useState(null);
  const [pbiCsvImporting, setPbiCsvImporting] = useState(false);
  const [pbiFileInputKey, setPbiFileInputKey] = useState(0);

  const [createForm, setCreateForm] = useState({
    company_name: '',
    domain: '',
    industry: '',
    state: '',
    employee_count: '',
    annual_revenue: '',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (tierFilter) params.set('tier', tierFilter);
    if (sourceFilter) params.set('source', sourceFilter);
    if (segmentFilter) params.set('segment', segmentFilter);
    if (query) params.set('q', query);
    return `${getAPI_URL()}/api/targets/export.csv?${params.toString()}`;
  }, [statusFilter, tierFilter, sourceFilter, segmentFilter, query]);

  const fetchTargets = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', '200');
      if (statusFilter) params.set('status', statusFilter);
      if (tierFilter) params.set('tier', tierFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      if (segmentFilter) params.set('segment', segmentFilter);
      if (query) params.set('q', query);

      const res = await fetch(`${getAPI_URL()}/api/targets?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch targets');
      setTargets(data.targets || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTarget = async (targetId, patch) => {
    setError(null);
    const res = await fetch(`${getAPI_URL()}/api/targets/${targetId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor': actor,
      },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to update target');
    return data.target;
  };

  const approveTarget = async (targetId, action) => {
    setError(null);
    const res = await fetch(`${getAPI_URL()}/api/targets/${targetId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor': actor,
      },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to approve target');
    return data.target;
  };

  const handleGenerateFromApollo = async () => {
    setApolloLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getAPI_URL()}/api/lookalike/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Actor': actor,
        },
        body: JSON.stringify({ q: apolloQuery, perPage: 25, page: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to generate from Apollo');
      toast.success(`Apollo generation complete. Inserted: ${data.inserted}, Updated: ${data.updated}, Fetched: ${data.totalFetched}`);
      await fetchTargets();
    } catch (e) {
      setError(e.message);
    } finally {
      setApolloLoading(false);
    }
  };

  const handleGenerateWinback = async () => {
    setWinbackLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getAPI_URL()}/api/winback/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Actor': actor,
        },
        body: JSON.stringify({ inactiveDays: Number(winbackInactiveDays), limit: Number(winbackLimit) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to generate win-back targets');
      toast.success(`Win-back generation complete. Inserted: ${data.inserted}, Updated: ${data.updated}, Candidates: ${data.totalCandidates}`);
      await fetchTargets();
    } catch (e) {
      setError(e.message);
    } finally {
      setWinbackLoading(false);
    }
  };

  const handleImportPowerBIJson = async () => {
    setPbiImporting(true);
    setError(null);
    try {
      const records = JSON.parse(pbiJsonText || '[]');
      if (!Array.isArray(records)) throw new Error('Power BI JSON must be an array of records');

      const res = await fetch(`${getAPI_URL()}/api/powerbi/import/targets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Actor': actor,
        },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to import Power BI targets');
      toast.success(`Imported from Power BI. Inserted: ${data.inserted}, Updated: ${data.updated}, Failed: ${data.failed}`);
      setPbiJsonText('');
      await fetchTargets();
    } catch (e) {
      setError(e.message);
    } finally {
      setPbiImporting(false);
    }
  };

  const handleImportPowerBICsv = async () => {
    if (!pbiCsvFile) return;
    setPbiCsvImporting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', pbiCsvFile);

      const res = await fetch(`${getAPI_URL()}/api/powerbi/import/targets-csv`, {
        method: 'POST',
        headers: {
          'X-Actor': actor,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to import Power BI CSV');
      toast.success(`Imported Power BI CSV. Rows: ${data.totalRows}. Inserted: ${data.inserted}, Updated: ${data.updated}, Failed: ${data.failed}`);
      setPbiCsvFile(null);
      setPbiFileInputKey((k) => k + 1);
      await fetchTargets();
    } catch (e) {
      setError(e.message);
    } finally {
      setPbiCsvImporting(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const payload = {
        company_name: createForm.company_name || undefined,
        domain: createForm.domain || undefined,
        industry: createForm.industry || undefined,
        state: createForm.state || undefined,
        employee_count: createForm.employee_count ? Number(createForm.employee_count) : undefined,
        annual_revenue: createForm.annual_revenue ? Number(createForm.annual_revenue) : undefined,
        notes: createForm.notes || undefined,
        source: 'manual',
      };

      const res = await fetch(`${getAPI_URL()}/api/targets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Actor': actor,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create target');

      setCreateForm({
        company_name: '',
        domain: '',
        industry: '',
        state: '',
        employee_count: '',
        annual_revenue: '',
        notes: '',
      });
      await fetchTargets();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Target Approval Portal</h1>
            <div style={styles.subtitle}>Phase 3 • Scoring + Review + Approvals + Export</div>
          </div>
        </div>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Session</h2>
        <div style={styles.row}>
          <label style={styles.label}>Actor (audit log)</label>
          <input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            style={styles.input}
            placeholder="e.g. konnor / sales-manager@client"
          />
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Generate (Apollo)</h2>
        <div style={styles.row}>
          <label style={styles.label}>Search query</label>
          <input value={apolloQuery} onChange={(e) => setApolloQuery(e.target.value)} style={styles.input} />
          <button
            onClick={handleGenerateFromApollo}
            disabled={apolloLoading}
            style={{ ...styles.button, background: apolloLoading ? '#999' : '#6C5CE7' }}
          >
            {apolloLoading ? 'Generating…' : 'Generate from Apollo'}
          </button>
        </div>
        <div style={styles.hint}>
          Requires <code>APOLLO_API_KEY</code> in <code>backend/.env</code>. If unset, you’ll see “APOLLO_API_KEY is not set”.
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Generate (Win-back)</h2>
        <div style={styles.row}>
          <label style={styles.label}>Inactive Days</label>
          <input
            type="number"
            value={winbackInactiveDays}
            onChange={(e) => setWinbackInactiveDays(e.target.value)}
            style={styles.input}
          />
          <label style={styles.label}>Limit</label>
          <input
            type="number"
            value={winbackLimit}
            onChange={(e) => setWinbackLimit(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={handleGenerateWinback}
            disabled={winbackLoading}
            style={{ ...styles.button, background: winbackLoading ? '#999' : '#E67E22' }}
          >
            {winbackLoading ? 'Generating…' : 'Generate Win-back Targets'}
          </button>
        </div>
        <div style={styles.hint}>
          Creates targets from existing customers who have been inactive for N days but were historically high-margin.
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Import Targets (Power BI Export)</h2>
        <div style={styles.hint}>
          Upload the CSV you exported from Power BI (recommended), or paste a JSON array.
          Each record should include at least <code>company_name</code> and one stable ID
          (<code>account_id</code> recommended, otherwise <code>domain</code>).
        </div>

        <div style={{ ...styles.row, marginTop: 10 }}>
          <label style={styles.label}>CSV file</label>
          <input
            key={pbiFileInputKey}
            type="file"
            accept=".csv"
            onChange={(e) => setPbiCsvFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />
          <button
            onClick={handleImportPowerBICsv}
            disabled={pbiCsvImporting || !pbiCsvFile}
            style={{ ...styles.button, background: pbiCsvImporting ? '#999' : '#F39C12' }}
          >
            {pbiCsvImporting ? 'Importing…' : 'Import Power BI CSV'}
          </button>
        </div>

        <div style={styles.hint}>
          Recommended columns: <code>account_id</code>, <code>company_name</code>, <code>domain</code>, <code>tier</code>, <code>segment</code>,
          <code>similarity_score</code>, <code>opportunity_score</code>, <code>reason_codes</code>.
        </div>

        <textarea
          value={pbiJsonText}
          onChange={(e) => setPbiJsonText(e.target.value)}
          placeholder='[
  { "account_id": "PBI-001", "company_name": "Acme", "domain": "acme.com", "tier": "A", "segment": "Strategic" }
]'
          style={styles.textarea}
        />
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleImportPowerBIJson}
            disabled={pbiImporting || !pbiJsonText.trim()}
            style={{ ...styles.button, background: pbiImporting ? '#999' : '#F39C12' }}
          >
            {pbiImporting ? 'Importing…' : 'Import from Power BI (JSON)'}
          </button>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Create Target (Manual)</h2>
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Company name*"
            value={createForm.company_name}
            onChange={(e) => setCreateForm((p) => ({ ...p, company_name: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Domain"
            value={createForm.domain}
            onChange={(e) => setCreateForm((p) => ({ ...p, domain: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Industry"
            value={createForm.industry}
            onChange={(e) => setCreateForm((p) => ({ ...p, industry: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="State (e.g. TX)"
            value={createForm.state}
            onChange={(e) => setCreateForm((p) => ({ ...p, state: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Employee count"
            value={createForm.employee_count}
            onChange={(e) => setCreateForm((p) => ({ ...p, employee_count: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Annual revenue"
            value={createForm.annual_revenue}
            onChange={(e) => setCreateForm((p) => ({ ...p, annual_revenue: e.target.value }))}
          />
          <input
            style={{ ...styles.input, gridColumn: '1 / -1' }}
            placeholder="Notes"
            value={createForm.notes}
            onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleCreate}
            disabled={creating || !createForm.company_name}
            style={{ ...styles.button, background: creating ? '#999' : '#2ECC71' }}
          >
            {creating ? 'Creating…' : 'Create Target'}
          </button>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Targets</h2>

        <div style={styles.filters}>
          <div style={styles.filterItem}>
            <label style={styles.label}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
              <option value="">All</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={styles.filterItem}>
            <label style={styles.label}>Tier</label>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} style={styles.select}>
              <option value="">All</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div style={styles.filterItem}>
            <label style={styles.label}>Source</label>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={styles.select}>
              <option value="">All</option>
              <option value="powerbi">Power BI</option>
              <option value="winback">Win-back</option>
              <option value="manual">Manual</option>
              <option value="apollo">Apollo</option>
            </select>
          </div>

          <div style={styles.filterItem}>
            <label style={styles.label}>Segment</label>
            <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} style={styles.select}>
              <option value="">All</option>
              <option value="Strategic">Strategic</option>
              <option value="WinBack">WinBack</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div style={{ ...styles.filterItem, flex: 2 }}>
            <label style={styles.label}>Search</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} style={styles.input} placeholder="Company/domain" />
          </div>

          <div style={styles.filterActions}>
            <button onClick={fetchTargets} style={{ ...styles.button, background: '#3498DB' }}>
              Refresh
            </button>
            <a href={exportUrl} style={{ ...styles.button, background: '#34495E', textDecoration: 'none' }}>
              Export CSV
            </a>
          </div>
        </div>

        {error && <div style={styles.error}>Error: {error}</div>}

        {loading ? (
          <div style={styles.hint}>Loading targets…</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={{ ...styles.th, textAlign: 'left' }}>Company</th>
                  <th style={{ ...styles.th, textAlign: 'left' }}>Industry</th>
                  <th style={styles.th}>State</th>
                  <th style={styles.th}>Employees</th>
                  <th style={styles.th}>Revenue</th>
                  <th style={styles.th}>Tier</th>
                  <th style={styles.th}>Segment</th>
                  <th style={styles.th}>Similarity</th>
                  <th style={styles.th}>Opportunity</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => (
                  <TargetRow
                    key={t.target_id}
                    target={t}
                    onUpdate={async (patch) => {
                      const updated = await updateTarget(t.target_id, patch);
                      setTargets((prev) => prev.map((x) => (x.target_id === t.target_id ? updated : x)));
                    }}
                    onApprove={async (action) => {
                      const updated = await approveTarget(t.target_id, action);
                      setTargets((prev) => prev.map((x) => (x.target_id === t.target_id ? updated : x)));
                    }}
                  />
                ))}
              </tbody>
            </table>

            {targets.length === 0 && <div style={styles.hint}>No targets match the current filters.</div>}
          </div>
        )}
      </section>
    </div>
  </Layout>
);
}

function TargetRow({ target, onUpdate, onApprove }) {
  const [tier, setTier] = useState(target.tier || 'C');
  const [notes, setNotes] = useState(target.notes || '');
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({ tier, notes });
    } finally {
      setSaving(false);
    }
  };

  const approve = async (action) => {
    setApproving(true);
    try {
      await onApprove(action);
    } finally {
      setApproving(false);
    }
  };

  return (
    <tr>
      <td style={styles.td}>{target.target_id}</td>
      <td style={{ ...styles.td, textAlign: 'left' }}>
        <div style={{ fontWeight: 700 }}>{target.company_name}</div>
        <div style={{ fontSize: 12, color: '#666' }}>{target.domain || ''}</div>
        {Array.isArray(target.reason_codes) && target.reason_codes.length > 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#444' }}>
            <strong>Reasons:</strong> {target.reason_codes.join(' • ')}
          </div>
        )}
      </td>
      <td style={{ ...styles.td, textAlign: 'left' }}>{target.industry || '—'}</td>
      <td style={styles.td}>{target.state || '—'}</td>
      <td style={styles.td}>{formatNumber(target.employee_count)}</td>
      <td style={styles.td}>{formatCurrency(target.annual_revenue)}</td>
      <td style={styles.td}>
        <select value={tier} onChange={(e) => setTier(e.target.value)} style={styles.inlineSelect}>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </td>
      <td style={styles.td}>{target.segment || '—'}</td>
      <td style={styles.td}>{formatNumber(target.similarity_score)}</td>
      <td style={styles.td}>{formatNumber(target.opportunity_score)}</td>
      <td style={styles.td}>{target.status}</td>
      <td style={styles.td}>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} style={styles.inlineInput} placeholder="Notes" />
        <div style={{ marginTop: 6 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{ ...styles.miniButton, background: saving ? '#999' : '#3498DB' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </td>
      <td style={styles.td}>
        <button
          onClick={() => approve('approved')}
          disabled={approving}
          style={{ ...styles.miniButton, background: '#2ECC71', marginRight: 8 }}
        >
          Approve
        </button>
        <button
          onClick={() => approve('rejected')}
          disabled={approving}
          style={{ ...styles.miniButton, background: '#E74C3C' }}
        >
          Reject
        </button>
      </td>
    </tr>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 18,
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
  nav: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  navLink: {
    color: '#3498DB',
    textDecoration: 'none',
    fontWeight: 700,
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
    flexWrap: 'wrap',
  },
  label: {
    minWidth: 120,
    fontSize: 13,
    color: '#555',
    fontWeight: 700,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
    flex: 1,
    minWidth: 220,
  },
  fileInput: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
    flex: 2,
    minWidth: 260,
    background: 'white',
  },
  select: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
    minWidth: 180,
  },
  button: {
    display: 'inline-block',
    padding: '10px 14px',
    borderRadius: 8,
    border: 'none',
    color: 'white',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 14,
  },
  miniButton: {
    display: 'inline-block',
    padding: '8px 10px',
    borderRadius: 8,
    border: 'none',
    color: 'white',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 12,
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
  filters: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  filterItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  filterActions: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: 10,
    borderBottom: '2px solid #eee',
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  td: {
    padding: 10,
    borderBottom: '1px solid #f0f0f0',
    textAlign: 'center',
    verticalAlign: 'top',
    fontSize: 13,
  },
  inlineInput: {
    width: 220,
    maxWidth: '100%',
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 12,
  },
  inlineSelect: {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 12,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 10,
  },
  textarea: {
    width: '100%',
    minHeight: 160,
    padding: '12px 12px',
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 13,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    marginTop: 10,
  },
};
