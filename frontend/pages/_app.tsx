// pages/_app.tsx
import "@mantine/core/styles.css";
import type { AppProps } from "next/app";
import { MantineProvider, createTheme } from "@mantine/core";
import WebLayout from "../components/WebLayout";

// Optional: customize the theme if needed
const theme = createTheme({
  // You can add other theme settings here
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <WebLayout>
        <Component {...pageProps} />
      </WebLayout>
    </MantineProvider>
  );
}
