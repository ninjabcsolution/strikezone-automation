import { useState, useEffect } from 'react';
import { HiLightBulb, HiTarget, HiTrendingUp, HiChartBar, HiSwitchHorizontal } from 'react-icons/hi';
import Layout from '../components/Layout';
import { getApiUrl } from '../utils/api';

const getAPI_URL = () => typeof window !== 'undefined' ? getApiUrl() : 'http://localhost:5002';

export default function CEODashboard() {
  const [stats, setStats] = useState(null);
  const [top20Customers, setTop20Customers] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [cagrAnalysis, setCagrAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rankBy, setRankBy] = useState('margin');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (comparison) {
      fetchComparison();
    }
  }, [rankBy]);

  const fetchData = async () => {
    try {
      const API_URL = getAPI_URL();
      const [statsRes, customersRes, comparisonRes, cagrRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/stats`),
        fetch(`${API_URL}/api/analytics/top20?limit=10`),
        fetch(`${API_URL}/api/analytics/top20-comparison?rankBy=${rankBy}`),
        fetch(`${API_URL}/api/analytics/cagr-analysis?limit=50`)
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setTop20Customers(customersData.customers);
      }
      if (comparisonRes.ok) {
        const compData = await comparisonRes.json();
        setComparison(compData);
      }
      if (cagrRes.ok) {
        const cagrData = await cagrRes.json();
        setCagrAnalysis(cagrData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    try {
      const API_URL = getAPI_URL();
      const res = await fetch(`${API_URL}/api/analytics/top20-comparison?rankBy=${rankBy}`);
      if (res.ok) {
        const data = await res.json();
        setComparison(data);
      }
    } catch (error) {
      console.error('Failed to fetch comparison:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading CEO Dashboard...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Strikezone Intelligence</h1>
            <p style={styles.subtitle}>Data-Driven Customer Insights</p>
          </div>
          <button style={styles.refreshBtn} onClick={fetchData}>↻ Refresh</button>
        </div>

      {/* Hero KPI - Top 20% Contribution */}
      <div style={styles.heroCard}>
        <div style={styles.heroContent}>
          <div style={styles.heroLabel}>TOP 20% CUSTOMERS GENERATE</div>
          <div style={styles.heroValue}>{stats?.top20Contribution || 0}%</div>
          <div style={styles.heroSubtext}>of Total Gross Margin</div>
        </div>
        <div style={styles.heroStats}>
          <div style={styles.heroStatItem}>
            <div style={styles.heroStatValue}>{stats?.top20Count || 0}</div>
            <div style={styles.heroStatLabel}>Elite Customers</div>
          </div>
          <div style={styles.heroStatDivider}></div>
          <div style={styles.heroStatItem}>
            <div style={styles.heroStatValue}>{stats?.totalCustomers || 0}</div>
            <div style={styles.heroStatLabel}>Total Customers</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        <div style={{...styles.kpiCard, borderTop: '4px solid #3498DB'}}>
          <div style={styles.kpiLabel}>Top 20% Avg Margin</div>
          <div style={styles.kpiValue}>{formatCurrency(stats?.top20AvgMargin)}</div>
          <div style={styles.kpiTrend}>↑ {((stats?.top20AvgMargin / stats?.othersAvgMargin - 1) * 100).toFixed(0)}% vs Others</div>
        </div>
        
        <div style={{...styles.kpiCard, borderTop: '4px solid #27AE60'}}>
          <div style={styles.kpiLabel}>Others Avg Margin</div>
          <div style={styles.kpiValue}>{formatCurrency(stats?.othersAvgMargin)}</div>
          <div style={styles.kpiSubtext}>Bottom 80%</div>
        </div>
        
        <div style={{...styles.kpiCard, borderTop: '4px solid #E74C3C'}}>
          <div style={styles.kpiLabel}>Margin Multiplier</div>
          <div style={styles.kpiValue}>{((stats?.top20AvgMargin / stats?.othersAvgMargin) || 0).toFixed(1)}x</div>
          <div style={styles.kpiSubtext}>Top 20% Premium</div>
        </div>
        
        <div style={{...styles.kpiCard, borderTop: '4px solid #F39C12'}}>
          <div style={styles.kpiLabel}>Focus Opportunity</div>
          <div style={styles.kpiValue}>{stats?.top20Count || 0}</div>
          <div style={styles.kpiSubtext}>High-Value Targets</div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>🏆 Top 10 Elite Customers</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Rank</th>
                <th style={{...styles.th, textAlign: 'left'}}>Customer</th>
                <th style={{...styles.th, textAlign: 'left'}}>Industry</th>
                <th style={{...styles.th, textAlign: 'left'}}>Location</th>
                <th style={styles.th}>Revenue</th>
                <th style={styles.th}>Margin</th>
                <th style={styles.th}>Margin %</th>
                <th style={styles.th}>Orders</th>
              </tr>
            </thead>
            <tbody>
              {top20Customers.map((customer, index) => (
                <tr key={customer.customer_id} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                  <td style={styles.td}>
                    <span style={index < 3 ? styles.topBadge : styles.rankBadge}>
                      {index + 1}
                    </span>
                  </td>
                  <td style={{...styles.td, fontWeight: '600', textAlign: 'left'}}>{customer.customer_name}</td>
                  <td style={{...styles.td, textAlign: 'left'}}>{customer.industry || 'N/A'}</td>
                  <td style={{...styles.td, textAlign: 'left'}}>{customer.city}, {customer.state}</td>
                  <td style={styles.td}>{formatCurrency(customer.total_revenue)}</td>
                  <td style={{...styles.td, color: '#27AE60', fontWeight: '600'}}>{formatCurrency(customer.total_gross_margin)}</td>
                  <td style={styles.td}>{parseFloat(customer.gross_margin_percent || 0).toFixed(1)}%</td>
                  <td style={styles.td}>{formatNumber(customer.order_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 20% vs 80% Comparison Section */}
      {comparison && (
        <div style={styles.comparisonCard}>
          <div style={styles.comparisonHeader}>
            <h2 style={styles.comparisonTitle}>📊 Top 20% vs 80% Comparison</h2>
            <div style={styles.toggleContainer}>
              <span style={styles.toggleLabel}>Rank by:</span>
              <button 
                style={rankBy === 'margin' ? styles.toggleBtnActive : styles.toggleBtn}
                onClick={() => setRankBy('margin')}
              >
                Margin
              </button>
              <button 
                style={rankBy === 'cagr' ? styles.toggleBtnActive : styles.toggleBtn}
                onClick={() => setRankBy('cagr')}
              >
                3-Year CAGR
              </button>
            </div>
          </div>
          
          {/* Side by Side Metrics */}
          <div style={styles.comparisonGrid}>
            <div style={styles.comparisonGroup}>
              <div style={styles.groupLabel}>🏆 TOP 20%</div>
              <div style={styles.metricRow}>
                <span>Customers:</span>
                <strong>{comparison.top20?.count || 0}</strong>
              </div>
              <div style={styles.metricRow}>
                <span>Avg Order Value:</span>
                <strong>{formatCurrency(comparison.top20?.avgOrderValue)}</strong>
              </div>
              <div style={styles.metricRow}>
                <span>Avg Margin:</span>
                <strong>{formatCurrency(comparison.top20?.avgMargin)}</strong>
              </div>
              <div style={styles.metricRow}>
                <span>Avg Order Frequency:</span>
                <strong>{(comparison.top20?.avgOrderFrequency || 0).toFixed(2)}/mo</strong>
              </div>
              <div style={styles.metricRow}>
                <span>Avg CAGR:</span>
                <strong style={{color: '#27AE60'}}>{((comparison.top20?.avgCagr || 0) * 100).toFixed(1)}%</strong>
              </div>
            </div>
            
            <div style={styles.vsCircle}>VS</div>
            
            <div style={styles.comparisonGroup}>
              <div style={{...styles.groupLabel, background: '#95a5a6'}}>📊 OTHERS (80%)</div>
              <div style={styles.metricRow}>
                <span>Customers:</span>
                <strong>{comparison.others?.count || 0}</strong>
              </div>
              <div style={styles.metricRow}>
                <span>Avg Order Value:</span>
                <strong>{formatCurrency(comparison.others?.avgOrderValue)}</strong>
              </div>
              <div style={styles.metricRow}>
                <span>Avg Margin:</span>
                <strong>{formatCurrency(comparison.others?.avgMargin)}</strong>
              </div>
              <div style={styles.metricRow}>
                <span>Avg Order Frequency:</span>
                <strong>{(comparison.others?.avgOrderFrequency || 0).toFixed(2)}/mo</strong>
              </div>
              <div style={styles.metricRow}>
                <span>Avg CAGR:</span>
                <strong>{((comparison.others?.avgCagr || 0) * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>
          
          {/* Key Differentiators */}
          {comparison.differentiators && comparison.differentiators.length > 0 && (
            <div style={styles.differentiators}>
              <h3 style={styles.diffTitle}>🔍 Key Differentiators</h3>
              <ul style={styles.diffList}>
                {comparison.differentiators.map((diff, idx) => (
                  <li key={idx} style={styles.diffItem}>{diff}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Industry Distribution */}
          {comparison.industries && comparison.industries.length > 0 && (
            <div style={styles.industrySection}>
              <h3 style={styles.diffTitle}>🏭 Top Industries</h3>
              <div style={styles.industryGrid}>
                {comparison.industries.slice(0, 5).map((ind, idx) => (
                  <div key={idx} style={styles.industryItem}>
                    <div style={styles.industryName}>{ind.industry}</div>
                    <div style={styles.industryStats}>
                      <span style={{color: '#27AE60'}}>Top 20%: {ind.top20_count}</span>
                      <span style={{color: '#95a5a6'}}>Others: {ind.others_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CAGR Analysis Section */}
      {cagrAnalysis && cagrAnalysis.summary && (
        <div style={styles.cagrCard}>
          <h2 style={styles.tableTitle}>📈 3-Year Growth Analysis (CAGR)</h2>
          <div style={styles.cagrSummary}>
            <div style={styles.cagrStat}>
              <div style={styles.cagrValue}>{cagrAnalysis.summary.consistentGrowers}</div>
              <div style={styles.cagrLabel}>Consistent Growers</div>
            </div>
            <div style={styles.cagrStat}>
              <div style={{...styles.cagrValue, color: '#27AE60'}}>{cagrAnalysis.summary.growingCount}</div>
              <div style={styles.cagrLabel}>Growing</div>
            </div>
            <div style={styles.cagrStat}>
              <div style={{...styles.cagrValue, color: '#F39C12'}}>{cagrAnalysis.summary.stableCount}</div>
              <div style={styles.cagrLabel}>Stable</div>
            </div>
            <div style={styles.cagrStat}>
              <div style={{...styles.cagrValue, color: '#E74C3C'}}>{cagrAnalysis.summary.decliningCount}</div>
              <div style={styles.cagrLabel}>Declining</div>
            </div>
            <div style={styles.cagrStat}>
              <div style={{...styles.cagrValue, color: '#3498DB'}}>{cagrAnalysis.summary.newCount}</div>
              <div style={styles.cagrLabel}>New Customers</div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div style={styles.insightsGrid}>
        <div style={styles.insightCard}>
          <div style={styles.insightIconWrap}>
            <HiLightBulb size={32} color="#f59e0b" />
          </div>
          <h3 style={styles.insightTitle}>Key Insight</h3>
          <p style={styles.insightText}>
            Your top {stats?.top20Count} customers generate nearly {stats?.top20Contribution}% of profit. 
            Focus on retaining these relationships and finding similar prospects.
          </p>
        </div>
        
        <div style={styles.insightCard}>
          <div style={styles.insightIconWrap}>
            <HiTarget size={32} color="#10b981" />
          </div>
          <h3 style={styles.insightTitle}>Next Steps</h3>
          <p style={styles.insightText}>
            Use ICP extraction to identify traits of your elite customers, then target 
            look-alike companies with similar characteristics.
          </p>
        </div>
        
        <div style={styles.insightCard}>
          <div style={styles.insightIconWrap}>
            <HiTrendingUp size={32} color="#2563eb" />
          </div>
          <h3 style={styles.insightTitle}>Growth Strategy</h3>
          <p style={styles.insightText}>
            Elite customers spend {((stats?.top20AvgMargin / stats?.othersAvgMargin) || 0).toFixed(1)}x more than average. 
            Moving 10% of customers up-tier could double revenue.
          </p>
        </div>
      </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>Strikezone Intelligence Platform • Real-time ERP Analytics</p>
        </footer>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  loading: {
    color: 'white',
    fontSize: '24px',
    textAlign: 'center',
    paddingTop: '100px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'white',
    margin: '0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.9)',
    margin: '5px 0 0 0',
  },
  refreshBtn: {
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid white',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
  },
  heroCard: {
    background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
    borderRadius: '20px',
    padding: '40px',
    marginBottom: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    color: 'white',
  },
  heroContent: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  heroLabel: {
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '2px',
    opacity: '0.9',
  },
  heroValue: {
    fontSize: '96px',
    fontWeight: '800',
    margin: '10px 0',
    textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
  },
  heroSubtext: {
    fontSize: '20px',
    opacity: '0.95',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
  },
  heroStatItem: {
    textAlign: 'center',
  },
  heroStatValue: {
    fontSize: '48px',
    fontWeight: '700',
  },
  heroStatLabel: {
    fontSize: '14px',
    opacity: '0.9',
    marginTop: '5px',
  },
  heroStatDivider: {
    width: '2px',
    height: '60px',
    background: 'rgba(255,255,255,0.3)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  kpiCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  kpiLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  kpiValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '10px 0',
  },
  kpiTrend: {
    fontSize: '14px',
    color: '#27AE60',
    fontWeight: '600',
  },
  kpiSubtext: {
    fontSize: '14px',
    color: '#95a5a6',
  },
  tableCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  tableTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: '0',
    marginBottom: '20px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f8f9fa',
  },
  th: {
    padding: '16px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e0e0e0',
  },
  tableRowEven: {
    background: '#ffffff',
  },
  tableRowOdd: {
    background: '#f8f9fa',
  },
  td: {
    padding: '16px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#2c3e50',
    borderBottom: '1px solid #ecf0f1',
  },
  topBadge: {
    display: 'inline-block',
    width: '32px',
    height: '32px',
    lineHeight: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: 'white',
    fontWeight: '700',
    fontSize: '14px',
  },
  rankBadge: {
    display: 'inline-block',
    width: '32px',
    height: '32px',
    lineHeight: '32px',
    borderRadius: '50%',
    background: '#95a5a6',
    color: 'white',
    fontWeight: '700',
    fontSize: '14px',
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  insightCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  insightIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  insightTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: '0',
    marginBottom: '10px',
  },
  insightText: {
    fontSize: '14px',
    color: '#7f8c8d',
    lineHeight: '1.6',
    margin: '0',
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    paddingTop: '20px',
  },
  // Comparison Section Styles
  comparisonCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  comparisonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  comparisonTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  toggleLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
    fontWeight: '600',
  },
  toggleBtn: {
    padding: '8px 16px',
    background: '#f1f3f4',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#7f8c8d',
  },
  toggleBtnActive: {
    padding: '8px 16px',
    background: '#667eea',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    color: 'white',
    fontWeight: '600',
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '20px',
    alignItems: 'start',
    marginBottom: '24px',
  },
  comparisonGroup: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
  },
  groupLabel: {
    background: '#27AE60',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '16px',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px',
  },
  vsCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
    alignSelf: 'center',
  },
  differentiators: {
    background: '#f0f9ff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    borderLeft: '4px solid #3498DB',
  },
  diffTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: '0',
    marginBottom: '12px',
  },
  diffList: {
    margin: '0',
    paddingLeft: '20px',
  },
  diffItem: {
    fontSize: '14px',
    color: '#34495e',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  industrySection: {
    marginTop: '20px',
  },
  industryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  industryItem: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  },
  industryName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '8px',
  },
  industryStats: {
    display: 'flex',
    justifyContent: 'space-around',
    fontSize: '12px',
  },
  // CAGR Section Styles
  cagrCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  cagrSummary: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '20px',
  },
  cagrStat: {
    textAlign: 'center',
    padding: '15px',
    minWidth: '120px',
  },
  cagrValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2c3e50',
  },
  cagrLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginTop: '8px',
  },
};
