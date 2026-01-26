import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const { login, devLogin, user, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [guestLoading, setGuestLoading] = useState(false);

    if (loading) return null;
    if (user) return <Navigate to="/" />;

    const handleSuccess = async (credentialResponse) => {
        try {
            await login(credentialResponse.credential);
            navigate('/');
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    const handleGuestLogin = async () => {
        try {
            setGuestLoading(true);
            await devLogin('guest@example.com', 'Guest Traveler');
            navigate('/');
        } catch (err) {
            setError('Guest login failed. Please try again.');
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #1e293b, #020617)',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    padding: '3rem',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: 'var(--primary)'
                }}>
                    <Compass size={36} />
                </div>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>MicroItinerary</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                    Your AI-powered companion for planning the perfect year of travel.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <Zap size={16} className="text-primary" />
                        <span>AI Suggestions</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <Globe size={16} className="text-secondary" />
                        <span>PWA Offline</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <ShieldCheck size={16} className="text-success" />
                        <span>Group Splits</span>
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        color: 'var(--accent)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={() => setError('Google Login Failed')}
                            useOneTap
                            theme="filled_blue"
                            shape="pill"
                        />
                    </div>

                    <button
                        onClick={handleGuestLogin}
                        disabled={guestLoading}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'var(--text-primary)',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {guestLoading ? 'Signing in...' : 'Continue as Guest'}
                    </button>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        (Development Mode)
                    </div>
                </div>

                <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
