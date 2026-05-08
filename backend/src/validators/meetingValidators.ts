import { z } from 'zod';

export const createMeetingSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    startTime: z.string().datetime({ message: 'Invalid start time format (ISO 8601 required)' }),
    endTime: z.string().datetime({ message: 'Invalid end time format (ISO 8601 required)' }),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
});

export const updateMeetingSchema = z.object({
    title: z.string().min(1, 'Title must not be empty').max(255).optional(),
    description: z.string().max(1000).optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
}).refine((data) => {
    if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
}, {
    message: 'End time must be after start time',
    path: ['endTime'],
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
