import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api';
import {
    Users,
    Activity,
    AlertTriangle,
    Shield,
    Search,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [usersRes, activityRes, issuesRes] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getActivity(),
                adminApi.getIssues()
            ]);
            setUsers(usersRes.data);
            setActivities(activityRes.data);
            setIssues(issuesRes.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load admin data. Are you an admin?");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading Admin Panel...</div>;
    if (error) return (
        <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
            <AlertTriangle size={48} className="text-accent" style={{ margin: '0 auto 1rem' }} />
            <h2>Access Denied</h2>
            <p className="text-muted">{error}</p>
        </div>
    );

    return (
        <div className="container">
            <div className="flex-between mobile-stack" style={{ marginBottom: '2rem', alignItems: 'flex-end' }}>
                <div>
                    <span className="badge badge-warning" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>
                        <Shield size={12} /> Admin Area
                    </span>
                    <h1>System Overview</h1>
                </div>
                <div className="flex-gap-1">
                    <button
                        className={`btn-ghost ${activeTab === 'overview' ? 'text-primary' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >Overview</button>
                    <button
                        className={`btn-ghost ${activeTab === 'users' ? 'text-primary' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >Users</button>
                    <button
                        className={`btn-ghost ${activeTab === 'activity' ? 'text-primary' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >Activity</button>
                </div>
            </div>

            {/* Overview Cards */}
            {activeTab === 'overview' && (
                <div className="grid-auto grid-responsive" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <h3 className="text-muted" style={{ fontSize: '0.875rem' }}>TOTAL USERS</h3>
                            <Users size={20} className="text-primary" />
                        </div>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{users.length}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <h3 className="text-muted" style={{ fontSize: '0.875rem' }}>RECENT ERRORS</h3>
                            <AlertTriangle size={20} className="text-accent" />
                        </div>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{issues.length}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <h3 className="text-muted" style={{ fontSize: '0.875rem' }}>ACTIVITIES (24H)</h3>
                            <Activity size={20} className="text-success" />
                        </div>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activities.length}</p>
                    </div>
                </div>
            )}

            {/* Users Table */}
            {(activeTab === 'users' || activeTab === 'overview') && (
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Registered Users</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>User</th>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Joined</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img src={u.pictureUrl || `https://ui-avatars.com/api/?name=${u.name}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{u.name}</div>
                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                            {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '-'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <CheckCircle size={16} className="text-success" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Activity Feed */}
            {(activeTab === 'activity' || activeTab === 'overview') && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>System Activity</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activities.map(log => (
                            <div key={log.id} style={{
                                display: 'flex',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'var(--card-overlay)',
                                borderRadius: '0.5rem',
                                borderLeft: log.action === 'ERROR' ? '3px solid var(--accent)' : '3px solid var(--primary)'
                            }}>
                                <div style={{ minWidth: '120px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {format(new Date(log.timestamp), 'MMM d HH:mm')}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{log.action}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{log.details}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>User ID: {log.userId}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
