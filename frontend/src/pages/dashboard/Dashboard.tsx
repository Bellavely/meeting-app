import { FC, useEffect, useState } from "react";
import Calendar from "react-calendar";
import { Plus, Check, X, Bell } from "lucide-react";
import { api } from "../../api/api";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import {
  ConfirmModal,
  CreateMeetingModal,
  MeetingCard,
  MeetingDetailsModal,
} from "../../components";
import { Meeting } from "../../types";
import { toast } from "sonner";

export const Dashboard: FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [viewedMonth, setViewedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
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

  const fetchInvitations = async () => {
    try {
      const response = await api.get("/meetings/invitations");
      setInvitations(response.data);
    } catch (error) {
      console.error("Failed to fetch invitations", error);
    }
  };

  const fetchMeetings = async (month?: string) => {
    try {
      const queryMonth = month || viewedMonth;
      const response = await api.get(`/meetings/my?month=${queryMonth}&limit=100`);
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error("Failed to fetch meetings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchInvitations();
  }, [viewedMonth]);

  const handleFormSubmit = async (formData: any) => {
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

      // Invite participants
      if (meetingId && participants && participants.length > 0) {
        for (const p of participants) {
          try {
            await api.post(`/meetings/${meetingId}/invite`, { email: p.email });
          } catch (e) {
            console.error(`Failed to invite ${p.email}`, e);
          }
        }
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

  const handleInvitationResponse = async (meetingId: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      await api.put(`/meetings/${meetingId}/respond`, { status });
      toast.success(status === "ACCEPTED" ? "Meeting accepted" : "Meeting declined");
      fetchInvitations();
      fetchMeetings();
    } catch (error) {
      toast.error("Failed to respond to invitation");
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
    <>
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
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) {
                const newMonth = activeStartDate.toISOString().slice(0, 7);
                setViewedMonth(newMonth);
              }
            }}
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

          {invitations.length > 0 && (
            <div className="invitations-section">
              <div className="section-title">
                <Bell size={18} className="notification-icon" />
                <h3>Meeting Invitations</h3>
                <span className="badge">{invitations.length}</span>
              </div>
              <div className="invitations-list">
                {invitations.map((inv) => (
                  <div key={inv.id} className="card invitation-card">
                    <div className="invitation-info">
                      <p className="invitation-text">
                        <strong>{inv.organizerFirstName} {inv.organizerLastName}</strong> 
                        invited you to: <strong>{inv.title}</strong>
                      </p>
                      <p className="invitation-time">
                        {new Date(inv.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="invitation-actions">
                      <button 
                        className="btn-icon accept" 
                        onClick={() => handleInvitationResponse(inv.meetingId, 'ACCEPTED')}
                        title="Accept"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        className="btn-icon decline" 
                        onClick={() => handleInvitationResponse(inv.meetingId, 'DECLINED')}
                        title="Decline"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
    </>
  );
};
