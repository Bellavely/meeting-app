import { Router } from 'express';
import {createMeeting,getMyMeetings,updateMeeting,deleteMeeting} from '../api/controllers/meetingController';
import { authMiddleware } from '../middleware/authMiddleware';

export const meetingRouter = Router();

meetingRouter.use(authMiddleware);

meetingRouter.post('/', createMeeting);
meetingRouter.get('/my', getMyMeetings);
meetingRouter.put('/:id', updateMeeting);
meetingRouter.delete('/:id',deleteMeeting);

