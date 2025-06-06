import React from "react";
import {
  Modal,
  SegmentedControl,
  NumberInput,
  Button,
  Stack,
  Title,
  Text,
  Divider,
  Group,
} from "@mantine/core";

interface TopUpModalProps {
  opened: boolean;
  userName: string | null;
  amount: number;
  onChangeAmount: (value: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function TopUpModal({
  opened,
  userName,
  amount,
  onChangeAmount,
  onConfirm,
  onClose,
}: TopUpModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="sm"
      title={<Title order={4}>Top up {userName}</Title>}
    >
      <Stack gap={20}>
        <Text size="sm" color="dimmed">
          Choose a preset amount or enter a custom value below.
        </Text>

        <SegmentedControl
          data={[
            { label: "€5", value: "5" },
            { label: "€10", value: "10" },
            { label: "€25", value: "25" },
          ]}
          value={amount.toString()}
          onChange={(value) => onChangeAmount(Number(value))}
        />

        <Divider my="sm" />

        <NumberInput
          label="Custom amount"
          min={1}
          value={amount}
          onChange={(val) => typeof val === "number" && onChangeAmount(val)}
          hideControls
        />

        <Text size="sm" color="dimmed">
          Note: €0.30 fee applies to all top-ups
        </Text>
        <Group justify="space-between" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Proceed to Checkout</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
