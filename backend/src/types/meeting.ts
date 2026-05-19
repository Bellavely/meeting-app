export type Meeting = {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  address?: string;
  latitude?: number;
  longitude?: number;
  organizerId: string;
  createdAt?: Date;
  updatedAt?: Date;
  participantsId?: string[];
};

export type CreateMeetingInput = Omit<
  Meeting,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateMeetingInput = Partial<CreateMeetingInput>;

// DTO for controller-to-service communication if needed, or just use partial
export type MeetingDTO = Omit<
  CreateMeetingInput,
  "organizerId" | "startTime" | "endTime"
> & {
  startTime: string;
  endTime: string;
  participants?: string[];
};

export enum ParticipationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export type Participant = {
  id: string;
  userId: string;
  meetingId: string;
  status: ParticipationStatus;
  createdAt: Date;
  updatedAt: Date;
  // Optional joined user data
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
};
