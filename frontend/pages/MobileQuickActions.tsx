import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Container, Title, Loader, Button, Box, Text, Stack } from '@mantine/core'; // Removed Paper, Group as they are now encapsulated in UserQuickActionsDisplay
import api from '../api/api';
import { Person } from '../types';
import UserQuickActionsDisplay from '../components/Mobile/UserQuickActionsDisplay';

const MobileQuickActionsPage: React.FC = () => {
  const [user, setUser] = useState<Person | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState({ drink: false, topup: false });
  const router = useRouter();

  const fetchUserData = useCallback(async (userId: string) => {
    setLoading(true); // Ensure loading is true when fetching
    try {
      const response = await api.get<Person>(`/users/${userId}`);
      setUser(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError('Failed to load user data. Please try again or re-select user.');
      setUser(null); // Clear user data on error
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed as it's a stable function defined within the component scope

  useEffect(() => {
    const userId = Cookies.get('selected_user_id');
    if (!userId) {
      router.push('/MobileUserSelect');
      setLoading(false); // Stop loading as we are redirecting
      return;
    }
    fetchUserData(userId);
  }, [router, fetchUserData]); // fetchUserData is now a dependency

  const handleAddDrink = async () => {
    if (!user) return;
    setActionLoading(prev => ({ ...prev, drink: true }));
    try {
      await api.post(`/users/${user.id}/drinks`);
      await fetchUserData(user.id.toString()); // Refresh user data
    } catch (err) {
      console.error("Failed to add drink:", err);
      setError('Failed to add drink. Please try again.');
      // Optionally, you might want to show a more specific error to the user
    } finally {
      setActionLoading(prev => ({ ...prev, drink: false }));
    }
  };

  const handleTopUp = async () => {
    if (!user) return;
    setActionLoading(prev => ({ ...prev, topup: true }));
    try {
      // The backend's simulated create_payment updates the balance directly
      await api.post('/payments/topup', { user_id: user.id, amount: 5 });
      await fetchUserData(user.id.toString()); // Refresh user data
    } catch (err) {
      console.error("Failed to top up:", err);
      setError('Failed to top up balance. Please try again.');
      // Optionally, show specific error
    } finally {
      setActionLoading(prev => ({ ...prev, topup: false }));
    }
  };

  if (loading && !user) { // Show loader only if truly loading initial data
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
        <Title order={2} c="red.500" ta="center">Error</Title>
        <Text ta="center">{error}</Text>
        <Button onClick={() => {
          const userId = Cookies.get('selected_user_id');
          if (userId) fetchUserData(userId);
          else router.push('/MobileUserSelect');
        }} mt="md">
          Try Again
        </Button>
        <Button onClick={() => router.push('/MobileUserSelect')} mt="sm" variant="outline">
          Select Different User
        </Button>
      </Container>
    );
  }

  if (!user) { // Should ideally be covered by loading or error state, but as a fallback
    return (
        <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Text>No user data available. You might need to re-select a user.</Text>
            <Button onClick={() => router.push('/MobileUserSelect')} mt="md">
                Go to User Selection
            </Button>
        </Container>
    );
  }

  return (
    <Container py="xl">
      <Title order={1} ta="center" mb="xl">
        Quick Actions
      </Title>
      
      <Box mb="xl"> {/* Added Box for consistent spacing */}
        <UserQuickActionsDisplay user={user} />
      </Box>

      <Stack>
        <Button
          onClick={handleAddDrink}
          loading={actionLoading.drink}
          disabled={actionLoading.topup} // Disable if other action is in progress
          size="lg"
          variant="filled"
        >
          +1 Drink
        </Button>
        <Button
          onClick={handleTopUp}
          loading={actionLoading.topup}
          disabled={actionLoading.drink} // Disable if other action is in progress
          size="lg"
          variant="outline"
        >
          Top Up (5 EUR)
        </Button>
      </Stack>
      
      <Button onClick={() => router.push('/MobileUserSelect')} mt="xl" variant="light" fullWidth>
        Change User
      </Button>
    </Container>
  );
};

export default MobileQuickActionsPage;