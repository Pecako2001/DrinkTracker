import React from "react";
import {
  Modal,
  NumberInput,
  Button,
  Stack,
  Text,
  Group,
  SegmentedControl,
  Title,
} from "@mantine/core";
import styles from "./Mobile.module.css";

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
      <NumberInput
        label="Custom amount:"
        min={1}
        decimalScale={2}
        value={amount}
        onChange={(val) => typeof val === "number" && onChangeAmount(val)}
        hideControls
        prefix="€"
        className={styles.numberInput}
        classNames={{
          input: styles.centeredInput,
          label: styles.centeredLabel,
        }}
      />
      <Text size="sm" c="dimmed" w="100%" ta="center">
        Note that every transaction has a 0.30€ fee.
      </Text>
      <Group justify="center" mt="md" gap="sm" w="100%">
        <Button className={styles.button} onClick={onConfirm}>
          Proceed to Checkout
        </Button>
        <Button className={styles.cancelbutton} onClick={onClose}>
          Cancel
        </Button>
      </Group>
    </Stack>
  </Modal>
);

export default MobileTopUpModal;
