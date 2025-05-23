mport React, { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { Box, Grid, Flex, Paper, Select, Title, Text, Card, Group, ThemeIcon, Stack, Avatar, Tooltip } from '@mantine/core'; // Added Stack, Avatar, Tooltip
import { IconUserSearch, IconArrowUpRight, IconArrowDownRight, IconMail, IconGlassFull } from '@tabler/icons-react'; // Added more icons
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import classes from '../../styles/OverviewDashboard.module.css';
import api from '../../api/api';
import { Person } from '../../types';
import { MonthlyLeaderboard } from './MonthlyLeaderboard';
import { YearlyLeaderboard } from './YearlyLeaderboard';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: i * 0.1 }, // Changed to spring
  }),
};

const leaderboardPaperVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.2 }, // Changed to spring
  }
};

const panelVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
};

const OverviewDashboard: React.FC = () => {
  const [thisMonth, setThisMonth] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [thisYear, setThisYear] = useState(0);
  const [lastYear, setLastYear] = useState(0);
  const [users, setUsers] = useState<Person[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Derived state for selectedUser
  const selectedUser = useMemo(() => {
    return users.find(user => user.id.toString() === selectedUserId);
  }, [users, selectedUserId]);

  useEffect(() => {
    // Fetch overall stats
    api.get("/stats/drinks_this_month").then((res) => setThisMonth(res.data));
    api.get("/stats/drinks_last_month").then((res) => setLastMonth(res.data));
    api.get("/stats/drinks_this_year").then((res) => setThisYear(res.data));
    api.get("/stats/drinks_last_year").then((res) => setLastYear(res.data));

    // Fetch users
    api.get<Person[]>("/users").then((res) => setUsers(res.data));
  }, []);

  const calcChange = (curr: number, prev: number) => {
    const diff = curr - prev;
    const perc = prev === 0 ? 100 : Math.round((diff / prev) * 100);
    const positive = diff >= 0;

    return {
      value: `${positive ? "+" : ""}${perc}%`,
      icon: positive ? (
        <IconArrowUpRight size={16} />
      ) : (
        <IconArrowDownRight size={16} />
      ),
      color: positive ? "teal" : "red",
    };
  };

  const monthChange = calcChange(thisMonth, lastMonth);
  const yearChange = calcChange(thisYear, lastYear);

  const handleUserSelect = (userId: string | number) => {
    const userIdStr = userId.toString();
    console.log("Selected user ID in OverviewDashboard:", userIdStr);
    setSelectedUserId(userIdStr);
    // Further logic for User Detail Panel will be added here
  };

  return (
    <Box p="md" className={classes.dashboardContainer}>
      <Flex mb="lg" justify="flex-start" className={classes.userSelectContainer}>
        <Select
          label="Select User"
          placeholder="Search or select a user"
          data={users.map(user => ({ value: user.id.toString(), label: user.name }))}
          value={selectedUserId}
          onChange={(value) => {
            if (value) handleUserSelect(value);
          }}
          searchable
          leftSection={<IconUserSearch size="1rem" />}
          style={{ flexGrow: 1, maxWidth: 400 }}
        />
      </Flex>

      <Grid>
        {/* Overall Stats Section */}
        {/* Desktop: 3 cols (Stats | Leaderboards | UserDetails) -> lg:3 / lg:6 / lg:3 */}
        {/* Tablet: 2 cols (Stats | Leaderboards) then (UserDetails full) -> md:4 / md:8 then md:12 */}
        {/* Mobile: 1 col (Stats) then (Leaderboards) then (UserDetails) -> all base:12 */}
        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
          <Paper p="md" shadow="xs" mb="lg" className={classes.sectionPaper}>
            <Title order={3} mb="md" className={classes.sectionTitle}>Overall Stats</Title>
            <Grid gutter="md">
              {/* Overall Stats Cards: stack on xs, side-by-side on sm+, then stack again on md when section is narrow */}
              <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 12 }}>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <Card radius="md" p="sm" className={classes.statCard}>
                    <Text size="xs" fw={700} c="dimmed" mb={5}>
                      DRINKS THIS MONTH
                    </Text>
                    <Group justify="space-between" align="flex-end">
                      <Title order={2}>{thisMonth.toLocaleString()}</Title>
                      <Tooltip
                        label="Compared to last month"
                        withArrow
                        position="bottom"
                        transitionProps={{ transition: 'pop', duration: 300 }}
                      >
                        <Group gap={4}>
                          <Text c={monthChange.color} fw={500} size="sm">
                            {monthChange.value}
                          </Text>
                          <ThemeIcon size="sm" variant="light" color={monthChange.color}>
                            {monthChange.icon}
                          </ThemeIcon>
                        </Group>
                      </Tooltip>
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>
                      Compared to previous month
                    </Text>
                  </Card>
                </motion.div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 12 }}>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <Card radius="md" p="sm" className={classes.statCard}>
                    <Text size="xs" fw={700} c="dimmed" mb={5}>
                      DRINKS THIS YEAR
                    </Text>
                    <Group justify="space-between" align="flex-end">
                      <Title order={2}>{thisYear.toLocaleString()}</Title>
                      <Tooltip
                        label="Compared to last year"
                        withArrow
                        position="bottom"
                        transitionProps={{ transition: 'pop', duration: 300 }}
                      >
                        <Group gap={4}>
                          <Text c={yearChange.color} fw={500} size="sm">
                            {yearChange.value}
                          </Text>
                          <ThemeIcon size="sm" variant="light" color={yearChange.color}>
                            {yearChange.icon}
                          </ThemeIcon>
                        </Group>
                      </Tooltip>
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>
                      Compared to previous year
                    </Text>
                  </Card>
                </motion.div>
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>

        {/* Leaderboards Section */}
        <Grid.Col span={{ base: 12, md: 8, lg: 6 }}>
          <motion.div
            variants={leaderboardPaperVariants}
            initial="hidden"
            animate="visible"
          >
            <Paper p="md" shadow="xs" mb="lg" className={classes.sectionPaper}>
              <Title order={3} mb="md" className={classes.sectionTitle}>Leaderboards</Title>
              <Grid>
                {/* Leaderboard Cards: stack on base/xs, side-by-side on sm+ */}
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <MonthlyLeaderboard users={users} onUserClick={handleUserSelect} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <YearlyLeaderboard users={users} onUserClick={handleUserSelect} />
                </Grid.Col>
              </Grid>
            </Paper>
          </motion.div>
        </Grid.Col>

        {/* User Detail Panel Section */}
        <Grid.Col span={{ base: 12, md: 12, lg: 3 }}>
          <Paper p="md" shadow="sm" withBorder mb="lg" className={classes.sectionPaper}>
            <Title order={3} mb="md" className={classes.sectionTitle}>User Details</Title>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedUser ? selectedUser.id : 'no-user-selected'}
                className={classes.userDetailContent}
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {selectedUser ? (
                  <Stack>
                    <Group>
                      <Avatar src={selectedUser.profile_picture_url} alt={selectedUser.name} radius="xl" size="lg" className={classes.userDetailAvatar} />
                      <Box>
                        <Title order={4} className={classes.userDetailName}>{selectedUser.name}</Title>
                        <Group gap="xs">
                           <IconMail size="1rem" className={classes.userDetailStatIcon} /> 
                           <Text c="dimmed" size="sm" className={classes.userDetailEmail}>{selectedUser.email}</Text>
                        </Group>
                      </Box>
                    </Group>
                    <Group mt="md" className={classes.userDetailStatItem}>
                        <IconGlassFull size="1.2rem" className={classes.userDetailStatIcon} />
                        <Text fw={500}>Total Drinks:</Text>
                        <Text>{selectedUser.total_drinks?.toLocaleString() || 'N/A'}</Text>
                    </Group>
                    <Text mt="sm" c="dimmed" size="sm" className={classes.userDetailPlaceholder}>
                      More detailed stats for this user will be shown here (e.g., monthly consumption chart, recent activity).
                    </Text>
                  </Stack>
                ) : (
                  <Text c="dimmed" className={classes.userDetailPlaceholder}>Select a user to see their details.</Text>
                )}
              </motion.div>
            </AnimatePresence>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default OverviewDashboard;