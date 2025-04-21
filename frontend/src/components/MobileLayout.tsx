import React, { useState, useEffect } from 'react';
import { Header, Burger, Modal, Button, Group, Avatar, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import UserSelect from './UserSelect';
import { Person } from '../types';

export default function MobileLayout() {
  const [currentUser, setCurrentUser] = useState<Person | null>(null);
  const [statsOpened, { open: openStats, close: closeStats }] = useDisclosure(false);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  if (!currentUser) {
    return <UserSelect onSelect={user => {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }}/>
  }

  return (
    <>
      <Header height={60} px="md">
        <Group position="apart" style={{ height: '100%' }}>
          <Burger opened={statsOpened} onClick={openStats} />
          <Text weight={700}>{currentUser.name}</Text>
          <div style={{ width: 40 }} />
        </Group>
      </Header>

      <Group direction="column" align="center" spacing="lg" mt="xl">
        <Avatar size={100} src={currentUser.avatarUrl} />
        <Text>Balance: €{currentUser.balance}</Text>
        <Group>
          <Button onClick={() => {/* call drink endpoint */}}>+1 Drink</Button>
          <Button>Top Up</Button>
        </Group>
      </Group>

      <Modal opened={statsOpened} onClose={closeStats} title="Statistics">
        {/* Stats content */}
      </Modal>
    </>
  );
}