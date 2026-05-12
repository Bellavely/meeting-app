import { Router } from 'express';
import {createMeeting,getMyMeetings,queryMeetings,updateMeeting,deleteMeeting} from '../api/controllers/meetingController';
import { authMiddleware } from '../middleware/authMiddleware';

export const meetingRouter = Router();

meetingRouter.use(authMiddleware);

meetingRouter.post('/', createMeeting);
meetingRouter.get('/my', getMyMeetings);
meetingRouter.get('/query', queryMeetings);
meetingRouter.put('/:id', updateMeeting);
meetingRouter.delete('/:id',deleteMeeting);

