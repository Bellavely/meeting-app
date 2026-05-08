import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { UserPlus } from 'lucide-react';

const Register: React.FC = () => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', form);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--primary)', width: '3rem', height: '3rem', borderRadius: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <UserPlus color="white" size={24} />
                    </div>
                    <h1>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Join us to start scheduling</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input type="text" placeholder="First" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} required style={{ flex: 1 }} />
                        <input type="text" placeholder="Last" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} required style={{ flex: 1 }} />
                    </div>
                    <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                    <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
                    {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary">Get Started</button>
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
