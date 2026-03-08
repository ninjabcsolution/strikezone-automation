import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Charset for emoji support */}
        <meta charSet="utf-8" />
        
        {/* Favicon - using PNG logo */}
        <link rel="icon" href="/logo-small.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo-large.png" />
        
        {/* Meta tags */}
        <meta name="description" content="Strikezone - BDaaS Platform for identifying top customers and lookalikes" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Color+Emoji&display=swap"
          rel="stylesheet"
        />
        
        {/* Global styles */}
        <style>{`
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Color Emoji', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Ensure emoji render correctly */
          .emoji {
            font-family: 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
          }

          /* Responsive utilities */
          .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 16px;
          }
          @media (min-width: 768px) {
            .container { padding: 0 24px; }
          }

          /* Responsive grid */
          .grid {
            display: grid;
            gap: 16px;
          }
          .grid-2 { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr; }
          .grid-4 { grid-template-columns: 1fr; }
          @media (min-width: 640px) {
            .grid-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-3 { grid-template-columns: repeat(2, 1fr); }
            .grid-4 { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1024px) {
            .grid-3 { grid-template-columns: repeat(3, 1fr); }
            .grid-4 { grid-template-columns: repeat(4, 1fr); }
          }

          /* Responsive text */
          .text-responsive {
            font-size: 14px;
          }
          @media (min-width: 768px) {
            .text-responsive { font-size: 16px; }
          }

          /* Hide on mobile/desktop */
          .hide-mobile { display: none; }
          .hide-desktop { display: block; }
          @media (min-width: 768px) {
            .hide-mobile { display: block; }
            .hide-desktop { display: none; }
          }

          /* Responsive cards */
          .card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          @media (min-width: 768px) {
            .card { padding: 20px; }
          }

          /* Tables - horizontal scroll on mobile */
          .table-responsive {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .table-responsive table {
            min-width: 600px;
          }

          /* Smooth transitions */
          .transition {
            transition: all 0.2s ease;
          }

          /* Page wrapper */
          .page-content {
            padding: 16px;
            min-height: calc(100vh - 60px);
          }
          @media (min-width: 768px) {
            .page-content { padding: 24px; }
          }
          @media (min-width: 1024px) {
            .page-content { padding: 32px; }
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
