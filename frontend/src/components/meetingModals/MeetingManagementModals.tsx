import { FC } from "react";
import { CreateMeetingModal } from "./CreateMeetingModal";
import { MeetingDetailsModal } from "./MeetingDetailsModal";
import { ConfirmModal } from "../confirmModal";
import { Meeting } from "../../types";

type MeetingManagementModalsProps = {
  selectedMeeting: Meeting | null;
  setSelectedMeeting: (meeting: Meeting | null) => void;
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  editingData: any;
  editingMeetingId: string | null;
  isDeleting: string | null;
  setIsDeleting: (id: string | null) => void;
  startEditing: (meeting: Meeting & { participants?: any[] }) => void;
  handleFormSubmit: (formData: any) => Promise<void>;
  confirmDelete: () => Promise<void>;
  openDeleteConfirmation: (id: string) => void;
  meetings: Meeting[];
};

export const MeetingManagementModals: FC<MeetingManagementModalsProps> = ({
  selectedMeeting,
  setSelectedMeeting,
  showCreateModal,
  setShowCreateModal,
  editingData,
  editingMeetingId,
  isDeleting,
  setIsDeleting,
  startEditing,
  handleFormSubmit,
  confirmDelete,
  openDeleteConfirmation,
  meetings,
}) => {
  return (
    <>
      <CreateMeetingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleFormSubmit}
        initialData={editingData}
        editingMeetingId={editingMeetingId}
        meetings={meetings}
      />

      <MeetingDetailsModal
        meeting={selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        onEdit={startEditing}
        onDelete={openDeleteConfirmation}
      />

      <ConfirmModal
        isOpen={!!isDeleting}
        title="Delete Meeting"
        message="Are you sure you want to delete this meeting? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleting(null)}
      />
    </>
  );
};
