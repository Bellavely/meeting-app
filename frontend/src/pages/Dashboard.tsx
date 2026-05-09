import React, { FC, useEffect, useState } from "react";
import Calendar from "react-calendar";
import { Calendar as CalendarIcon, MapPin, Plus, LogOut } from "lucide-react";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const Dashboard: FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    startTime: "10:00",
    endTime: "11:00",
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

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Simple debounce for address search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newMeeting.address && showCreateModal) {
        const alreadySelected = suggestions.some(
          (s) => s.display_name === newMeeting.address,
        );
        if (!alreadySelected) searchAddress(newMeeting.address);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [newMeeting.address, showCreateModal, suggestions]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const start = new Date(date);
      const [sH, sM] = newMeeting.startTime.split(":");
      start.setHours(parseInt(sH), parseInt(sM));

      const end = new Date(date);
      const [eH, eM] = newMeeting.endTime.split(":");
      end.setHours(parseInt(eH), parseInt(eM));

      const payload = {
        ...newMeeting,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        latitude: newMeeting.latitude
          ? parseFloat(String(newMeeting.latitude))
          : undefined,
        longitude: newMeeting.longitude
          ? parseFloat(String(newMeeting.longitude))
          : undefined,
      };

      if (editingMeetingId) {
        await api.put(`/meetings/${editingMeetingId}`, payload);
      } else {
        await api.post("/meetings", payload);
      }

      setShowCreateModal(false);
      setEditingMeetingId(null);
      setNewMeeting({
        title: "",
        description: "",
        startTime: "10:00",
        endTime: "11:00",
        address: "",
        latitude: "",
        longitude: "",
      });
      fetchMeetings();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save meeting");
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this meeting?"))
      return;
    try {
      await api.delete(`/meetings/${id}`);
      setSelectedMeeting(null);
      fetchMeetings();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const startEditing = (meeting: Meeting) => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    setNewMeeting({
      title: meeting.title,
      description: meeting.description,
      startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
      address: meeting.address || "",
      latitude: meeting.latitude?.toString() || "",
      longitude: meeting.longitude?.toString() || "",
    });
    setEditingMeetingId(meeting.id);
    setShowCreateModal(true);
    setSelectedMeeting(null);
  };

  const getGoogleMapsEmbedUrl = (
    lat?: number,
    lng?: number,
    address?: string,
  ) => {
    if (lat && lng)
      return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    if (address)
      return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
    return "";
  };

  const meetingsOnSelectedDate = meetings.filter((m: Meeting) => {
    const mDate = new Date(m.startTime);
    return mDate.toDateString() === date.toDateString();
  });

  if (loading) return <div className="auth-container">Loading...</div>;

  return (
    <div className="dashboard">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1>Hi, {user?.firstName}!</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage your schedule and locations
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{
              width: "auto",
              padding: "0.75rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Plus size={18} /> New Meeting
          </button>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "0.75rem",
              borderRadius: "8px",
            }}
          >
            <LogOut size={18} color="var(--text-muted)" />
          </button>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <aside>
          <Calendar
            onChange={(val: any) => setDate(val as Date)}
            value={date}
            className="custom-calendar"
          />
          <div
            style={{
              marginTop: "2rem",
              padding: "1.5rem",
              background: "var(--bg-card)",
              borderRadius: "1rem",
              border: "1px solid var(--border)",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Today's Overview</h3>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              {meetingsOnSelectedDate.length}
            </p>
            <p style={{ color: "var(--text-muted)" }}>Meetings scheduled</p>
          </div>
        </aside>

        <main>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
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
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  background: "var(--bg-card)",
                  borderRadius: "1rem",
                  border: "1px dashed var(--border)",
                }}
              >
                <p style={{ color: "var(--text-muted)" }}>
                  No meetings for this day.
                </p>
              </div>
            ) : (
              meetingsOnSelectedDate.map((meeting: Meeting) => (
                <div
                  key={meeting.id}
                  className="meeting-card"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <h3 style={{ marginBottom: "0.5rem" }}>
                        {meeting.title}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "1.5rem",
                          fontSize: "0.875rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <CalendarIcon size={14} />
                          {new Date(meeting.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <MapPin size={14} />
                          {meeting.address || "No location"}
                        </div>
                      </div>
                    </div>
                    <button
                      style={{
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "var(--primary)",
                        padding: "0.5rem 1rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 100,
          }}
        >
          <div className="card" style={{ maxWidth: "500px", padding: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h2>Schedule Meeting</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  For {date.toDateString()}
                </p>
              </div>
              <button
                style={{
                  background: "transparent",
                  fontSize: "1.5rem",
                  color: "var(--text-white)",
                }}
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={handleFormSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <input
                type="text"
                placeholder="Title"
                value={newMeeting.title}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, title: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Description"
                value={newMeeting.description}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, description: e.target.value })
                }
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-white)",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  minHeight: "80px",
                }}
              />
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    style={{ width: "100%" }}
                    value={newMeeting.startTime}
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        startTime: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    style={{ width: "100%" }}
                    value={newMeeting.endTime}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Address (Start typing to search...)"
                  value={newMeeting.address}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, address: e.target.value })
                  }
                  autoComplete="off"
                />
                {isSearching && (
                  <div
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "10px",
                      fontSize: "0.75rem",
                      color: "var(--primary)",
                    }}
                  >
                    Searching...
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      zIndex: 110,
                      borderRadius: "8px",
                      marginTop: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setNewMeeting({
                            ...newMeeting,
                            address: s.display_name,
                            latitude: s.lat,
                            longitude: s.lon,
                          });
                          setSuggestions([]);
                        }}
                        style={{
                          padding: "0.75rem 1rem",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          borderBottom:
                            i === suggestions.length - 1
                              ? "none"
                              : "1px solid var(--border)",
                        }}
                        className="suggestion-item"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--bg-dark)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        {s.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  opacity: 0.6,
                }}
              >
                <MapPin size={12} />
                <span style={{ fontSize: "0.75rem" }}>
                  {newMeeting.latitude
                    ? `Coordinates: ${newMeeting.latitude}, ${newMeeting.longitude}`
                    : "Select an address to get coordinates automatically"}
                </span>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: "1rem" }}
              >
                {editingMeetingId ? "Update Meeting" : "Create Meeting"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedMeeting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 100,
          }}
        >
          <div className="card" style={{ maxWidth: "600px", padding: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "1rem",
              }}
            >
              <h2>{selectedMeeting.title}</h2>
              <button
                style={{
                  background: "transparent",
                  fontSize: "1.5rem",
                  color: "var(--text-white)",
                }}
                onClick={() => setSelectedMeeting(null)}
              >
                &times;
              </button>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              {selectedMeeting.description}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
              }}
            >
              <MapPin size={16} color="var(--primary)" />
              <span>{selectedMeeting.address}</span>
            </div>

            {getGoogleMapsEmbedUrl(
              selectedMeeting.latitude,
              selectedMeeting.longitude,
              selectedMeeting.address,
            ) && (
              <iframe
                className="map-embed"
                title="meeting-location"
                loading="lazy"
                allowFullScreen
                src={getGoogleMapsEmbedUrl(
                  selectedMeeting.latitude,
                  selectedMeeting.longitude,
                  selectedMeeting.address,
                )}
              ></iframe>
            )}

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
              <button
                className="btn-primary"
                onClick={() => startEditing(selectedMeeting)}
              >
                Edit
              </button>
              <button
                className="btn-primary"
                style={{ background: "var(--error)" }}
                onClick={() => handleDeleteMeeting(selectedMeeting.id)}
              >
                Delete
              </button>
              <button
                className="btn-primary"
                style={{ background: "var(--border)" }}
                onClick={() => setSelectedMeeting(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
