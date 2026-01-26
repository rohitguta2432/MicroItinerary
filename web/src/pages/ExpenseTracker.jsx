import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    Plus,
    Receipt,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRight,
    Users,
    Scale,
    CheckCircle2,
    PieChart as PieChartIcon
} from 'lucide-react';
import { expenseApi, tripsApi } from '../api';

const ExpenseTracker = () => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await tripsApi.getAll();
            setTrips(res.data);
            if (res.data.length > 0) {
                handleSelectTrip(res.data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch trips', err);
        }
    };

    const handleSelectTrip = async (trip) => {
        setSelectedTrip(trip);
        setLoading(true);
        try {
            const [expRes, sumRes] = await Promise.all([
                expenseApi.getTripExpenses(trip.id),
                expenseApi.getSummary(trip.id)
            ]);
            setExpenses(expRes.data);
            setSummary(sumRes.data);
        } catch (err) {
            console.error('Failed to fetch expenses', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Get current user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));

        try {
            setLoading(true);
            await expenseApi.add(selectedTrip.id, {
                paidByUserId: user.id,
                category: formData.get('category'),
                amount: parseFloat(formData.get('amount')),
                description: formData.get('description'),
                expenseDate: new Date().toISOString().split('T')[0],
                splitAmongUserIds: null // Split equally
            });
            setShowAddModal(false);
            // Refresh data
            handleSelectTrip(selectedTrip);
        } catch (err) {
            console.error('Failed to add expense', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ position: 'relative' }}>

            {/* Trip Selector Header */}
            <div className="mobile-stack" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Expense Hub</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Track spending and balance group costs.</p>
                </div>

                <div className="mobile-stack mobile-full-width" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <select
                        className="glass mobile-full-width"
                        style={{ padding: '0.75rem 1.5rem', width: 'auto' }}
                        onChange={(e) => handleSelectTrip(trips.find(t => t.id === e.target.value))}
                        value={selectedTrip?.id || ''}
                    >
                        {trips.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && !expenses.length ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Loading finances...</div>
            ) : (
                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>

                    {/* Expenses List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Receipt size={20} className="text-primary" />
                                Recent Transactions
                            </h2>
                            <button className="btn-primary fab-mobile" onClick={() => setShowAddModal(true)}>
                                <Plus size={20} />
                                <span>Add Expense</span>
                            </button>
                        </div>

                        {expenses.length > 0 ? (
                            expenses.map((exp, i) => (
                                <motion.div
                                    key={exp.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card"
                                    style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600' }}>{exp.description}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                Paid by {exp.paidByUserName} • {exp.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>₹{exp.amount.toLocaleString()}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.expenseDate}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                                <Receipt size={48} style={{ margin: '0 auto 1rem' }} />
                                <p>No expenses recorded for this trip.</p>
                            </div>
                        )}
                    </div>

                    {/* Settlement & Balance Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Net Balances */}
                        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Scale size={20} className="text-secondary" />
                                Group Balances
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {summary?.balances?.map(user => (
                                    <div key={user.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.875rem' }}>{user.userName}</span>
                                        <span style={{
                                            fontWeight: '600',
                                            color: user.netBalance > 0 ? 'var(--success)' : user.netBalance < 0 ? 'var(--accent)' : 'var(--text-muted)'
                                        }}>
                                            {user.netBalance > 0 ? `+₹${user.netBalance.toLocaleString()}` : user.netBalance < 0 ? `-₹${Math.abs(user.netBalance).toLocaleString()}` : '₹0'}
                                        </span>
                                    </div>
                                ))}
                                {(!summary?.balances || summary.balances.length === 0) && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No balances yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Suggested Settlements */}
                        <div className="glass-card" style={{ padding: '2rem', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                            <h2 style={{ fontSize: '1rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                                Suggested Settlements
                            </h2>
                            {summary?.suggestedSettlements?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {summary.suggestedSettlements.map((s, i) => (
                                        <div key={i} style={{ fontSize: '0.875rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: '600' }}>{s.fromUserName}</span>
                                                <ArrowRight size={14} className="text-muted" />
                                                <span style={{ fontWeight: '600' }}>{s.toUserName}</span>
                                            </div>
                                            <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>₹{s.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: '0.875rem' }}>
                                    <CheckCircle2 size={24} style={{ marginBottom: '0.5rem' }} />
                                    <p>All settled up!</p>
                                </div>
                            )}
                        </div>

                        {/* Spending Chart Placeholder */}
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>CATEGORY BREAKDOWN</h2>
                            <div style={{ height: '10px', width: '100%', background: 'var(--border)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                                {summary?.byCategory.map((cat, i) => (
                                    <div key={i} style={{
                                        width: `${cat.percentage}%`,
                                        height: '100%',
                                        background: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)'
                                    }} />
                                ))}
                            </div>
                            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {summary?.byCategory.map((cat, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.675rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)' }} />
                                        <span>{cat.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }} onClick={() => setShowAddModal(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: '1.5rem' }}>Add New Expense</h2>
                            <form onSubmit={handleAddExpense}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</label>
                                    <input name="description" type="text" placeholder="e.g., Dinner at Cafe" required style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Amount (₹)</label>
                                        <input name="amount" type="number" placeholder="0.00" required style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Category</label>
                                        <select name="category" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white' }}>
                                            <option value="FOOD">Food & Dining</option>
                                            <option value="TRANSPORT">Transport</option>
                                            <option value="HOTEL">Accommodation</option>
                                            <option value="ACTIVITY">Activities</option>
                                            <option value="OTHER">Shopping</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Expense</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExpenseTracker;
