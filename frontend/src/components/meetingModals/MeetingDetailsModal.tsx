import { FC, useEffect, useState } from "react";
import { MapPin, X, Users } from "lucide-react";
import { api } from "../../api/api";
import { Meeting } from "../../types";
import { useAuth } from "../../context/AuthContext";
import "./Modal.css";

type MeetingDetailsModalProps = {
  meeting: Meeting | null;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
};

export const MeetingDetailsModal: FC<MeetingDetailsModalProps> = ({
  meeting,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { user: currentUser } = useAuth();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const isOrganizer = currentUser?.id === meeting?.organizerId;


  useEffect(() => {
    if (meeting?.id) {
      const fetchParticipants = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/meetings/${meeting.id}/participants`);
          setParticipants(response.data);
        } catch (error) {
          console.error("Failed to fetch participants", error);
        } finally {
          setLoading(false);
        }
      };
      fetchParticipants();
    } else {
      setParticipants([]);
    }
  }, [meeting?.id]);

  if (!meeting) return null;

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

  const embedUrl = getGoogleMapsEmbedUrl(
    meeting.latitude,
    meeting.longitude,
    meeting.address,
  );

  return (
    <div className="modal-overlay">
      <div className="card modal-content details-modal">
        <div className="modal-header">
          <h2>{meeting.title}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-time">
          {new Date(meeting.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {new Date(meeting.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        
        <p className="modal-description">{meeting.description}</p>

        <div className="location-info">
          <MapPin size={16} color="var(--primary)" />
          <span>{meeting.address || "No address provided"}</span>
        </div>

        {embedUrl && (
          <iframe
            className="map-embed"
            title="meeting-location"
            loading="lazy"
            allowFullScreen
            src={embedUrl}
          ></iframe>
        )}

        <div className="participants-section">
          <div className="section-title">
            <Users size={18} />
            <h3>Participants</h3>
            <span className="count">{participants.length}</span>
          </div>
          <div className="participants-list-inline">
            {loading ? (
              <p className="loading-text">Loading participants...</p>
            ) : participants.length > 0 ? (
              participants.map((p) => (
                <div key={p.id} className="participant-item">
                  <div className="user-info">
                    <span className="name">{p.firstName} {p.lastName}</span>
                    <span className="status-badge" data-status={p.status}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-participants">No participants invited.</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {isOrganizer && (
            <>
              <button className="btn-primary" onClick={() => onEdit({...meeting, participants})}>
                Edit
              </button>
              <button className="btn-danger" onClick={() => onDelete(meeting.id)}>
                Delete
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

