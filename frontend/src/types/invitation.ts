import { Meeting } from "./meeting";

export type Invitation = {
  id: string;
  endTime: string;
  startTime: string;
  title: string;
  meetingId: string;
  organizerFirstName: string;
  organizerLastName: string;
  meeting: Omit<Meeting, "id" | "participants" | "latitude" | "longitude">;
};
