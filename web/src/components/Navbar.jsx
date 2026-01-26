import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Calendar, CreditCard, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem'
        }}>
            <Link to="/" style={{
                textDecoration: 'none',
                color: 'var(--primary)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <Compass size={28} />
                <span>MicroItinerary</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" className="nav-link" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition)'
                }}>
                    <Calendar size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link to="/plan" className="nav-link" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition)'
                }}>
                    <Compass size={20} />
                    <span>Plan Trip</span>
                </Link>
                <Link to="/expenses" className="nav-link" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition)'
                }}>
                    <CreditCard size={20} />
                    <span>Expenses</span>
                </Link>

                <div className="user-profile" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)'
                }}>
                    {user.pictureUrl ? (
                        <img src={user.pictureUrl} alt={user.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    ) : (
                        <UserIcon size={20} />
                    )}
                    <span style={{ fontSize: '0.875rem' }}>{user.name}</span>
                    <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)', padding: 0 }}>
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            <style>{`
        .nav-link:hover {
          color: var(--primary) !important;
        }
      `}</style>
        </nav >
    );
};

export default Navbar;
