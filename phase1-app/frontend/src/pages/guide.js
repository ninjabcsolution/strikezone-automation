import Link from 'next/link';
import Layout from '../components/Layout';

// Simple SVG Icons
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
};

// ULTRA DETAILED UI Guide Data
const pageGuides = [
  {
    name: 'Upload Page (Home)',
    path: '/',
    color: '#6366f1',
    phase: 'Step 1',
    
    overview: `The Upload page is your starting point. You upload 4 CSV files from your ERP system: Customers, Products, Orders, and OrderLines.`,
    
    uiElements: [
      {
        name: 'Navigation Cards (Top Row)',
        type: 'Quick Links',
        description: '4 clickable cards at the top that take you to other pages: CEO Dashboard, ICP Dashboard, Approval Portal, and Messaging.',
        howToUse: 'Click any card to navigate to that page.',
      },
      {
        name: 'Upload Progress Bar',
        type: 'Progress Indicator',
        description: 'Shows "Upload Progress: X / 4 files" with a blue bar filling up as you upload each file.',
        howToUse: 'Monitor this to see which files you\'ve uploaded. When all 4 are done, the bar turns green.',
      },
      {
        name: 'Reset All Button',
        type: 'Button (Gray)',
        description: 'Clears all upload status and lets you start fresh.',
        howToUse: 'Click this if you want to re-upload all files from scratch.',
      },
      {
        name: 'File Type Tabs (1-4)',
        type: 'Clickable Tabs',
        description: '4 tabs labeled: 1) Customers.csv, 2) Products.csv, 3) Orders.csv, 4) OrderLines.csv. Each shows a numbered circle and status.',
        howToUse: 'Click a tab to select which file type to upload. Green checkmark = already uploaded. "NEXT" badge shows which file to upload next.',
      },
      {
        name: 'Drag & Drop Zone',
        type: 'File Upload Area',
        description: 'Large box with "Drag & drop [filename] here" text. You can drag files or click to browse.',
        howToUse: 'Either drag a CSV file onto this area OR click it to open a file browser, then select your CSV file.',
      },
      {
        name: 'Upload CSV Button',
        type: 'Button (Blue)',
        description: 'Sends the selected file to the server.',
        howToUse: 'After selecting a file, click this button. It turns gray while uploading, then shows success.',
      },
      {
        name: 'Clear Button',
        type: 'Button (Gray)',
        description: 'Removes the currently selected file without uploading.',
        howToUse: 'Click if you selected the wrong file and want to choose a different one.',
      },
      {
        name: 'Upload Result Box',
        type: 'Success Message (Green)',
        description: 'Appears after successful upload showing: File name, Type, Rows Processed, Rows Inserted.',
        howToUse: 'Review this to confirm your data was imported correctly. Check "Rows Inserted" matches your expectations.',
      },
      {
        name: 'All Files Uploaded Success',
        type: 'Success Banner (Green)',
        description: 'Big green banner that appears when all 4 files are uploaded, with "Go to CEO Dashboard" button.',
        howToUse: 'Click the button to proceed to the next step.',
      },
      {
        name: 'Calculate Top 20% Metrics Button',
        type: 'Button (Green)',
        description: 'Runs the analysis to identify your top 20% customers by profit margin.',
        howToUse: 'Click after uploading Customers and Orders data. This triggers the core analysis.',
      },
    ],
    
    expectedResults: 'After uploading all 4 files, you\'ll see green checkmarks on all tabs and a success banner. The system now has your data.',
    
    commonIssues: [
      'File rejected: Make sure it\'s a .csv file with headers in the first row.',
      'Customer ID errors: Your Customers.csv must have a customer_id column that matches the customer_id in Orders.csv.',
      'Zero rows inserted: Check that your CSV isn\'t empty and has the correct column names.',
    ],
  },
  {
    name: 'CEO Dashboard',
    path: '/ceo-dashboard',
    color: '#2563eb',
    phase: 'Step 2',
    
    overview: `Executive view showing which customers generate the most profit. Identifies your Top 20% customers who typically generate 80% of gross margin.`,
    
    uiElements: [
      {
        name: 'Hero Card (Red Gradient)',
        type: 'Main KPI Display',
        description: 'Large red box showing "TOP 20% CUSTOMERS GENERATE X% of Total Gross Margin" with a big percentage number.',
        howToUse: 'This is your key insight. The number shows how much profit your best customers contribute (typically 70-90%).',
      },
      {
        name: 'Elite Customers / Total Customers',
        type: 'Statistics',
        description: 'Below the percentage, shows "X Elite Customers" and "Y Total Customers".',
        howToUse: 'Shows how many customers are in your Top 20% vs total customer count.',
      },
      {
        name: 'Refresh Button',
        type: 'Button (Top Right)',
        description: 'Reloads all dashboard data from the server.',
        howToUse: 'Click after uploading new data or recalculating metrics to see updated numbers.',
      },
      {
        name: 'KPI Cards Grid (4 cards)',
        type: 'Statistics Cards',
        description: 'Four white cards showing: Top 20% Avg Margin, Others Avg Margin, Margin Multiplier, Focus Opportunity.',
        howToUse: 'Compare the "Top 20% Avg Margin" vs "Others Avg Margin" - this shows how much more valuable your top customers are.',
      },
      {
        name: 'Margin Multiplier',
        type: 'Metric',
        description: 'Shows "X.Xx" - how many times more profitable your top customers are vs average.',
        howToUse: 'If this shows "5.2x", your top customers are 5.2 times more profitable than average customers.',
      },
      {
        name: 'Top 10 Elite Customers Table',
        type: 'Data Table',
        description: 'Table with columns: Rank, Customer, Industry, Location, Revenue, Margin, Margin %, Orders.',
        howToUse: 'Your most valuable customers ranked #1-10. Gold badges for top 3. Click any row to see more details.',
      },
      {
        name: 'Rank Column (1-10)',
        type: 'Table Column',
        description: 'Gold circle for ranks 1-3, gray for others.',
        howToUse: 'Identifies the relative position of each customer.',
      },
      {
        name: 'Top 20% vs 80% Comparison Section',
        type: 'Analysis Panel',
        description: 'Side-by-side comparison showing metrics for your top customers vs everyone else.',
        howToUse: 'See exactly how your elite customers differ: order value, frequency, margin, CAGR.',
      },
      {
        name: 'Rank by Toggle (Margin / 3-Year CAGR)',
        type: 'Toggle Buttons',
        description: 'Two buttons to switch between ranking by margin or by growth rate.',
        howToUse: 'Click "CAGR" to see customers ranked by growth instead of current margin.',
      },
      {
        name: 'Key Differentiators Box',
        type: 'Insights Panel (Blue)',
        description: 'Blue box with bullet points explaining what makes top customers different.',
        howToUse: 'Read these insights to understand WHY your top customers are successful.',
      },
      {
        name: 'Top Industries Grid',
        type: 'Industry Breakdown',
        description: 'Small cards showing which industries your top customers are in.',
        howToUse: 'Identify which industries to focus on when finding new customers.',
      },
      {
        name: '3-Year Growth Analysis (CAGR) Section',
        type: 'Growth Panel',
        description: 'Shows: Consistent Growers, Growing, Stable, Declining, New Customers counts.',
        howToUse: 'See which customers are growing vs declining. Focus on "Consistent Growers" for retention.',
      },
      {
        name: 'Insights Cards (3 cards at bottom)',
        type: 'Strategic Recommendations',
        description: 'Three cards with icons: Key Insight, Next Steps, Growth Strategy.',
        howToUse: 'Read these for actionable recommendations based on your data.',
      },
    ],
    
    expectedResults: 'You\'ll see your customers ranked by profitability, key metrics, and actionable insights about your business.',
    
    commonIssues: [
      'No data showing: Make sure you\'ve uploaded Customers, Orders, OrderLines, and clicked "Calculate Metrics".',
      'CAGR empty: You need 3 years of order data. If you only have 1 year, CAGR won\'t calculate.',
    ],
  },
  {
    name: 'ICP Dashboard',
    path: '/icp-dashboard',
    color: '#10b981',
    phase: 'Step 3',
    
    overview: `ICP = Ideal Customer Profile. This page analyzes what your Top 20% customers have in common - industries, locations, size, etc.`,
    
    uiElements: [
      {
        name: 'Actor Field',
        type: 'Text Input',
        description: 'Enter your name/email for audit logging purposes.',
        howToUse: 'Type your name (e.g., "john.smith") so the system knows who ran the analysis.',
      },
      {
        name: 'Recalculate ICP Traits Button',
        type: 'Button (Purple)',
        description: 'Analyzes your Top 20% customers to extract common traits.',
        howToUse: 'Click this AFTER you\'ve calculated Top 20% metrics on the CEO Dashboard.',
      },
      {
        name: 'Download Traits CSV Button',
        type: 'Download Button (Dark Gray)',
        description: 'Exports all ICP traits to a CSV file.',
        howToUse: 'Click to download. Open in Excel to review or share with your team.',
      },
      {
        name: 'Download ICP Summary (MD) Button',
        type: 'Download Button (Blue)',
        description: 'Exports a readable Markdown summary of your ICP.',
        howToUse: 'Click to download. Open in any text editor or Markdown viewer.',
      },
      {
        name: 'External Filters Section',
        type: 'JSON Display',
        description: 'Shows filter values formatted for Apollo, LinkedIn, or other sales tools.',
        howToUse: 'Copy these values when setting up filters in your sales prospecting tools.',
      },
      {
        name: 'Top Industries Table',
        type: 'Trait Table',
        description: 'Table showing industries with columns: Trait, Top20%, Others, Lift, Importance.',
        howToUse: 'Higher "Lift" means that industry is MORE common in top customers vs average.',
      },
      {
        name: 'Lift Column',
        type: 'Metric',
        description: 'A number showing how much more common a trait is in top customers. 2.0 = "twice as likely".',
        howToUse: 'Focus on traits with Lift > 1.5. These are strong indicators of a good customer.',
      },
      {
        name: 'Importance Score',
        type: 'Metric',
        description: 'Combined score (0-100) showing overall significance of the trait.',
        howToUse: 'Higher = more important for identifying ideal customers.',
      },
      {
        name: 'Top States Table',
        type: 'Trait Table',
        description: 'Same format as industries, but for geographic locations.',
        howToUse: 'See which states your best customers are in. Target similar areas.',
      },
      {
        name: 'Top NAICS Table',
        type: 'Trait Table',
        description: 'NAICS codes are industry classification numbers.',
        howToUse: 'Use these codes when filtering company databases by industry.',
      },
      {
        name: 'Top Product Categories Table',
        type: 'Trait Table',
        description: 'Shows which products your best customers buy most.',
        howToUse: 'Lead with these products when approaching new prospects.',
      },
    ],
    
    expectedResults: 'Tables showing traits common among your best customers, with Lift scores indicating strength of correlation.',
    
    commonIssues: [
      '"No traits yet": Click "Recalculate ICP Traits" button.',
      'Empty tables: Make sure you have customer industry/state data in your Customers.csv.',
    ],
  },
  {
    name: 'Lookalike Search',
    path: '/lookalike-search',
    color: '#8b5cf6',
    phase: 'Step 4',
    
    overview: `Finds NEW companies similar to your best customers. Uses your ICP to search company databases.`,
    
    uiElements: [
      {
        name: 'Data Provider Buttons',
        type: 'Toggle Group',
        description: 'Buttons for different data sources: APOLLO, ZOOMINFO, SIXSENSE, DEMO.',
        howToUse: 'Click DEMO to test without API keys. For real data, configure API keys in backend/.env.',
      },
      {
        name: 'Default Tag (Green)',
        type: 'Badge',
        description: 'Small green badge showing which provider is configured as default.',
        howToUse: 'This is auto-selected when you load the page.',
      },
      {
        name: 'Standard Search / Intent-Based Search Toggle',
        type: 'Radio Buttons',
        description: 'Two options for search type.',
        howToUse: 'Standard = search by industry/company name. Intent = find companies researching specific topics.',
      },
      {
        name: 'Search Query Input',
        type: 'Text Field',
        description: 'Enter search terms like industry name, product type, or company characteristics.',
        howToUse: 'Type something like "industrial manufacturing" or "chemical distributors".',
      },
      {
        name: 'Intent Keywords Input (Intent mode)',
        type: 'Text Field',
        description: 'Comma-separated keywords companies might be searching for.',
        howToUse: 'Enter topics like "supply chain optimization, warehouse management".',
      },
      {
        name: 'Min Buying Stage Dropdown (Intent mode)',
        type: 'Dropdown',
        description: 'Filter by how far along companies are in their buying journey.',
        howToUse: 'Select "Decision" or "Purchase" to find hot leads. "Awareness" for early-stage.',
      },
      {
        name: 'Generate Lookalikes Button',
        type: 'Button (Green)',
        description: 'Runs the search and saves results to the database.',
        howToUse: 'Click after entering search criteria. Wait for results to appear.',
      },
      {
        name: 'ICP Profile Section (Collapsible)',
        type: 'Info Panel',
        description: 'Shows your ICP criteria: Top Industries, Top States, Employee Count range, Revenue range.',
        howToUse: 'Click to expand. Review to confirm your ICP looks correct.',
      },
      {
        name: 'Seed Companies Section (Collapsible)',
        type: 'Info Panel',
        description: 'Shows your Top 20% customers being used as the basis for similarity matching.',
        howToUse: 'Click to expand. These are the "reference" customers the system uses.',
      },
      {
        name: 'Results Grid',
        type: 'Company Cards',
        description: 'Grid of cards, each showing a found company with details.',
        howToUse: 'Review each card. Look for Tier A or B companies first.',
      },
      {
        name: 'Tier Badge (A/B/C/D)',
        type: 'Colored Badge',
        description: 'Green A = best match. Blue B = good. Orange C = moderate. Gray D = weak.',
        howToUse: 'Prioritize Tier A and B companies for outreach.',
      },
      {
        name: 'Similarity Score Bar',
        type: 'Progress Bar (Green)',
        description: 'Shows how closely the company matches your ICP (0-100%).',
        howToUse: 'Higher = better match. 80%+ is excellent.',
      },
      {
        name: 'Opportunity Score Bar',
        type: 'Progress Bar (Blue)',
        description: 'Estimates the potential value of winning this customer (0-100%).',
        howToUse: 'Combines similarity with company size/revenue potential.',
      },
      {
        name: 'Reason Codes',
        type: 'Green Tags',
        description: 'Small green badges explaining WHY the company matched (e.g., "INDUSTRY_MATCH", "STATE_MATCH").',
        howToUse: 'Tells you which ICP criteria this company satisfied.',
      },
      {
        name: 'Pagination Controls',
        type: 'Page Navigation',
        description: 'Buttons to load more results.',
        howToUse: 'Click page numbers or arrows to see more companies.',
      },
    ],
    
    expectedResults: 'A list of companies similar to your best customers, scored and ranked by fit.',
    
    commonIssues: [
      'Demo mode only: Configure APOLLO_API_KEY in backend/.env for real data.',
      'No results: Try broader search terms or check that your ICP has been calculated.',
    ],
  },
  {
    name: 'Approval Portal',
    path: '/approval-portal',
    color: '#f59e0b',
    phase: 'Step 5',
    
    overview: `Review and approve/reject target companies before they go to your sales team. Quality control checkpoint.`,
    
    uiElements: [
      {
        name: 'Actor Input',
        type: 'Text Field',
        description: 'Your name for audit logging.',
        howToUse: 'Enter your name so approvals are tracked.',
      },
      {
        name: 'Generate from Apollo Section',
        type: 'Action Panel',
        description: 'Search query input and "Generate from Apollo" button.',
        howToUse: 'Alternative way to search for companies directly from this page.',
      },
      {
        name: 'Generate Win-back Section',
        type: 'Action Panel',
        description: 'Inactive Days input, Limit input, and "Generate Win-back Targets" button.',
        howToUse: 'Find past customers who haven\'t ordered recently. Enter days inactive (e.g., 180 = 6 months).',
      },
      {
        name: 'Import Power BI Section',
        type: 'Action Panel',
        description: 'CSV file upload and JSON text area for importing targets from Power BI.',
        howToUse: 'Export your Power BI target list as CSV, then upload here.',
      },
      {
        name: 'Create Target (Manual) Section',
        type: 'Form',
        description: 'Input fields for: Company name, Domain, Industry, State, Employee count, Revenue, Notes.',
        howToUse: 'Manually add a company you found through other channels.',
      },
      {
        name: 'Status Filter Dropdown',
        type: 'Dropdown',
        description: 'Options: All, Pending Review, Approved, Rejected.',
        howToUse: 'Filter to see only companies needing review (Pending) or already processed.',
      },
      {
        name: 'Tier Filter Dropdown',
        type: 'Dropdown',
        description: 'Filter by A, B, or C tier.',
        howToUse: 'Show only high-priority targets by selecting "A".',
      },
      {
        name: 'Source Filter Dropdown',
        type: 'Dropdown',
        description: 'Options: All, Power BI, Win-back, Manual, Apollo.',
        howToUse: 'See where each target came from.',
      },
      {
        name: 'Segment Filter Dropdown',
        type: 'Dropdown',
        description: 'Options: All, Strategic, WinBack, A, B, C.',
        howToUse: 'Filter by business segment if using segmentation.',
      },
      {
        name: 'Search Input',
        type: 'Text Field',
        description: 'Search by company name or domain.',
        howToUse: 'Type part of a company name to find specific targets.',
      },
      {
        name: 'Refresh Button',
        type: 'Button (Blue)',
        description: 'Reloads the target list.',
        howToUse: 'Click after making changes or to see new imports.',
      },
      {
        name: 'Export CSV Button',
        type: 'Button (Dark Gray)',
        description: 'Downloads filtered targets as CSV.',
        howToUse: 'Export approved targets to give to your sales team.',
      },
      {
        name: 'Targets Table',
        type: 'Data Table',
        description: 'Columns: ID, Company, Industry, State, Employees, Revenue, Tier, Segment, Similarity, Opportunity, Status, Notes, Actions.',
        howToUse: 'Review each company row by row.',
      },
      {
        name: 'Tier Dropdown (In Table)',
        type: 'Inline Dropdown',
        description: 'Change a company\'s tier directly in the table.',
        howToUse: 'Click dropdown and select A, B, or C to re-tier.',
      },
      {
        name: 'Notes Input (In Table)',
        type: 'Inline Text Field',
        description: 'Add notes about why you\'re approving/rejecting.',
        howToUse: 'Type notes like "Already a customer" or "Great fit".',
      },
      {
        name: 'Save Button (In Table)',
        type: 'Mini Button (Blue)',
        description: 'Saves changes to tier/notes.',
        howToUse: 'Click after changing tier or notes.',
      },
      {
        name: 'Approve Button (In Table)',
        type: 'Mini Button (Green)',
        description: 'Marks company as approved for sales outreach.',
        howToUse: 'Click when you\'ve reviewed and the company looks good.',
      },
      {
        name: 'Reject Button (In Table)',
        type: 'Mini Button (Red)',
        description: 'Marks company as rejected/not a fit.',
        howToUse: 'Click for companies that don\'t fit (competitor, too small, wrong industry, etc.).',
      },
    ],
    
    expectedResults: 'A clean list of approved target companies ready for your sales team.',
    
    commonIssues: [
      'No targets: Generate some from Lookalike Search or import from Power BI first.',
      'Can\'t see approved: Change the Status filter to "Approved" or "All".',
    ],
  },
  {
    name: 'Messaging Portal',
    path: '/messaging-portal',
    color: '#ec4899',
    phase: 'Step 6',
    
    overview: `Generate AI-written personalized messages (emails, LinkedIn, call scripts) for your approved target contacts.`,
    
    uiElements: [
      {
        name: 'Stats Cards (5 cards)',
        type: 'Statistics Row',
        description: 'Shows Total, Pending, Approved, Edited, Rejected message counts.',
        howToUse: 'Monitor your message approval progress at a glance.',
      },
      {
        name: 'Generate AI Messages Section',
        type: 'Generation Form',
        description: 'Controls for creating new AI-generated messages.',
        howToUse: 'Select contacts, choose message type, click Generate.',
      },
      {
        name: 'Message Type Dropdown',
        type: 'Dropdown',
        description: 'Options: Email, LinkedIn, Call Script.',
        howToUse: 'Select what kind of message to generate.',
      },
      {
        name: 'Template Dropdown',
        type: 'Dropdown',
        description: 'Pre-built templates for different scenarios.',
        howToUse: 'Select a template for consistency, or leave blank for AI to decide.',
      },
      {
        name: 'Custom Instructions Input',
        type: 'Text Field',
        description: 'Additional instructions for the AI.',
        howToUse: 'Type things like "Mention our new product launch" or "Keep it casual".',
      },
      {
        name: 'Contact Selection List',
        type: 'Checkbox List',
        description: 'List of contacts with checkboxes.',
        howToUse: 'Check boxes next to contacts you want to generate messages for.',
      },
      {
        name: 'Select All Button',
        type: 'Mini Button',
        description: 'Checks all contacts.',
        howToUse: 'Click to select everyone for bulk generation.',
      },
      {
        name: 'Clear Button',
        type: 'Mini Button',
        description: 'Unchecks all contacts.',
        howToUse: 'Click to start selection over.',
      },
      {
        name: 'Generate X Messages Button',
        type: 'Button (Blue)',
        description: 'Creates AI messages for selected contacts.',
        howToUse: 'Click after selecting contacts. Wait for AI to generate.',
      },
      {
        name: 'Tab Buttons (Pending, Approved, etc.)',
        type: 'Filter Tabs',
        description: 'Filter messages by status.',
        howToUse: 'Click "Pending" to see messages needing review.',
      },
      {
        name: 'Approve All Pending Button',
        type: 'Button (Green)',
        description: 'Bulk approves all pending messages at once.',
        howToUse: 'Use with caution - approves everything without individual review.',
      },
      {
        name: 'Export Approved Button',
        type: 'Button (Gray)',
        description: 'Downloads approved messages as CSV.',
        howToUse: 'Export to import into your email tool or CRM.',
      },
      {
        name: 'Messages Table',
        type: 'Data Table',
        description: 'Columns: Contact, Company, Type, Subject, Status, Actions.',
        howToUse: 'See all generated messages. Click "View" to review details.',
      },
      {
        name: 'View Button (In Table)',
        type: 'Mini Button (Blue)',
        description: 'Opens message detail modal.',
        howToUse: 'Click to see full message text and approval options.',
      },
      {
        name: 'Message Detail Modal',
        type: 'Popup Window',
        description: 'Full-screen overlay showing message details with editing options.',
        howToUse: 'Review and edit the message before approving.',
      },
      {
        name: 'Subject Field (In Modal)',
        type: 'Text Input',
        description: 'Email subject line. Editable if message is pending.',
        howToUse: 'Edit to improve the subject line.',
      },
      {
        name: 'Message Body Field (In Modal)',
        type: 'Text Area',
        description: 'Full message text. Editable if pending.',
        howToUse: 'Read carefully. Make edits as needed.',
      },
      {
        name: 'Rejection Reason Field (In Modal)',
        type: 'Text Input',
        description: 'Explain why you\'re rejecting the message.',
        howToUse: 'Enter reason before clicking Reject.',
      },
      {
        name: 'Approve Button (In Modal)',
        type: 'Button (Green)',
        description: 'Approves message as-is.',
        howToUse: 'Click when message is ready to send.',
      },
      {
        name: 'Save Edits & Approve Button (In Modal)',
        type: 'Button (Blue)',
        description: 'Saves your edits and approves.',
        howToUse: 'Click after making changes to the message.',
      },
      {
        name: 'Reject Button (In Modal)',
        type: 'Button (Red)',
        description: 'Rejects the message.',
        howToUse: 'Click if message is inappropriate or unusable.',
      },
    ],
    
    expectedResults: 'Personalized, approved messages ready to be sent to prospects.',
    
    commonIssues: [
      'No contacts: Run contact enrichment first to get contacts at target companies.',
      'AI errors: Check that OPENAI_API_KEY is configured in backend/.env.',
      'Messages too generic: Add custom instructions for more personalization.',
    ],
  },
];

