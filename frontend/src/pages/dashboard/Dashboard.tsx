import { FC, useEffect, useState } from "react";
import Calendar from "react-calendar";
import { Plus, Check, X, Bell } from "lucide-react";
import { api } from "../../api/api";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import {
  MeetingCard,
  MeetingManagementModals,
} from "../../components";

import { Meeting } from "../../types";
import { toast } from "sonner";
import { useMeetingActions } from "../../hooks/useMeetingActions";


export const Dashboard: FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [viewedMonth, setViewedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );
  const [invitations, setInvitations] = useState<any[]>([]);

  const {
    selectedMeeting,
    setSelectedMeeting,
    showCreateModal,
    editingData,
    editingMeetingId,
    isDeleting,
    startEditing,
    openCreateModal,
    handleFormSubmit,
    confirmDelete,
    openDeleteConfirmation,
    setShowCreateModal,
    setIsDeleting,
    isSubmitting,
  } = useMeetingActions(() => {
    fetchMeetings();
    fetchInvitations();
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
            onClick={() => openCreateModal(date)}
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
                        <strong>{inv.organizerFirstName} {inv.organizerLastName} </strong> 
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

      <MeetingManagementModals
        selectedMeeting={selectedMeeting}
        setSelectedMeeting={setSelectedMeeting}
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        editingData={editingData}
        editingMeetingId={editingMeetingId}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        startEditing={startEditing}
        handleFormSubmit={handleFormSubmit}
        confirmDelete={confirmDelete}
        openDeleteConfirmation={openDeleteConfirmation}
        meetings={meetings}
        isSubmitting={isSubmitting}
      />

    </>
  );
};
