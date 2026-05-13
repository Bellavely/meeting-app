import { Router } from "express";
import {
  createMeeting,
  getMyMeetings,
  queryMeetings,
  updateMeeting,
  deleteMeeting,
  getMyInvitations,
  getMeetingParticipants,
  syncMeetingParticipants,
  inviteParticipant,
  respondToInvitation,
} from "../api/controllers";
import { authMiddleware } from "../middleware";

export const meetingRouter = Router();

meetingRouter.use(authMiddleware);

meetingRouter.post("/", createMeeting);
meetingRouter.get("/my", getMyMeetings);
meetingRouter.get("/query", queryMeetings);
meetingRouter.get("/invitations", getMyInvitations);
meetingRouter.get("/:id/participants", getMeetingParticipants);
meetingRouter.post("/:id/participants/sync", syncMeetingParticipants);
meetingRouter.post("/:id/invite", inviteParticipant);
meetingRouter.put("/:id/respond", respondToInvitation);
meetingRouter.put("/:id", updateMeeting);
meetingRouter.delete("/:id", deleteMeeting);