// Workflow steps
const workflowSteps = [
  { step: 1, title: 'Upload Data', page: '/', color: '#6366f1' },
  { step: 2, title: 'Analyze Top 20%', page: '/ceo-dashboard', color: '#2563eb' },
  { step: 3, title: 'Extract ICP', page: '/icp-dashboard', color: '#10b981' },
  { step: 4, title: 'Find Lookalikes', page: '/lookalike-search', color: '#8b5cf6' },
  { step: 5, title: 'Approve Targets', page: '/approval-portal', color: '#f59e0b' },
  { step: 6, title: 'Generate Messages', page: '/messaging-portal', color: '#ec4899' },
];

export default function GuidePage() {
  return (
    <Layout>
      <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ color: '#f59e0b' }}><Icons.Lightning /></span>
            <h1 style={{ fontSize: '32px', margin: 0 }}>Complete UI Reference Guide</h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            This guide explains every button, field, and table on each page. Use it as a reference when you're unsure what something does.
          </p>
        </div>

        {/* Quick Workflow */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '15px' }}>Quick Workflow (6 Steps)</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            {workflowSteps.map((s, idx) => (
              <Link key={s.step} href={s.page} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '10px 16px', 
                  background: 'white', 
                  borderRadius: '8px', 
                  border: `2px solid ${s.color}`,
                }}>
                  <span style={{ 
                    background: s.color, 
                    color: 'white', 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}>{s.step}</span>
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>{s.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Detailed Page Guides */}
        {pageGuides.map((page) => (
          <div key={page.path} style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            marginBottom: '30px',
            overflow: 'hidden',
          }}>
            {/* Page Header */}
            <div style={{ 
              background: page.color,
              padding: '20px 25px',
              color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ opacity: 0.8, fontSize: '12px' }}>{page.phase}</span>
                  <h2 style={{ margin: '5px 0 0', fontSize: '24px' }}>{page.name}</h2>
                </div>
                <Link href={page.path}>
                  <button style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid white',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}>
                    Open Page →
                  </button>
                </Link>
              </div>
              <p style={{ margin: '10px 0 0', opacity: 0.9, fontSize: '14px' }}>{page.overview}</p>
            </div>

            {/* UI Elements List */}
            <div style={{ padding: '25px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#1f2937' }}>
                UI Elements on This Page ({page.uiElements.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {page.uiElements.map((el, idx) => (
                  <div key={idx} style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    borderLeft: `4px solid ${page.color}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#1f2937' }}>{el.name}</h4>
                      <span style={{ 
                        background: '#e5e7eb', 
                        color: '#4b5563', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px',
                        fontWeight: '600' 
                      }}>{el.type}</span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
                      {el.description}
                    </p>
                    <div style={{ 
                      background: '#ecfdf5', 
                      padding: '10px 12px', 
                      borderRadius: '6px', 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '8px' 
                    }}>
                      <span style={{ color: '#10b981', marginTop: '2px' }}><Icons.Check /></span>
                      <span style={{ fontSize: '13px', color: '#065f46' }}>
                        <strong>How to use:</strong> {el.howToUse}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expected Results */}
              <div style={{ 
                marginTop: '25px',
                background: '#f0fdf4', 
                padding: '16px 20px', 
                borderRadius: '10px',
                border: '1px solid #bbf7d0',
              }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#166534' }}>✅ Expected Results</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#15803d' }}>{page.expectedResults}</p>
              </div>

              {/* Common Issues */}
              {page.commonIssues && (
                <div style={{ 
                  marginTop: '15px',
                  background: '#fffbeb', 
                  padding: '16px 20px', 
                  borderRadius: '10px',
                  border: '1px solid #fde68a',
                }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#b45309' }}>⚠️ Common Issues</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {page.commonIssues.map((issue, idx) => (
                      <li key={idx} style={{ fontSize: '13px', color: '#92400e', marginBottom: '6px' }}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
          borderRadius: '16px', 
          padding: '30px', 
          color: 'white', 
          textAlign: 'center' 
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Ready to Start?</h2>
          <p style={{ opacity: 0.9, marginBottom: '20px' }}>
            Begin with the Upload page and follow the 6-step workflow.
          </p>
          <Link href="/">
            <button style={{
              background: 'white',
              color: '#2563eb',
              padding: '12px 30px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '15px',
            }}>
              Go to Upload Page →
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
          Strikezone Platform • Complete UI Reference Guide
        </div>
      </div>
    </Layout>
  );
}
