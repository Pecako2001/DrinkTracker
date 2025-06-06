// pages/_app.tsx
import "@mantine/core/styles.css";
import "../styles/global.css";
import type { AppProps } from "next/app";
import {
  MantineProvider,
  useMantineColorScheme,
  localStorageColorSchemeManager,
} from "@mantine/core";
import { useEffect } from "react";
import WebLayout from "../components/WebLayout";
import { theme, colorSchemeStorageKey } from "../theme";
import { useRouter } from "next/router";

const manager = localStorageColorSchemeManager({ key: colorSchemeStorageKey });

function Providers({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMantineColorScheme();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorScheme);
  }, [colorScheme]);
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isMobilePage = router.pathname.startsWith("/Mobile");

  return (
    <MantineProvider
      theme={theme}
      colorSchemeManager={manager}
      defaultColorScheme="light"
      withCssVariables
    >
      <Providers>
        {isMobilePage ? (
          <Component {...pageProps} />
        ) : (
          <WebLayout>
            <Component {...pageProps} />
          </WebLayout>
        )}
      </Providers>
    </MantineProvider>
  );
}
