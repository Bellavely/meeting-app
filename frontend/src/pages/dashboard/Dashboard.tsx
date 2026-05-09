import { FC, useEffect, useState } from "react";
import Calendar from "react-calendar";
import { Calendar as CalendarIcon, Plus, LogOut } from "lucide-react";
import { api } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import {
  ConfirmModal,
  CreateMeetingModal,
  MeetingCard,
  MeetingDetailsModal,
} from "../../components";
import { Meeting } from "../../types";

export const Dashboard: FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
      const start = new Date(date);
      const [sH, sM] = formData.startTime.split(":");
      start.setHours(parseInt(sH), parseInt(sM));

      const end = new Date(date);
      const [eH, eM] = formData.endTime.split(":");
      end.setHours(parseInt(eH), parseInt(eM));

      const payload = {
        ...formData,
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
      } else {
        await api.post("/meetings", payload);
      }

      setShowCreateModal(false);
      setEditingMeetingId(null);
      fetchMeetings();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save meeting");
    }
  };

  const confirmDelete = async () => {
    if (!isDeleting) return;
    try {
      await api.delete(`/meetings/${isDeleting}`);
      setIsDeleting(null);
      setSelectedMeeting(null);
      fetchMeetings();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const startEditing = (meeting: Meeting) => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    const editData = {
      title: meeting.title,
      description: meeting.description,
      startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
      address: meeting.address || "",
      latitude: meeting.latitude?.toString() || "",
      longitude: meeting.longitude?.toString() || "",
    };
    setEditingMeetingId(meeting.id);
    setShowCreateModal(true);
    setSelectedMeeting(null);
    return editData;
  };

  const meetingsOnSelectedDate = meetings.filter((m: Meeting) => {
    const mDate = new Date(m.startTime);
    return mDate.toDateString() === date.toDateString();
  });

  if (loading) return <div className="auth-container">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="header-section">
        <div>
          <h1>Hi, {user?.firstName}!</h1>
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
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} color="var(--text-muted)" />
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
        initialData={
          editingMeetingId
            ? (() => {
                const m = meetings.find(
                  (meeting) => meeting.id === editingMeetingId,
                );
                if (!m) return null;
                const start = new Date(m.startTime);
                const end = new Date(m.endTime);
                return {
                  title: m.title,
                  description: m.description,
                  startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
                  endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
                  address: m.address || "",
                  latitude: m.latitude?.toString() || "",
                  longitude: m.longitude?.toString() || "",
                };
              })()
            : null
        }
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
  );
};
