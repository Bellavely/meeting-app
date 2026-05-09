import React, { FC } from 'react';
import { MapPin, X } from 'lucide-react';
import './Modal.css';

type Meeting =  {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

type MeetingDetailsModalProps = {
    meeting: Meeting | null;
    onClose: () => void;
    onEdit: (meeting: Meeting) => void;
    onDelete: (id: string) => void;
}

export const MeetingDetailsModal: FC<MeetingDetailsModalProps> = ({ meeting, onClose, onEdit, onDelete }) => {
    if (!meeting) return null;

    const getGoogleMapsEmbedUrl = (lat?: number, lng?: number, address?: string) => {
        if (lat && lng) return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
        if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
        return '';
    };

    const embedUrl = getGoogleMapsEmbedUrl(meeting.latitude, meeting.longitude, meeting.address);

    return (
        <div className="modal-overlay">
            <div className="card modal-content details-modal">
                <div className="modal-header">
                    <h2>{meeting.title}</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>
                
                <p className="modal-description">{meeting.description}</p>
                
                <div className="location-info">
                    <MapPin size={16} color="var(--primary)" />
                    <span>{meeting.address || 'No address provided'}</span>
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

                <div className="modal-footer">
                    <button className="btn-primary" onClick={() => onEdit(meeting)}>Edit</button>
                    <button className="btn-danger" onClick={() => onDelete(meeting.id)}>Delete</button>
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

