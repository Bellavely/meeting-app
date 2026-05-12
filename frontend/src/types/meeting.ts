export type Meeting = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  organizerId?: string;
  participants?: any[];
};

