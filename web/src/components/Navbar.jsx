import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Calendar, CreditCard, LogOut, User as UserIcon, Sun, Moon, Shield } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'dark');

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            height: '70px',
            zIndex: 1000,
            padding: '0 1rem'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: 'var(--primary)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Compass size={24} />
                    <span className="logo-text">MicroItinerary</span>
                </Link>

                <div className="nav-items" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link to="/" className="nav-link" title="Dashboard">
                            <Calendar size={20} />
                            <span className="link-text">Dashboard</span>
                        </Link>
                        <Link to="/plan" className="nav-link" title="Plan Trip">
                            <Compass size={20} />
                            <span className="link-text">Plan</span>
                        </Link>
                        <Link to="/expenses" className="nav-link" title="Expenses">
                            <CreditCard size={20} />
                            <span className="link-text">Expenses</span>
                        </Link>
                        <Link to="/admin" className="nav-link" title="Admin">
                            <Shield size={20} />
                            <span className="link-text">Admin</span>
                        </Link>
                    </div>

                    <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme" style={{
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="user-profile">
                        {user.pictureUrl ? (
                            <img src={user.pictureUrl} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                <UserIcon size={16} />
                            </div>
                        )}
                        <span className="user-name">{user.name}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .nav-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-secondary);
            text-decoration: none;
            transition: var(--transition);
        }
        .nav-link:hover {
            color: var(--primary);
        }
        .user-profile {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            background: var(--card-overlay);
            border: 1px solid var(--border);
        }
        .user-profile img {
            width: 24px;
            height: 24px;
            border-radius: 50%;
        }
        .avatar-placeholder {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--bg-card);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
        }
        .user-name {
            font-size: 0.875rem;
            color: var(--text-primary);
        }
        .logout-btn {
            background: transparent;
            color: var(--text-muted);
            padding: 0;
            margin-left: 0.25rem;
        }
        .logout-btn:hover {
            color: var(--accent);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .link-text {
                display: none;
            }
            .user-name {
                display: none;
            }
            .logo-text {
                display: none; /* Hide logo text on very small screens if needed, or keep */
            }
            .desktop-links {
                gap: 1rem !important;
            }
            .user-profile {
                padding: 0.25rem;
                background: transparent;
                border: none;
            }
        }
      `}</style>
        </nav >
    );
};

export default Navbar;
