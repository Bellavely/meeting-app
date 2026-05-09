import React, { FC, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import { LogIn } from 'lucide-react';

const Login: FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.accessToken, response.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--primary)', width: '3rem', height: '3rem', borderRadius: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <LogIn color="white" size={24} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Login to manage your meetings</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary">Sign In</button>
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
