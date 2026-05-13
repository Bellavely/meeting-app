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
  participants?: Participant[];
};

export type Participant = {
  email: string;
  firstName: string;
  lastName: string;
  status: "pending" | "accepted" | "declined";
};
