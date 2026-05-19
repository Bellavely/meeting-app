import { FC, useEffect, useState } from "react";
import Calendar from "react-calendar";
import { Plus } from "lucide-react";
import { api } from "../../api/api";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import { MeetingCard, MeetingManagementModals } from "../../components";
import { Meeting } from "../../types";
import { toast } from "sonner";
import { useMeetingActions } from "../../hooks/useMeetingActions";
import { MeetingInvitation } from "../../components";

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
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch invitations", error);
    }
  };

  const fetchMeetings = async (month?: string) => {
    try {
      const queryMonth = month || viewedMonth;
      const response = await api.get(`/meetings/calendar?month=${queryMonth}`);
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

  const handleInvitationResponse = async (
    meetingId: string,
    status: "ACCEPTED" | "DECLINED",
  ) => {
    try {
      await api.put(`/meetings/${meetingId}/respond`, { status });
      toast.success(
        status === "ACCEPTED" ? "Meeting accepted" : "Meeting declined",
      );
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

  if (loading) return <div>Loading...</div>;

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
            <MeetingInvitation
              invitations={invitations}
              handleInvitationResponse={handleInvitationResponse}
            />
          )}

          <div className="meeting-grid">
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
