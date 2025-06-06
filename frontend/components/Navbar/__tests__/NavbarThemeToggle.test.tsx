import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavbarSimpleContent from "../NavbarSimple";
import {
  MantineProvider,
  useMantineColorScheme,
  localStorageColorSchemeManager,
} from "@mantine/core";
import { theme, colorSchemeStorageKey } from "../../../theme";
import { useEffect } from "react";

test("toggles theme attribute", async () => {
  const manager = localStorageColorSchemeManager({
    key: colorSchemeStorageKey,
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <MantineProvider
        theme={theme}
        colorSchemeManager={manager}
        defaultColorScheme="light"
        withCssVariables
      >
        <Inner>{children}</Inner>
      </MantineProvider>
    );
  };

  const Inner = ({ children }: { children: React.ReactNode }) => {
    const { colorScheme } = useMantineColorScheme();
    useEffect(() => {
      document.documentElement.setAttribute("data-theme", colorScheme);
    }, [colorScheme]);
    return <>{children}</>;
  };
  render(<NavbarSimpleContent />, { wrapper: Wrapper });
  const button = screen.getByLabelText(/toggle color scheme/i);
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
  await userEvent.click(button);
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
});
