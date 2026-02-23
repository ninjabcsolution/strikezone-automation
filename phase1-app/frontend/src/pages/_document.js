import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon - inline SVG as data URI */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' stroke='%232563eb' stroke-width='4' fill='none'/><circle cx='50' cy='50' r='30' stroke='%232563eb' stroke-width='3' fill='none'/><circle cx='50' cy='50' r='15' fill='%232563eb'/><line x1='50' y1='5' x2='50' y2='20' stroke='%232563eb' stroke-width='4' stroke-linecap='round'/><line x1='50' y1='80' x2='50' y2='95' stroke='%232563eb' stroke-width='4' stroke-linecap='round'/><line x1='5' y1='50' x2='20' y2='50' stroke='%232563eb' stroke-width='4' stroke-linecap='round'/><line x1='80' y1='50' x2='95' y2='50' stroke='%232563eb' stroke-width='4' stroke-linecap='round'/><path d='M55 35 L48 50 L55 50 L45 65' stroke='%23f59e0b' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>"
          type="image/svg+xml"
        />
        
        {/* Meta tags */}
        <meta name="description" content="Strikezone - BDaaS Platform for identifying top customers and lookalikes" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
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
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
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
