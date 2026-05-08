export type Meeting ={
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    address?: string;
    latitude?: number;
    longitude?: number;
    organizerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateMeetingInput = Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMeetingInput = Partial<CreateMeetingInput>;
