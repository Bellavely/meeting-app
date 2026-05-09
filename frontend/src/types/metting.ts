export type Meeting = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};
