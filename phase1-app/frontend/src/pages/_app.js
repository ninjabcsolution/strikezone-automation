import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>Strikezone - BDaaS Platform</title>
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
