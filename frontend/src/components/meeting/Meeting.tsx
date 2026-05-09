import { CalendarIcon, MapPin } from "lucide-react";
import { Meeting } from "../../types";
import "./Metting.css";

type MeetingCardProps = {
  meeting: Meeting;
  setSelectedMeeting: (meeting: Meeting) => void;
};

export const Metting = ({ meeting, setSelectedMeeting }: MeetingCardProps) => {
  return (
    <div
      key={meeting.id}
      className="meeting-card"
      onClick={() => setSelectedMeeting(meeting)}
    >
      <div className="meeting-card-header">
        <div>
          <h3 className="meeting-title">{meeting.title}</h3>
          <div className="meeting-meta">
            <div className="meta-item">
              <CalendarIcon size={14} />
              {new Date(meeting.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="meta-item">
              <MapPin size={14} />
              {meeting.address || "No location"}
            </div>
          </div>
        </div>
        <span className="view-details-tag">View Details</span>
      </div>
    </div>
  );
};
