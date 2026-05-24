import { Bell, Check, X } from "lucide-react";
import { Invitation } from "../../types";
import "./MeetingInvitation.css";

export type MeetingInvitationProps = {
  invitations: Invitation[];
  handleInvitationResponse: (
    meetingId: string,
    status: "ACCEPTED" | "DECLINED",
  ) => Promise<void>;
};

export const MeetingInvitation = ({
  invitations,
  handleInvitationResponse,
}: MeetingInvitationProps) => {
  return (
    <div className={"invitations-section"}>
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
                <strong>
                  {inv.organizerFirstName} {inv.organizerLastName}{" "}
                </strong>
                invited you to: <strong>{inv.title}</strong>
              </p>
              <p className="invitation-time">
                {new Date(inv.startTime).toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div className="invitation-actions">
              <button
                className="btn-icon accept"
                onClick={() =>
                  handleInvitationResponse(inv.meetingId, "ACCEPTED")
                }
                title="Accept"
              >
                <Check size={18} />
              </button>
              <button
                className="btn-icon decline"
                onClick={() =>
                  handleInvitationResponse(inv.meetingId, "DECLINED")
                }
                title="Decline"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
