import { FC,useEffect, useState } from 'react';
import { Calendar, MapPin, Plus, LogOut } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

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

const Dashboard: FC = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await api.get('/meetings/my');
                setMeetings(response.data);
            } catch (error) {
                console.error('Failed to fetch meetings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    const getGoogleMapsUrl = (lat?: number, lng?: number, address?: string) => {
        if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        return '#';
    };

    if (loading) return <div className="auth-container">Loading...</div>;

    return (
        <div className="dashboard">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Hi, {user?.firstName}!</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Here are your scheduled meetings</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> New Meeting
                    </button>
                    <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px' }}>
                        <LogOut size={18} color="var(--text-muted)" />
                    </button>
                </div>
            </header>

            <div className="meeting-grid">
                {meetings.map((meeting) => (
                    <div key={meeting.id} className="meeting-card" onClick={() => setSelectedMeeting(meeting)}>
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                <Calendar color="var(--primary)" size={20} />
                            </div>
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>{meeting.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {meeting.description}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} /> <span>{meeting.address || 'No location set'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedMeeting && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
                    <div className="card" style={{ maxWidth: '600px' }}>
                        <h2>{selectedMeeting.title}</h2>
                        <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>{selectedMeeting.description}</p>
                        
                        <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-dark)', borderRadius: '12px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <MapPin size={18} color="var(--primary)" />
                                <span>{selectedMeeting.address}</span>
                             </div>
                             <a 
                                href={getGoogleMapsUrl(selectedMeeting.latitude, selectedMeeting.longitude, selectedMeeting.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                                style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}
                             >
                                Pin in Google Maps
                             </a>
                        </div>

                        <button className="btn-primary" style={{ background: 'var(--border)' }} onClick={() => setSelectedMeeting(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
