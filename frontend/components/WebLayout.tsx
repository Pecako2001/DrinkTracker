// components/WebLayout.tsx
import React from 'react';
import { AppShell } from '@mantine/core';
import NavbarSimpleContent from './Navbar/NavbarSimple'; // note the rename

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      padding="md"
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: true, desktop: false } }}
      withBorder
    >
      <AppShell.Navbar p="md">
        <NavbarSimpleContent />
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
