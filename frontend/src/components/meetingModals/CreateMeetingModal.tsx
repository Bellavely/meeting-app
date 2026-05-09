import React, { FC, useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import './Modal.css';

interface CreateMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    selectedDate: Date;
}

export const CreateMeetingModal: FC<CreateMeetingModalProps> = ({ isOpen, onClose, onSubmit, initialData, selectedDate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '10:00',
        endTime: '11:00',
        address: '',
        latitude: '',
        longitude: ''
    });

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                description: '',
                date: selectedDate.toISOString().split('T')[0],
                startTime: '10:00',
                endTime: '11:00',
                address: '',
                latitude: '',
                longitude: ''
            });
        }
    }, [initialData, isOpen, selectedDate]);

    const searchAddress = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.address && isOpen) {
                const alreadySelected = suggestions.some(s => s.display_name === formData.address);
                if (!alreadySelected) searchAddress(formData.address);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.address, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="card modal-content create-modal">
                <div className="modal-header">
                    <div>
                        <h2>{initialData ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
                        <p className="modal-subtitle">For {selectedDate.toDateString()}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Title" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <textarea 
                            placeholder="Description" 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="form-textarea"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input 
                                type="time" 
                                value={formData.startTime} 
                                onChange={e => setFormData({...formData, startTime: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input 
                                type="time" 
                                value={formData.endTime} 
                                onChange={e => setFormData({...formData, endTime: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group address-group">
                        <input 
                            type="text" 
                            placeholder="Address (Start typing to search...)" 
                            value={formData.address} 
                            onChange={e => setFormData({...formData, address: e.target.value})} 
                            autoComplete="off"
                        />
                        {isSearching && <div className="searching-indicator">Searching...</div>}
                        {suggestions.length > 0 && (
                            <div className="suggestions-dropdown">
                                {suggestions.map((s, i) => (
                                    <div 
                                        key={i} 
                                        className="suggestion-item"
                                        onClick={() => {
                                            setFormData({
                                                ...formData, 
                                                address: s.display_name,
                                                latitude: s.lat,
                                                longitude: s.lon
                                            });
                                            setSuggestions([]);
                                        }}
                                    >
                                        {s.display_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="coord-info">
                        <MapPin size={12} />
                        <span>
                            {formData.latitude ? `Coordinates: ${formData.latitude}, ${formData.longitude}` : 'Select an address to get coordinates automatically'}
                        </span>
                    </div>

                    <button type="submit" className="btn-primary submit-btn">
                        {initialData ? 'Update Meeting' : 'Create Meeting'}
                    </button>
                </form>
            </div>
        </div>
    );
};

