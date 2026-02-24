import { useState, useEffect } from 'react';
import { HiLightBulb, HiTarget, HiTrendingUp } from 'react-icons/hi';
import Layout from '../components/Layout';
import { getApiUrl } from '../utils/api';

const getAPI_URL = () => typeof window !== 'undefined' ? getApiUrl() : 'http://localhost:5002';

export default function CEODashboard() {
  const [stats, setStats] = useState(null);
  const [top20Customers, setTop20Customers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = getAPI_URL();
      const [statsRes, customersRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/stats`),
        fetch(`${API_URL}/api/analytics/top20?limit=10`)
      ]);
      
      if (statsRes.ok && customersRes.ok) {
        const statsData = await statsRes.json();
        const customersData = await customersRes.json();
        setStats(statsData.stats);
        setTop20Customers(customersData.customers);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
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
};
