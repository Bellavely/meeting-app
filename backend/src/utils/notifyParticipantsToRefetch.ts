import { Server } from "socket.io";

export const notifyParticipantsToRefetch = (
  server: Server | undefined | null,
  participants: string[] | undefined,
) => {
  if (participants && server && participants.length > 0) {
    for (const participantId of participants) {
      server.to(participantId).emit("refetch_meetings");
    }
  }
};
