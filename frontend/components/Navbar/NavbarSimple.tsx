// components/Navbar/NavbarSimpleContent.tsx
import { useState } from "react";
import Link from "next/link";
import {
  IconHome,
  IconChartDots3,
  IconSettings,
  IconUserPlus, // if you don’t have this, pick another add‑user icon
  IconUpload,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { Group, Text, ActionIcon, useMantineColorScheme } from "@mantine/core";
import classes from "./NavbarSimple.module.css";

const mainLinks = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/StatsPage", label: "Statistieken", icon: IconChartDots3 },
];
const footerLinks = [
  { href: "/AddUserPage", label: "Add User", icon: IconUserPlus },
  { href: "/AvatarPage", label: "Avatar", icon: IconUpload },
  { href: "/SettingsPage", label: "Settings", icon: IconSettings },
];

export default function NavbarSimpleContent() {
  const [active, setActive] = useState("Home");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <>
      <Group justify="center" mb="md">
        <Text fw={700} size="lg">
          Drink Tracker
        </Text>
      </Group>

      {/* main navigation */}
      {mainLinks.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={classes.link}
          data-active={item.label === active || undefined}
          onClick={() => setActive(item.label)}
        >
          <item.icon className={classes.linkIcon} stroke={1.5} />
          <span>{item.label}</span>
        </Link>
      ))}

      {/* push footer to bottom */}
      <div style={{ flexGrow: 1 }} />

      {/* footer navigation */}
      <div className={classes.footer}>
        {footerLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={classes.link}
            data-active={item.label === active || undefined}
            onClick={() => setActive(item.label)}
          >
            <item.icon className={classes.linkIcon} stroke={1.5} />
            <span>{item.label}</span>
          </Link>
        ))}
        <ActionIcon
          aria-label="Toggle color scheme"
          onClick={() => toggleColorScheme()}
          variant="default"
          size="lg"
          className={classes.link}
        >
          {colorScheme === "dark" ? (
            <IconSun className={classes.linkIcon} stroke={1.5} />
          ) : (
            <IconMoon className={classes.linkIcon} stroke={1.5} />
          )}
        </ActionIcon>
      </div>
    </>
  );
}
