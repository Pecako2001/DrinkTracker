import { Head, Html, Main, NextScript } from "next/document";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { colorSchemeStorageKey } from "../theme";

export default function Document() {
  return (
    <Html lang="en" {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript localStorageKey={colorSchemeStorageKey} />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          as="style"
          href="https://fonts.googleapis.com/css2?display=swap&family=Noto+Sans:wght@400;500;700;900&family=Plus+Jakarta+Sans:wght@400;500;700;800"
          onLoad={(e) => {
            const target = e.currentTarget as HTMLLinkElement;
            target.rel = "stylesheet";
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { const t = localStorage.getItem('${colorSchemeStorageKey}') || 'light'; document.documentElement.setAttribute('data-theme', t); })();`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
