import { useState } from "react";
import { api } from "../api/api";
import { Meeting, Participant } from "../types";
import { toast } from "sonner";

export const useMeetingActions = (onSuccess?: () => void) => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingData, setEditingData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "00:00",
    endTime: "00:00",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [editingParticipants, setEditingParticipants] = useState<Participant[]>(
    [],
  );

  const startEditing = (meeting: Meeting) => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    setEditingData({
      title: meeting.title,
      description: meeting.description || "",
      startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
      date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
      address: meeting.address || "",
      latitude: meeting.latitude?.toString() || "",
      longitude: meeting.longitude?.toString() || "",
    });
    setEditingParticipants(meeting.participants || []);

    setEditingMeetingId(meeting.id);
    setShowCreateModal(true);
    setSelectedMeeting(null);
  };

  const openCreateModal = (defaultDate?: Date) => {
    setEditingMeetingId(null);
    setEditingData({
      title: "",
      description: "",
      startTime: "00:00",
      endTime: "00:00",
      date: defaultDate
        ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
        : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
      address: "",
      latitude: "",
      longitude: "",
    });
    setEditingParticipants([]);
    setShowCreateModal(true);
  };

  const handleFormSubmit = async (formData: Meeting) => {
    setIsSubmitting(true);
    try {
      let start = new Date();
      let end = new Date();

      if (formData.date) {
        const [year, month, day] = formData.date.split("-").map(Number);
        // month is 0-indexed in Date constructor
        start = new Date(year, month - 1, day);
        end = new Date(year, month - 1, day);
      }

      const [sH, sM] = formData.startTime.split(":");
      start.setHours(parseInt(sH, 10), parseInt(sM, 10), 0, 0);

      const [eH, eM] = formData.endTime.split(":");
      end.setHours(parseInt(eH, 10), parseInt(eM, 10), 0, 0);

      const { date: _, participants, ...rest } = formData;
      const payload = {
        ...rest,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        latitude: formData.latitude
          ? parseFloat(String(formData.latitude))
          : undefined,
        longitude: formData.longitude
          ? parseFloat(String(formData.longitude))
          : undefined,
      };

      let meetingId = editingMeetingId;
      if (editingMeetingId) {
        await api.put(`/meetings/${editingMeetingId}`, payload);
        toast.success("Meeting updated");
      } else {
        const response = await api.post("/meetings", payload);
        meetingId = response.data.id;
        toast.success("Meeting created");
      }

      // Sync participants
      if (meetingId && participants) {
        try {
          await api.post(`/meetings/${meetingId}/participants/sync`, {
            emails: participants.map((p) => p.email),
          });
        } catch (e) {
          console.error("Failed to sync participants", e);
        }
      }

      setShowCreateModal(false);
      setEditingMeetingId(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(
        `Failed to save meeting: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!isDeleting) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/meetings/${isDeleting}`);
      setIsDeleting(null);
      setSelectedMeeting(null);
      toast.success("Meeting deleted");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirmation = (id: string) => {
    setIsDeleting(id);
    setSelectedMeeting(null);
  };
  

  return {
    selectedMeeting,
    setSelectedMeeting,
    showCreateModal,
    setShowCreateModal,
    editingMeetingId,
    editingData,
    isDeleting,
    setIsDeleting,
    isSubmitting,
    startEditing,
    openCreateModal,
    handleFormSubmit,
    confirmDelete,
    openDeleteConfirmation,
  };
};
