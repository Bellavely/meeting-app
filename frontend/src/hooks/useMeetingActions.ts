import { useState } from "react";
import { api } from "../services";
import { Meeting } from "../types";
import { toast } from "sonner";

export const useMeetingActions = (onSuccess?: () => void) => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingData, setEditingData] = useState<Meeting>({
    title: "",
    description: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    address: "",
    participants: [],
  });

  const startEditing = (meeting: Meeting) => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    setEditingData({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description || "",
      startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
      date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
      address: meeting.address || "",
      latitude: Number(meeting.latitude?.toString()),
      longitude: Number(meeting.longitude?.toString()),
      participants: meeting.participants || [],
    });

    setShowCreateModal(true);
    setSelectedMeeting(null);
  };

  const openCreateModal = (defaultDate?: Date) => {
    setEditingData({
      id: "",
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
      date: defaultDate
        ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
        : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
      address: "",
      latitude: 0,
      longitude: 0,
      participants: [],
    });
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
        participants: participants
          ? participants.filter((p) => p.id).map((p) => p.id)
          : undefined,
      };

      if (editingData.id) {
        await api.put(`/meetings/${editingData.id}`, payload);
        toast.success("Meeting updated");
      } else {
        await api.post("/meetings", payload);
        toast.success("Meeting created");
      }

      setShowCreateModal(false);
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
