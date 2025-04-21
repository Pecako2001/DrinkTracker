// pages/_app.tsx
import '@mantine/core/styles.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import WebLayout from '../components/WebLayout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider globalStyles normalizeCSS theme={{}}>
      <WebLayout>
        <Component {...pageProps} />
      </WebLayout>
    </MantineProvider>
  );
}
