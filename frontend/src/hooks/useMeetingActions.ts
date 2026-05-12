import { useState } from "react";
import { api } from "../api/api";
import { Meeting } from "../types";
import { toast } from "sonner";

export const useMeetingActions = (onSuccess?: () => void) => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [editingData, setEditingData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "00:00",
    endTime: "00:00",
    address: "",
    latitude: "",
    longitude: "",
    participants: [] as any[],
  });

  const startEditing = (meeting: Meeting & { participants?: any[] }) => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    
    setEditingData({
      title: meeting.title,
      description: meeting.description || "",
      startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
      date: start.toISOString().split("T")[0],
      address: meeting.address || "",
      latitude: meeting.latitude?.toString() || "",
      longitude: meeting.longitude?.toString() || "",
      participants: meeting.participants || [],
    });

    setEditingMeetingId(meeting.id);
    setShowCreateModal(true);
    setSelectedMeeting(null);
  };

  const openCreateModal = (defaultDate?: Date) => {
    setEditingMeetingId(null);
    setEditingData({
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
      date: defaultDate ? defaultDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      address: "",
      latitude: "",
      longitude: "",
      participants: [],
    });
    setShowCreateModal(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      // Use the date from formData if present, otherwise today
      const baseDate = formData.date ? new Date(formData.date) : new Date();
      
      const start = new Date(baseDate);
      const [sH, sM] = formData.startTime.split(":");
      start.setHours(parseInt(sH), parseInt(sM), 0, 0);

      const end = new Date(baseDate);
      const [eH, eM] = formData.endTime.split(":");
      end.setHours(parseInt(eH), parseInt(eM), 0, 0);

      const { date: _, participants, ...rest } = formData;
      const payload = {
        ...rest,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        latitude: formData.latitude ? parseFloat(String(formData.latitude)) : undefined,
        longitude: formData.longitude ? parseFloat(String(formData.longitude)) : undefined,
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
            emails: participants.map((p: any) => p.email),
          });
        } catch (e) {
          console.error("Failed to sync participants", e);
        }
      }

      setShowCreateModal(false);
      setEditingMeetingId(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(`Failed to save meeting: ${error.response?.data?.message || error.message}`);
    }
  };

  const confirmDelete = async () => {
    if (!isDeleting) return;
    try {
      await api.delete(`/meetings/${isDeleting}`);
      setIsDeleting(null);
      setSelectedMeeting(null);
      toast.success("Meeting deleted");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete meeting");
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
    startEditing,
    openCreateModal,
    handleFormSubmit,
    confirmDelete,
    openDeleteConfirmation,
  };
};
