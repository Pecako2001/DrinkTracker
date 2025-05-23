import React from "react";
import { Card, ScrollArea, Table, Title, Anchor } from "@mantine/core"; // Added Anchor
import { motion } from 'framer-motion';
import { Person } from "../../types";
import classes from "../../styles/OverviewDashboard.module.css"; // Corrected import

interface LeaderboardProps {
  users: Person[];
  onUserClick?: (userId: string | number) => void; // Added prop
}

const listVariants = {
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  hidden: {}
};

const itemVariants = {
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, x: -20 }
};

export function YearlyLeaderboard({ users, onUserClick }: LeaderboardProps) {
  // TODO: Update to use actual yearly drink data when available
  const sorted = [...users].sort((a, b) => b.total_drinks - a.total_drinks);

  return (
    <Card
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      style={{ flex: 1 }}
      className={classes.leaderboardCard}
    >
      <Title order={4} mb="sm">
        This Year
      </Title>
      <ScrollArea>
        <Table striped highlightOnHover className={classes.leaderboardTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th style={{ textAlign: "right" }}>Drinks</th> 
            </tr>
          </thead>
          <motion.tbody initial="hidden" animate="visible" variants={listVariants}>
            {sorted.map((u, i) => (
              <motion.tr 
                key={u.id} 
                variants={itemVariants}
                onClick={() => onUserClick?.(u.id)}
                style={{ cursor: onUserClick ? 'pointer' : 'default' }}
                className={classes.leaderboardRow}
              >
                <td>{i + 1}</td>
                <td>
                  <Anchor 
                    component="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserClick?.(u.id);
                    }}
                    className={classes.leaderboardAnchor}
                  >
                    {u.name}
                  </Anchor>
                </td>
                <td style={{ textAlign: "right" }}>
                  {u.total_drinks.toLocaleString()}{" "}
                  {/* TODO: Display actual yearly drink count */}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}