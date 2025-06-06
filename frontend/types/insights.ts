export interface PeakThirstHoursResult {
  userId: number;
  hours: number[]; // length 24, count of drinks per hour
}

export type PeakThirstHoursResponse = PeakThirstHoursResult[];

export interface MonthlyVolumeEntry {
  userId: number;
  month: string; // YYYY-MM
  count: number;
}
