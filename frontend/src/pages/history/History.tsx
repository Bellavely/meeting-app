import { FC, useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { api } from "../../api/api";
import {
  MeetingCard,
  MeetingManagementModals,
} from "../../components";
import { Meeting } from "../../types";
import { useMeetingActions } from "../../hooks/useMeetingActions";
import "./History.css";

export const History: FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    selectedMeeting,
    setSelectedMeeting,
    showCreateModal,
    editingData,
    editingMeetingId,
    isDeleting,
    startEditing,
    handleFormSubmit,
    confirmDelete,
    openDeleteConfirmation,
    setShowCreateModal,
    setIsDeleting,
  } = useMeetingActions(() => {
    fetchMeetings();
  });

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", page.toString());
      params.append("limit", "8");

      const response = await api.get(`/meetings/query?${params.toString()}`);
      setMeetings(response.data.meetings);
      setTotalPages(
        Math.ceil(response.data.pagination.total / response.data.pagination.limit),
      );
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMeetings();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page]);

  return (
    <>
      <header className="header-section">
        <div>
          <h1>Meeting History</h1>
          <p className="subtitle">Search your past and upcoming meetings</p>
        </div>
      </header>

      <div className="history-filters-card card">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <main className="history-main">
        {loading ? (
          <div className="loading-state">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="empty-state">
            <Filter size={48} className="empty-icon" />
            <p>No meetings found matching your search.</p>
          </div>
        ) : (
          <>
            <div className="meeting-grid history-grid">
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  setSelectedMeeting={setSelectedMeeting}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="pagination-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

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
      />
    </>
  );
};
