import React, { FC, useState, useEffect } from "react";
import { MapPin, X, Search } from "lucide-react";
import { api } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./Modal.css";
import { ConfirmModal } from "../confirmModal";
import { Meeting } from "../../types";

type CreateMeetingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  selectedDate?: Date;
  isEditing?: boolean;
  meetings: Meeting[];
};

export const CreateMeetingModal: FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  selectedDate = new Date(),
  isEditing = false,
  meetings,
}) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "00:00",
    endTime: "00:00",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  
  // Participant search state
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
  const [isSearchingParticipants, setIsSearchingParticipants] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && initialData) {
      setFormData(initialData);
      if (initialData.address) {
        setIsInternalUpdate(true);
      }
      setSuggestions([]);
    } else {
      setFormData({
        title: "",
        description: "",
        date: selectedDate
          ? selectedDate.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:00",
        address: "",
        latitude: "",
        longitude: "",
      });
    }
    setSuggestions([]);

    if (isEditing && initialData && initialData.participants) {
      setParticipants(
        initialData.participants.map((p: any) => ({
          ...(p.user || p),
          id: p.userId || p.id,
        })),
      );
    } else {
      setParticipants([]);
    }
  }, [isOpen, isEditing, initialData]);

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

  useEffect(() => {
    if (isInternalUpdate) {
      setIsInternalUpdate(false);
      return;
    }

    const timer = setTimeout(() => {
      if (formData.address && isOpen) {
        const alreadySelected = suggestions.some(
          (s) => s.display_name === formData.address,
        );
        if (!alreadySelected) searchAddress(formData.address);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.address, isOpen]);

  // Debounced participant search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (participantSearch.trim().length >= 2) {
        setIsSearchingParticipants(true);
        try {
          const response = await api.get(
            `/users/search?q=${participantSearch}`,
          );
          // Filter out current user from suggestions
          const filtered = response.data.filter(
            (u: any) => u.email !== currentUser?.email,
          );
          setUserSuggestions(filtered);
        } catch (error) {
          console.error("User search failed", error);
        } finally {
          setIsSearchingParticipants(false);
        }
      } else {
        setUserSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [participantSearch, currentUser?.email]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dupmeeting = meetings
      .filter((meeting) => {
        const mDate = new Date(meeting.startTime).toISOString().split("T")[0];
        const mStart = meeting.startTime.split("T")[1].slice(0, 5);
        const mEnd = meeting.endTime.split("T")[1].slice(0, 5);
        return (
          mDate === formData.date &&
          formData.startTime < mEnd &&
          formData.endTime > mStart &&
          meeting.id !== initialData?.id
        );
      });
    if (dupmeeting) {
      setIsBusy(true);
      return;
    }
    onSubmit({ ...formData, participants });
  };

  return (
    <div className="modal-overlay">
      <div className="card modal-content create-modal">
        <div className="modal-header">
          <div>
            <h2>{isEditing ? "Edit Meeting" : "Schedule Meeting"}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group address-group">
            <input
              type="text"
              placeholder="Address (Start typing to search...)"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                  latitude: "",
                  longitude: "",
                })
              }
              autoComplete="off"
            />
            {isSearching && (
              <div className="searching-indicator">Searching...</div>
            )}
            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((value, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => {
                      setIsInternalUpdate(true);
                      setFormData({
                        ...formData,
                        address: value.display_name,
                        latitude: value.lat,
                        longitude: value.lon,
                      });
                      setSuggestions([]);
                    }}
                  >
                    {value.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="coord-info">
            <MapPin size={12} />
            <span
              style={{
                color:
                  !formData.latitude && formData.address
                    ? "var(--error)"
                    : "inherit",
              }}
            >
              {formData.latitude
                ? `Coordinates: ${formData.latitude}, ${formData.longitude}`
                : formData.address
                  ? "Please select an address from the suggestions"
                  : "Select an address to get coordinates automatically"}
            </span>
          </div>

          <div className="form-group participant-search-group">
            <label>Invite Participants</label>
            <div className="input-with-icon">
              <Search size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
              />
            </div>
            {isSearchingParticipants && (
              <div className="searching-indicator">Searching users...</div>
            )}
            {participantSearch.trim().length >= 2 &&
              !isSearchingParticipants &&
              userSuggestions.length === 0 && (
                <div className="suggestions-dropdown no-results">
                  <div className="suggestion-item disabled">No users found</div>
                </div>
              )}
            {userSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {userSuggestions.map((u) => (
                  <div
                    key={u.id}
                    className="suggestion-item user-suggestion"
                    onClick={() => {
                      if (!participants.find((p) => p.id === u.id)) {
                        setParticipants([...participants, u]);
                      }
                      setParticipantSearch("");
                      setUserSuggestions([]);
                    }}
                  >
                    <div className="suggestion-user-info">
                      <span className="user-name">
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="user-email">{u.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {participants.length > 0 && (
            <div className="participants-tags">
              {participants.map((p) => (
                <div key={p.id} className="participant-tag">
                  <span>{p.email}</span>
                  <button
                    type="button"
                    className="remove-tag"
                    onClick={() =>
                      setParticipants(
                        participants.filter((pt) => pt.id !== p.id),
                      )
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary submit-btn"
            disabled={!!(formData.address && !formData.latitude)}
            style={{
              opacity: formData.address && !formData.latitude ? 0.5 : 1,
            }}
          >
            {isEditing ? "Update Meeting" : "Create Meeting"}
          </button>
        </form>
      </div>
      <ConfirmModal
        isOpen={isBusy}
        title="Confirm Deletion"
        message={`Are you sure you want to ${isEditing ? "edit" : "create"} this meeting? 
          You already have another meeting scheduled at this same time. `}
        onConfirm={() => onSubmit({ ...formData, participants })}
        onCancel={() => setIsBusy(false)}
      />
    </div>
  );
};
