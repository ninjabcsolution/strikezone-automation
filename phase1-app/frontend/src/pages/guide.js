import Link from 'next/link';
import Layout from '../components/Layout';

// Simple SVG Icons to avoid react-icons dependency
const Icons = {
  Lightning: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Upload: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Chart: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Target: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Search: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Clipboard: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  Mail: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Database: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Info: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

// Page guides with detailed non-technical explanations
const pageGuides = [
  {
    name: 'Upload (Home)',
    path: '/',
    Icon: Icons.Upload,
    color: '#6366f1',
    phase: 'Step 1',
    
    whatIsIt: `The Upload page is your starting point. Here you upload your business data from your ERP system 
    (like QuickBooks, SAP, or any system you use to track customers and orders). The platform needs this data 
    to analyze your business and find your best customers.`,
    
    whyNeeded: `Without your data, the platform cannot work. Your customer and order data contains valuable 
    patterns that reveal WHO your best customers are. This is the foundation for everything else - finding 
    new customers similar to your best ones.`,
    
    howToUse: [
      'Click "Select File" for each file type (Customers, Orders, OrderLines, Products)',
      'Choose the matching CSV file from your computer',
      'Click "Upload All Files" to send the data to the platform',
      'Wait for the green success message confirming upload',
    ],
    
    whatToExpect: `After uploading, you'll see a success message with how many records were imported. 
    The platform now has your data and can start analyzing it. You can proceed to the CEO Dashboard.`,
    
    tips: [
      'Make sure your CSV files have headers in the first row',
      'Customer IDs must match between Customers and Orders files',
      'You can re-upload files to update existing data',
    ],
  },
  {
    name: 'CEO Dashboard',
    path: '/ceo-dashboard',
    Icon: Icons.Chart,
    color: '#2563eb',
    phase: 'Step 2',
    
    whatIsIt: `The CEO Dashboard is your executive command center. It shows you the BIG PICTURE of your 
    business - specifically, which customers are generating the most profit (gross margin). This follows 
    the "80/20 rule" where typically 20% of customers generate 80% of profits.`,
    
    whyNeeded: `Most businesses don't know which customers are truly their best. The dashboard reveals this 
    by calculating gross margin (revenue minus cost) for every customer, then ranking them. This knowledge 
    is CRITICAL because you want to find MORE customers like your best ones.`,
    
    howToUse: [
      'First, click "Calculate All Metrics" to analyze your data',
      'Wait for the calculation to complete (usually seconds)',
      'Review the Top 20% section showing your most valuable customers',
      'Check the statistics cards showing total revenue, margin, and customer counts',
      'Use the CAGR tab to see 3-year growth trends (if you have multi-year data)',
    ],
    
    whatToExpect: `You'll see your customers ranked by profit contribution. The Top 20% section shows 
    customers generating the most margin. Statistics show revenue concentration - often you'll discover 
    a small group generates most of your profit. This is NORMAL and VALUABLE insight.`,
    
    tips: [
      'Green badges indicate "Top 20%" status - your VIP customers',
      'Clicking a customer row shows more details',
      'Export data using the download buttons for reports',
    ],
  },
  {
    name: 'ICP Dashboard',
    path: '/icp-dashboard',
    Icon: Icons.Target,
    color: '#10b981',
    phase: 'Step 3',
    
    whatIsIt: `ICP stands for "Ideal Customer Profile". This dashboard analyzes your Top 20% customers 
    to find what they have IN COMMON. If your best customers are mostly in Manufacturing, located in 
    Texas, and have 50-200 employees - that's your ICP.`,
    
    whyNeeded: `Knowing your ICP lets you FOCUS your sales efforts. Instead of randomly approaching any 
    company, you can target companies that LOOK LIKE your best customers. These "lookalike" companies 
    are statistically more likely to become great customers too.`,
    
    howToUse: [
      'Click "Recalculate ICP Traits" to analyze your top customers',
      'Review the trait tables showing top industries, states, and NAICS codes',
      'Check the "Lift" column - higher lift means stronger correlation with success',
      'Export the ICP summary using the download buttons',
    ],
    
    whatToExpect: `You'll see tables showing which industries, locations, and categories appear most 
    often among your best customers. The "Lift" number shows how much more common a trait is in your 
    top customers vs. average customers. A lift of 2.0 means "twice as likely to be a top customer."`,
    
    tips: [
      'Traits with lift above 1.5 are strong indicators',
      'Export the summary to share with your sales team',
      'The External Filters section shows values ready for sales tools',
    ],
  },
  {
    name: 'Lookalike Search',
    path: '/lookalike-search',
    Icon: Icons.Search,
    color: '#8b5cf6',
    phase: 'Step 4',
    
    whatIsIt: `This is where the magic happens! The Lookalike Search finds NEW companies that match 
    your Ideal Customer Profile. It searches databases of millions of companies and finds ones that 
    LOOK LIKE your best customers in terms of industry, size, location, and other traits.`,
    
    whyNeeded: `You can't grow your business by selling only to existing customers. You need NEW 
    customers. But finding good prospects is hard. This tool does the heavy lifting - it finds 
    companies statistically similar to your best customers, giving your sales team warm leads.`,
    
    howToUse: [
      'Select a Data Provider (or use Demo mode to test)',
      'Choose Standard Search or Intent-Based Search',
      'For Standard: Enter a search query like an industry name',
      'For Intent: Enter keywords your ideal customers search for',
      'Click "Generate Lookalikes" to find matching companies',
      'Review results showing similarity scores and tiers',
    ],
    
    whatToExpect: `You'll see a list of companies with similarity scores (how much they match your ICP) 
    and opportunity scores (how good a fit they might be). Companies are ranked in tiers: A (best match), 
    B (good match), C (moderate match), D (weak match). Focus on Tier A and B companies.`,
    
    tips: [
      'Demo mode generates sample data - great for testing',
      'Intent-based search finds companies actively researching your type of product',
      'Review the "Reason Codes" to understand WHY a company matched',
    ],
  },
  {
    name: 'Approval Portal',
    path: '/approval-portal',
    Icon: Icons.Clipboard,
    color: '#f59e0b',
    phase: 'Step 5',
    
    whatIsIt: `The Approval Portal is your quality control checkpoint. Before any lookalike company 
    goes to your sales team, YOU review and approve it. This ensures only high-quality leads make 
    it through, saving your sales team's valuable time.`,
    
    whyNeeded: `AI and algorithms are smart, but they're not perfect. Some suggested companies might 
    not be a good fit (wrong industry, too small, competitor, etc.). Human review catches these 
    mistakes before wasting sales resources on bad leads.`,
    
    howToUse: [
      'Review the list of pending companies',
      'Check each company\'s industry, size, and similarity score',
      'Click "Approve" for good matches to send to sales',
      'Click "Reject" for companies that don\'t fit',
      'Click "Skip" if you\'re unsure and want to review later',
      'Use filters to focus on specific tiers or statuses',
    ],
    
    whatToExpect: `You'll see companies in different statuses: Pending (needs review), Approved 
    (ready for sales), Rejected (not a fit). The dashboard shows counts for each status. Export 
    approved companies to hand off to your sales team.`,
    
    tips: [
      'Focus on Tier A companies first - they\'re the best matches',
      'Check if the company is a competitor before approving',
      'Use bulk actions to approve/reject multiple companies at once',
    ],
  },
  {
    name: 'Messaging Portal',
    path: '/messaging-portal',
    Icon: Icons.Mail,
    color: '#ec4899',
    phase: 'Step 6',
    
    whatIsIt: `The Messaging Portal uses AI (ChatGPT) to write personalized outreach messages for 
    your approved target companies. It creates customized emails, LinkedIn messages, and cold call 
    scripts based on each company's profile.`,
    
    whyNeeded: `Generic "Dear Sir/Madam" messages get ignored. Personalized messages that reference 
    the company's specific situation get responses. But writing personalized messages for hundreds 
    of companies takes forever. AI solves this by generating customized drafts in seconds.`,
    
    howToUse: [
      'Select an approved target company',
      'Choose the message type (Email, LinkedIn, Call Script)',
      'Click "Generate Message" to create AI-powered content',
      'Review and edit the generated message as needed',
      'Click "Approve" when the message is ready to send',
      'Export approved messages for your CRM or email tool',
    ],
    
    whatToExpect: `You'll get professional, personalized messages that reference the company's 
    industry, size, and why they might benefit from your products. Messages are drafts - always 
    review and adjust before sending. The AI provides a strong starting point, not a finished product.`,
    
    tips: [
      'Always review AI messages - they sometimes make mistakes',
      'Add personal touches like recent news about the company',
      'Keep emails under 150 words for better response rates',
    ],
  },
];

// Workflow steps
const workflowSteps = [
  { step: 1, title: 'Upload Data', desc: 'Import your ERP exports (Customers, Orders, Products)', page: '/', color: '#6366f1' },
  { step: 2, title: 'Analyze Top 20%', desc: 'Calculate metrics to find your most profitable customers', page: '/ceo-dashboard', color: '#2563eb' },
  { step: 3, title: 'Generate ICP', desc: 'Discover traits your best customers have in common', page: '/icp-dashboard', color: '#10b981' },
  { step: 4, title: 'Find Lookalikes', desc: 'Search for companies matching your ideal profile', page: '/lookalike-search', color: '#8b5cf6' },
  { step: 5, title: 'Approve Targets', desc: 'Review and approve companies for sales outreach', page: '/approval-portal', color: '#f59e0b' },
  { step: 6, title: 'Generate Messages', desc: 'Create AI-personalized emails and call scripts', page: '/messaging-portal', color: '#ec4899' },
];

export default function GuidePage() {
  return (
    <Layout>
      <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ color: '#f59e0b' }}><Icons.Lightning /></span>
            <h1 style={{ fontSize: '32px', margin: 0 }}>Strikezone User Guide</h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            This guide explains each part of the platform in plain language. 
            Follow the workflow from start to finish to turn your customer data into targeted sales outreach.
          </p>
        </div>

        {/* The Big Picture */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          borderRadius: '16px', 
          padding: '25px 30px', 
          marginBottom: '40px',
          border: '1px solid #bae6fd'
        }}>
          <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '15px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.Info /> The Big Picture: What This Platform Does
          </h2>
          <div style={{ color: '#0c4a6e', lineHeight: 1.7 }}>
            <p style={{ marginTop: 0 }}>
              <strong>The Problem:</strong> You have great customers who love your products, but finding MORE customers like them is difficult and time-consuming.
            </p>
            <p>
              <strong>The Solution:</strong> Strikezone analyzes your existing customer data to discover what makes your BEST customers special. 
              Then it finds NEW companies that match that profile and helps you reach out to them with personalized messages.
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>The Result:</strong> Your sales team gets a list of pre-qualified, lookalike companies with ready-to-use outreach messages - 
              dramatically improving their efficiency and close rates.
            </p>
          </div>
        </div>

        {/* Workflow Steps */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '20px' }}>
            The 6-Step Workflow
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {workflowSteps.map((step) => (
              <Link key={step.step} href={step.page} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '18px',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '100%',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{
                      background: step.color,
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 'bold',
                    }}>
                      {step.step}
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#1f2937' }}>{step.title}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Detailed Page Guides */}
        <h2 style={{ fontSize: '24px', marginBottom: '25px' }}>Detailed Page Guides</h2>
        
        {pageGuides.map((page, idx) => {
          const Icon = page.Icon;
          return (
            <div key={page.path} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              marginBottom: '25px',
              overflow: 'hidden',
            }}>
              {/* Page Header */}
              <div style={{ 
                background: `linear-gradient(135deg, ${page.color}15 0%, ${page.color}08 100%)`,
                borderBottom: `3px solid ${page.color}`,
                padding: '20px 25px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}>
                <div style={{
                  background: page.color,
                  padding: '12px',
                  borderRadius: '12px',
                  color: 'white',
                }}>
                  <Icon />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '22px', color: '#1f2937' }}>{page.name}</h3>
                    <span style={{
                      background: page.color,
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}>
                      {page.phase}
                    </span>
                  </div>
                  <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: '14px' }}>
                    Navigate to: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{page.path}</code>
                  </p>
                </div>
              </div>

              {/* Page Content */}
              <div style={{ padding: '25px' }}>
                {/* What Is It */}
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ fontSize: '16px', color: page.color, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#f59e0b' }}><Icons.Star /></span>
                    What Is This Page?
                  </h4>
                  <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.7, fontSize: '15px' }}>
                    {page.whatIsIt}
                  </p>
                </div>

                {/* Why Is It Needed */}
                <div style={{ marginBottom: '22px', background: '#fffbeb', padding: '18px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <h4 style={{ fontSize: '16px', color: '#b45309', margin: '0 0 10px' }}>
                    💡 Why Is This Important?
                  </h4>
                  <p style={{ margin: 0, color: '#92400e', lineHeight: 1.7, fontSize: '15px' }}>
                    {page.whyNeeded}
                  </p>
                </div>

                {/* How To Use */}
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ fontSize: '16px', color: '#1f2937', margin: '0 0 12px' }}>
                    📋 How To Use (Step by Step)
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', lineHeight: 1.8 }}>
                    {page.howToUse.map((step, i) => (
                      <li key={i} style={{ fontSize: '15px', marginBottom: '6px' }}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* What To Expect */}
                <div style={{ marginBottom: '22px', background: '#f0fdf4', padding: '18px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ fontSize: '16px', color: '#166534', margin: '0 0 10px' }}>
                    ✅ What Results To Expect
                  </h4>
                  <p style={{ margin: 0, color: '#166534', lineHeight: 1.7, fontSize: '15px' }}>
                    {page.whatToExpect}
                  </p>
                </div>

                {/* Tips */}
                <div style={{ background: '#f0f9ff', padding: '18px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                  <h4 style={{ fontSize: '16px', color: '#0369a1', margin: '0 0 12px' }}>
                    💎 Pro Tips
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                    {page.tips.map((tip, i) => (
                      <li key={i} style={{ 
                        fontSize: '14px', 
                        color: '#0c4a6e', 
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}>
                        <span style={{ color: '#0ea5e9', marginTop: '3px' }}><Icons.Check /></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Go To Page Button */}
                <Link href={page.path}>
                  <button style={{
                    marginTop: '20px',
                    background: page.color,
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    Go to {page.name} <Icons.Arrow />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}

        {/* FAQ Quick Reference */}
        <div style={{ 
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', 
          borderRadius: '16px', 
          padding: '25px 30px', 
          marginBottom: '40px',
          border: '1px solid #e9d5ff'
        }}>
          <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '20px', color: '#7c3aed' }}>
            ❓ Common Questions
          </h2>
          <div style={{ color: '#581c87' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Q: What file formats are supported?</strong>
              <p style={{ margin: '5px 0 0', color: '#6b21a8' }}>A: CSV files only. Export your data from your ERP system as CSV.</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Q: How long does analysis take?</strong>
              <p style={{ margin: '5px 0 0', color: '#6b21a8' }}>A: Usually just a few seconds for most datasets (up to 100,000 records).</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Q: What does "Top 20%" mean?</strong>
              <p style={{ margin: '5px 0 0', color: '#6b21a8' }}>A: The customers who generate the top 20% of your total gross margin (profit).</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Q: What is "Lift" in the ICP traits?</strong>
              <p style={{ margin: '5px 0 0', color: '#6b21a8' }}>A: How much more likely a trait appears in top customers vs. others. Lift of 2.0 = "twice as common".</p>
            </div>
            <div>
              <strong>Q: Is the AI messaging reviewed by humans?</strong>
              <p style={{ margin: '5px 0 0', color: '#6b21a8' }}>A: Yes! All AI messages go to the Approval Portal for your review before sending.</p>
            </div>
          </div>
        </div>

        {/* Quick Start CTA */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
          borderRadius: '16px', 
          padding: '35px', 
          color: 'white', 
          textAlign: 'center' 
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '24px' }}>Ready to Get Started?</h2>
          <p style={{ opacity: 0.9, marginBottom: '25px', maxWidth: '600px', margin: '0 auto 25px', fontSize: '16px', lineHeight: 1.6 }}>
            Begin by uploading your customer and order data. The platform will guide you through 
            discovering your ideal customer profile and finding new prospects.
          </p>
          <Link href="/">
            <button style={{
              background: 'white',
              color: '#2563eb',
              padding: '14px 32px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <Icons.Database /> Start Uploading Data
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
          Strikezone Platform • BDaaS Solution • Need help? Contact support.
        </div>
      </div>
    </Layout>
  );
}
