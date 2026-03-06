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
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
