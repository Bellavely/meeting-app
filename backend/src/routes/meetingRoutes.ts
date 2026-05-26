import { Router } from "express";
import {
  createMeeting,
  getMyMeetings,
  queryMeetings,
  updateMeeting,
  deleteMeeting,
  getMyInvitations,
  getMeetingParticipants,
  inviteParticipant,
  respondToInvitation,
  isDoubleBooked,
  getMeetingsByCalendar,
} from "../api/controllers";
import { authMiddleware } from "../middleware";

export const meetingRouter = Router();

meetingRouter.use(authMiddleware);

meetingRouter.get("/my", getMyMeetings);
meetingRouter.get("/calendar", getMeetingsByCalendar);
meetingRouter.get("/query", queryMeetings);
meetingRouter.get("/double-booking-check", isDoubleBooked);
meetingRouter.get("/invitations", getMyInvitations);
meetingRouter.get("/:id/participants", getMeetingParticipants);

meetingRouter.post("/", createMeeting);
meetingRouter.post("/:id/invite", inviteParticipant);

meetingRouter.put("/:id/respond", respondToInvitation);
meetingRouter.put("/:id", updateMeeting);

meetingRouter.delete("/:id", deleteMeeting);
