import { FC, useEffect, useState } from "react";
import Calendar from "react-calendar";
import { Plus } from "lucide-react";
import { api } from "../../api/api";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import {
  ConfirmModal,
  CreateMeetingModal,
  MeetingCard,
  MeetingDetailsModal,
  Sidebar,
} from "../../components";
import { Meeting } from "../../types";
import { toast } from "sonner";

export const Dashboard: FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [date, setDate] = useState<Date>(new Date());
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
  });

  const fetchMeetings = async () => {
    try {
      const response = await api.get("/meetings/my");
      setMeetings(response.data);
    } catch (error) {
      console.error("Failed to fetch meetings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleFormSubmit = async (formData: Meeting) => {
    try {
      const baseDate = new Date(date);
      if (formData.date) {
        const [yyyy, mm, dd] = formData.date.split("-").map(Number);
        baseDate.setFullYear(yyyy, mm - 1, dd);
      }
      const start = new Date(baseDate);
      const [sH, sM] = formData.startTime.split(":");
      start.setHours(parseInt(sH), parseInt(sM), 0, 0);

      const end = new Date(baseDate);
      const [eH, eM] = formData.endTime.split(":");
      end.setHours(parseInt(eH), parseInt(eM), 0, 0);

      const { date: _, ...rest } = formData;
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

      if (editingMeetingId) {
        await api.put(`/meetings/${editingMeetingId}`, payload);
        toast.success("Meeting updated");
      } else {
        await api.post("/meetings", payload);
        toast.success("Meeting created");
      }

      setShowCreateModal(false);
      setEditingMeetingId(null);
      fetchMeetings();
    } catch (error: any) {
      toast.error(
        `failed to save meeting + ${error.response?.data?.message || ""}`,
      );
    }
  };

  const confirmDelete = async () => {
    if (!isDeleting) return;
    try {
      await api.delete(`/meetings/${isDeleting}`);
      setIsDeleting(null);
      setSelectedMeeting(null);
      fetchMeetings();
      toast.success("Meeting deleted");
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete meeting");
    }
  };

  const startEditing = ({
    id,
    address,
    latitude,
    longitude,
    title,
    description,
    endTime,
    startTime,
  }: Meeting) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    setEditingData({
      title: title,
      description: description,
      startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
      date: start.toISOString().split("T")[0],
      address: address || "",
      latitude: latitude?.toString() || "",
      longitude: longitude?.toString() || "",
    });

    setEditingMeetingId(id);
    setShowCreateModal(true);
    setSelectedMeeting(null);
  };

  const meetingsOnSelectedDate = meetings.filter((m: Meeting) => {
    const mDate = new Date(m.startTime);
    return mDate.toDateString() === date.toDateString();
  });

  if (loading) return <div className="auth-container">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <header className="header-section">
          <div>
            <h1>Dashboard</h1>
            <p className="subtitle">Manage your schedule and locations</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => {
                setEditingMeetingId(null);
                setShowCreateModal(true);
              }}
              className="btn-primary new-meeting-btn"
            >
              <Plus size={18} /> New Meeting
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <aside>
            <Calendar
              onChange={(val: any) => setDate(val as Date)}
              value={date}
              className="custom-calendar"
            />
            <div className="overview-card">
              <h3>Today's Overview</h3>
              <p className="overview-count">{meetingsOnSelectedDate.length}</p>
              <p className="subtitle">Meetings scheduled</p>
            </div>
          </aside>

          <main>
            <div className="main-content-header">
              <h2>
                {date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
            </div>

            <div
              className="meeting-grid"
              style={{ gridTemplateColumns: "1fr", marginTop: 0 }}
            >
              {meetingsOnSelectedDate.length === 0 ? (
                <div className="empty-state">
                  <p className="subtitle">No meetings for this day.</p>
                </div>
              ) : (
                meetingsOnSelectedDate.map((meeting: Meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    setSelectedMeeting={setSelectedMeeting}
                  />
                ))
              )}
            </div>
          </main>
        </div>

        <CreateMeetingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleFormSubmit}
          selectedDate={date}
          initialData={editingData}
          editing={!!editingMeetingId}
        />

        <MeetingDetailsModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onEdit={startEditing}
          onDelete={(id) => {
            setIsDeleting(id);
            setSelectedMeeting(null);
          }}
        />

        <ConfirmModal
          isOpen={!!isDeleting}
          title="Delete Meeting"
          message="Are you sure you want to delete this meeting? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleting(null)}
        />
      </div>
    </div>
  );
};
