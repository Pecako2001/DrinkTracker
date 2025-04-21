// components/Navbar/NavbarSimpleContent.tsx
import { useState } from "react";
import Link from "next/link";
import {
  IconHome,
  IconChartDots3,
  IconSettings,
  IconUserPlus, // if you don’t have this, pick another add‑user icon
} from "@tabler/icons-react";
import { Group, Text } from "@mantine/core";
import classes from "./NavbarSimple.module.css";

const mainLinks = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/StatsPage", label: "Statistieken", icon: IconChartDots3 },
];
const footerLinks = [
  { href: "/AddUserPage", label: "Add User", icon: IconUserPlus },
  { href: "/SettingsPage", label: "Settings", icon: IconSettings },
];

export default function NavbarSimpleContent() {
  const [active, setActive] = useState("Home");

  return (
    <>
      <Group justify="center" mb="md">
        <Text fw={700} size="lg">
          Drink Tracker
        </Text>
      </Group>

      {/* main navigation */}
      {mainLinks.map((item) => (
        <Link key={item.label} href={item.href} passHref legacyBehavior>
          <a
            className={classes.link}
            data-active={item.label === active || undefined}
            onClick={() => setActive(item.label)}
          >
            <item.icon className={classes.linkIcon} stroke={1.5} />
            <span>{item.label}</span>
          </a>
        </Link>
      ))}

      {/* push footer to bottom */}
      <div style={{ flexGrow: 1 }} />

      {/* footer navigation */}
      <div className={classes.footer}>
        {footerLinks.map((item) => (
          <Link key={item.label} href={item.href} passHref legacyBehavior>
            <a
              className={classes.link}
              data-active={item.label === active || undefined}
              onClick={() => setActive(item.label)}
            >
              <item.icon className={classes.linkIcon} stroke={1.5} />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}
