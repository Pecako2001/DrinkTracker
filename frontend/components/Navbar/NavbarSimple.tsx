// components/Navbar/NavbarSimpleContent.tsx
import { useState } from "react";
import Link from "next/link";
import {
  IconBeer,
  IconDeviceDesktopAnalytics,
  IconChartBarPopular,
  IconUserPlus,
  IconShield,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { Group, Text, ActionIcon, useMantineColorScheme } from "@mantine/core";
import classes from "./NavbarSimple.module.css";

const mainLinks = [
  { href: "/", label: "Drinks", icon: IconBeer },
  { href: "/LeaderBoardPage", label: "Leaderboard", icon: IconDeviceDesktopAnalytics },
  { href: "/StatsPage", label: "Stats", icon: IconDeviceDesktopAnalytics },
];
const footerLinks = [
  { href: "/AddUserPage", label: "Add User", icon: IconUserPlus },
  { href: "/SettingsPage", label: "Admin", icon: IconShield },
];

export default function NavbarSimpleContent() {
  const [active, setActive] = useState("Drinks");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <>
      <Group justify="center" mb="md" className={classes.logoGroup}>
        <img
          src="/icon.png"
          alt="Drink Tracker Logo"
          style={{ width: 32, height: 32, marginRight: 8 }}
        />
        <Text fw={700} size="lg, xl" className={classes.logo}>
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
