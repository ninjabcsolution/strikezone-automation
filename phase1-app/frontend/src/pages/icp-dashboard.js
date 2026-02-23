import { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function Section({ title, children, right }) {
  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function TraitTable({ rows }) {
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, textAlign: 'left' }}>Trait</th>
            <th style={styles.th}>Top20%</th>
            <th style={styles.th}>Others</th>
            <th style={styles.th}>Lift</th>
            <th style={styles.th}>Importance</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((r) => (
            <tr key={`${r.trait_name}:${r.trait_value}`}>
              <td style={{ ...styles.td, textAlign: 'left', fontWeight: 700 }}>{r.trait_value}</td>
              <td style={styles.td}>{r.top20_frequency}%</td>
              <td style={styles.td}>{r.others_frequency}%</td>
              <td style={styles.td}>{r.lift}</td>
              <td style={styles.td}>{r.importance_score}</td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && (
            <tr>
              <td style={styles.td} colSpan={5}>
                No traits yet. Click “Recalculate ICP Traits”.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function IcpDashboard() {
  const [actor, setActor] = useState('local-dev');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(null);

  const exportCsvUrl = useMemo(() => `${API_URL}/api/icp/export.csv`, []);
  const exportMdUrl = useMemo(() => `${API_URL}/api/icp/export.md`, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, fRes] = await Promise.all([
        fetch(`${API_URL}/api/icp/summary`),
        fetch(`${API_URL}/api/icp/external-filters`),
      ]);
      const sData = await sRes.json();
      const fData = await fRes.json();

      if (!sRes.ok) throw new Error(sData?.message || 'Failed to load ICP summary');
      if (!fRes.ok) throw new Error(fData?.message || 'Failed to load external filters');

      setSummary(sData.summary);
      setFilters(fData.filters);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recalc = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/icp/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Actor': actor },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'ICP calculate failed');
      await fetchAll();
      toast.success(`ICP traits recalculated. Inserted: ${data.inserted}`);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>ICP Dashboard</h1>
            <div style={styles.subtitle}>Phase 2B • Trait extraction (Top20 vs Others) + export-ready filters</div>
          </div>
        </div>

      <Section
        title="Session"
        right={(
          <button onClick={recalc} style={{ ...styles.button, background: '#6C5CE7' }} disabled={loading}>
            {loading ? 'Working…' : 'Recalculate ICP Traits'}
          </button>
        )}
      >
        <div style={styles.row}>
          <label style={styles.label}>Actor (audit log)</label>
          <input value={actor} onChange={(e) => setActor(e.target.value)} style={styles.input} />
        </div>
        <div style={styles.hint}>Run this after Top20 metrics have been calculated.</div>
      </Section>

      {error && <div style={styles.error}>Error: {error}</div>}
      {loading && <div style={styles.hint}>Loading…</div>}

      <Section
        title="Exports"
        right={(
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={exportCsvUrl} style={{ ...styles.button, background: '#34495E', textDecoration: 'none' }}>Download Traits CSV</a>
            <a href={exportMdUrl} style={{ ...styles.button, background: '#3498DB', textDecoration: 'none' }}>Download ICP Summary (MD)</a>
          </div>
        )}
      >
        <div style={styles.hint}>
          Use these exports to review/approve ICP assumptions and hand off filter values to outbound tools.
        </div>
      </Section>

      <Section title="External Filters (Apollo/LinkedIn UI)">
        <div style={styles.hint}>Vendor-agnostic values derived from lift analysis + Top20 percentiles.</div>
        <pre style={styles.pre}>{JSON.stringify(filters || {}, null, 2)}</pre>
      </Section>

      <Section title="Top Industries">
        <TraitTable rows={summary?.industries || []} />
      </Section>
      <Section title="Top States">
        <TraitTable rows={summary?.states || []} />
      </Section>
      <Section title="Top NAICS">
        <TraitTable rows={summary?.naics || []} />
      </Section>
        <Section title="Top Product Categories">
          <TraitTable rows={summary?.productCategories || []} />
        </Section>
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
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
  pre: {
    whiteSpace: 'pre-wrap',
    padding: 12,
    borderRadius: 10,
    border: '1px solid #eee',
    background: '#fafafa',
    fontSize: 12,
    marginTop: 10,
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
};
