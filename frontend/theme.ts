import { createTheme } from "@mantine/core";

export const colorSchemeStorageKey = "dt-color-scheme";

export const theme = createTheme({
  primaryColor: "teal",
  fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
  headings: {
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
    fontWeight: "700",
  },
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: { radius: "md" },
    },
    Card: {
      defaultProps: { radius: "md", shadow: "sm" },
    },
  },
});
