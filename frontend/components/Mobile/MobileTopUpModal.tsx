import React from "react";
import {
  Modal,
  NumberInput,
  Button,
  Stack,
  Text,
  Group,
  SegmentedControl,
  Divider,
  Title,
} from "@mantine/core";

interface MobileTopUpModalProps {
  opened: boolean;
  amount: number;
  onChangeAmount: (value: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const presetAmounts = ["5", "10", "25"];

const MobileTopUpModal: React.FC<MobileTopUpModalProps> = ({
  opened,
  amount,
  onChangeAmount,
  onConfirm,
  onClose,
}) => (
  <Modal
    opened={opened}
    onClose={onClose}
    centered
    size="xs"
    title={
      <Title order={4} ta="center">
        Top Up Balance
      </Title>
    }
    radius="md"
    padding="lg"
  >
    <Stack gap="md" align="center">
      <Text ta="center" c="dimmed" mb={4}>
        Choose a preset amount or enter a custom value.
      </Text>
      <SegmentedControl
        fullWidth
        w="100%"
        data={presetAmounts.map((v) => ({ label: `€${v}`, value: v }))}
        value={amount.toString()}
        onChange={(value) => onChangeAmount(Number(value))}
      />
      <Divider my="xs" />
      <NumberInput
        label="Custom amount"
        min={1}
        value={amount}
        onChange={(val) => typeof val === "number" && onChangeAmount(val)}
        hideControls
        styles={{
          input: { textAlign: "center", fontSize: 20 },
          label: { width: "100%", textAlign: "center" },
        }}
      />
      <Group justify="center" mt="md" gap="sm" w="100%">
        <Button variant="light" color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button color="teal" onClick={onConfirm}>
          Proceed to Checkout
        </Button>
      </Group>
    </Stack>
  </Modal>
);

export default MobileTopUpModal;
