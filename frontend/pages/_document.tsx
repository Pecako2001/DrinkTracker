import { Head, Html, Main, NextScript } from "next/document";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { colorSchemeStorageKey } from "../theme";

export default function Document() {
  return (
    <Html lang="en" {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript localStorageKey={colorSchemeStorageKey} />
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
