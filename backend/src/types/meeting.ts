export type Meeting ={
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    organizerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateMeetingInput = Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMeetingInput = Partial<CreateMeetingInput>;
