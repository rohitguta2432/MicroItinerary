import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    Wallet,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { plansApi, tripsApi } from '../api';
import { format, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';

const Dashboard = () => {
    const [currentPlan, setCurrentPlan] = useState(null);
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewYear, setViewYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchDashboardData();
    }, [viewYear]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Get current year plan
            const planRes = await plansApi.getCurrent();
            setCurrentPlan(planRes.data);

            // Get calendar view (12 months)
            const calendarRes = await plansApi.getCalendar(planRes.data.id);
            setCalendarData(calendarRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <div className="animate-fade-in" style={{ color: 'var(--text-secondary)' }}>
                    <Sparkles className="text-primary" style={{ marginBottom: '1rem' }} />
                    <p>Analyzing your 2024 travel possibilities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Header Section */}
            <div className="flex-between mobile-stack" style={{ marginBottom: '3rem', alignItems: 'flex-end' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Annual Roadmap</span>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)' }}>{viewYear} Travel Plan</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualize your journeys across the year.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-gap-1 mobile-stack mobile-full-width"
                    style={{ marginTop: '1rem' }}
                >
                    <div className="glass-card mobile-full-width" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Budget Allocation</p>
                            <p style={{ fontWeight: '600' }}>₹{currentPlan?.totalBudget?.toLocaleString() || 0}</p>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)' }} />
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Planned Cost</p>
                            <p style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{calendarData?.plannedCost?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                    <Link to="/plan" className="btn-primary mobile-full-width" style={{ height: 'auto', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <Plus size={20} />
                        <span>New Trip</span>
                    </Link>
                </motion.div>
            </div>

            {/* 12-Month Calendar Grid */}
            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {calendarData?.months?.map((month, idx) => (
                    <MonthCard key={month.month} month={month} index={idx} />
                ))}
            </div>
        </div>
    );
};

const MonthCard = ({ month, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card"
            style={{
                padding: '1.5rem',
                borderLeft: month.trips?.length > 0 ? '4px solid var(--primary)' : '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '200px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: month.trips?.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {month.monthName}
                </h3>
                {month.trips?.length > 0 && (
                    <span className="badge badge-primary">{month.trips?.length} Trip{month.trips?.length > 1 ? 's' : ''}</span>
                )}
            </div>

            <div style={{ flex: 1 }}>
                {month.trips?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {month.trips?.map(trip => (
                            <div key={trip.id} className="trip-item" style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <p style={{ fontWeight: '500' }}>{trip.name}</p>
                                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={12} className="text-secondary" />
                                        {trip.destination}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Wallet size={12} className="text-success" />
                                        ₹{trip.estimatedCost?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.3,
                        padding: '1rem 0'
                    }}>
                        <CalendarIcon size={32} style={{ marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.875rem' }}>No trips planned</p>
                    </div>
                )}
            </div>

            {!month.trips?.length && (
                <Link
                    to={`/plan?month=${month.month}`}
                    className="btn-ghost"
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        borderStyle: 'dashed',
                        textDecoration: 'none'
                    }}
                >
                    Plan with AI
                </Link>
            )}

            <style>{`
        .trip-item:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: var(--primary) !important;
          transform: translateX(4px);
        }
      `}</style>
        </motion.div>
    );
};

export default Dashboard;
