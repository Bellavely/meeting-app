import { Router } from 'express';
import {createMeeting,getMyMeetings,queryMeetings,updateMeeting,deleteMeeting} from '../api/controllers/meetingController';
import * as participantController from '../api/controllers/participantController';
import { authMiddleware } from '../middleware/authMiddleware';

export const meetingRouter = Router();

meetingRouter.use(authMiddleware);

meetingRouter.post('/', createMeeting);
meetingRouter.get('/my', getMyMeetings);
meetingRouter.get('/query', queryMeetings);
meetingRouter.get('/invitations', participantController.getMyInvitations);
meetingRouter.get('/:id/participants', participantController.getMeetingParticipants);
meetingRouter.post('/:id/participants/sync', participantController.syncMeetingParticipants);
meetingRouter.post('/:id/invite', participantController.inviteParticipant);
meetingRouter.put('/:id/respond', participantController.respondToInvitation);
meetingRouter.put('/:id', updateMeeting);
meetingRouter.delete('/:id',deleteMeeting);
