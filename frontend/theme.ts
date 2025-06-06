import { createTheme } from "@mantine/core";

export const colorSchemeStorageKey = "dt-color-scheme";

export const theme = createTheme({
  primaryColor: "blue",
  colors: {
    blue: [
      "#e3f0fc", // 0
      "#b3d4f7", // 1
      "#81b8f2", // 2
      "#4e9cec", // 3
      "#217fe7", // 4
      "#0a6ad6", // 5
      "#0057b7", // 6
      "#004494", // 7
      "#003170", // 8
      "#001d4d", // 9
    ],
  },
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
