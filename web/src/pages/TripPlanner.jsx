import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Search,
    Calendar,
    Users,
    MapPin,
    IndianRupee,
    ArrowRight,
    CheckCircle2,
    X,
    Plus
} from 'lucide-react';
import { aiApi, tripsApi, plansApi } from '../api';

const TripPlanner = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        month: new Date().getMonth() + 1,
        budgetLevel: 'MID_RANGE',
        groupType: 'FRIENDS',
        travelType: 'LEISURE',
        durationDays: 4,
        destination: null
    });
    const [suggestions, setSuggestions] = useState([]);

    const handleSuggest = async () => {
        setLoading(true);
        try {
            const res = await aiApi.suggestDestinations({
                month: parseInt(formData.month),
                groupType: formData.groupType,
                travelType: formData.travelType,
                budgetMin: 5000,
                budgetMax: 50000,
                durationDays: formData.durationDays
            });
            setSuggestions(res.data.suggestions);
            setStep(2);
        } catch (err) {
            console.error('AI Suggestion failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDestination = (dest) => {
        setFormData({ ...formData, destination: dest, name: `Trip to ${dest.city}` });
        setStep(3);
    };

    const handleCreateTrip = async () => {
        setLoading(true);
        try {
            // In a real app, we'd get the current annual plan ID
            const planRes = await plansApi.getCurrent();

            await tripsApi.create({
                annualPlanId: planRes.data.id,
                name: formData.name,
                destinationCountry: formData.destination.country,
                destinationState: formData.destination.state,
                destinationCity: formData.destination.city,
                startDate: new Date(2024, formData.month - 1, 15).toISOString().split('T')[0],
                endDate: new Date(2024, formData.month - 1, 15 + formData.durationDays).toISOString().split('T')[0],
                travelType: formData.travelType,
                groupType: formData.groupType,
                estimatedCost: formData.destination.estimatedDailyCost * formData.durationDays
            });
            setStep(4);
        } catch (err) {
            console.error('Trip creation failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', minHeight: '90vh' }}>
            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>

                {/* Step Indicator */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} style={{
                            height: '4px',
                            background: step >= s ? 'var(--primary)' : 'var(--border)',
                            flex: 1,
                            borderRadius: '2px',
                            transition: 'var(--transition)'
                        }} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Sparkles className="text-primary" />
                                Where next?
                            </h2>
                            <div className="grid-auto" style={{ gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Month</label>
                                    <select value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })}>
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                            <option key={m} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Travel Style</label>
                                    <select value={formData.travelType} onChange={e => setFormData({ ...formData, travelType: e.target.value })}>
                                        <option value="LEISURE">Relaxing</option>
                                        <option value="ADVENTURE">Adventure</option>
                                        <option value="RELIGIOUS">Spiritual</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Group</label>
                                    <select value={formData.groupType} onChange={e => setFormData({ ...formData, groupType: e.target.value })}>
                                        <option value="SOLO">Solo</option>
                                        <option value="FRIENDS">Friends</option>
                                        <option value="FAMILY">Family</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleSuggest}
                                className="btn-primary"
                                style={{ marginTop: '2.5rem', width: '100%', padding: '1rem' }}
                                disabled={loading}
                            >
                                {loading ? 'AI is thinking...' : 'Get AI Suggestions'}
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>AI Recommended Destinantions</h2>
                                <button className="btn-ghost" onClick={() => setStep(1)} style={{ padding: '0.5rem 1rem' }}>Back</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {suggestions.map((dest, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => handleSelectDestination(dest)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <h3>{dest.city}, {dest.state}</h3>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{dest.description}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span className="badge badge-primary">{dest.matchScore}% Match</span>
                                                <p style={{ color: 'var(--success)', fontWeight: '600', marginTop: '0.5rem' }}>₹{dest.estimatedDailyCost}/day</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <h2 style={{ marginBottom: '1rem' }}>Finalize Trip Details</h2>
                            <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', marginBottom: '2rem' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DESTINATION</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formData.destination?.city}</p>

                                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DATES</label>
                                        <input type="text" value="Oct 15 - Oct 19, 2024" readOnly />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESTIMATED COST</label>
                                        <input type="text" value={`₹${(formData.destination?.estimatedDailyCost * formData.durationDays).toLocaleString()}`} readOnly />
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleCreateTrip} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                                {loading ? 'Creating...' : 'Save to Annual Plan'}
                            </button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ textAlign: 'center', padding: '2rem' }}
                        >
                            <CheckCircle2 size={80} className="text-success" style={{ margin: '0 auto 2rem' }} />
                            <h1 style={{ marginBottom: '1rem' }}>Journey Scheduled!</h1>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                                Your trip to {formData.destination?.city} has been added to your 2024 annual plan.
                            </p>
                            <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ padding: '1rem 3rem' }}>
                                View Dashboard
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
        .glass-card:hover {
          border-color: var(--primary) !important;
          background: rgba(30, 41, 59, 0.6) !important;
        }
      `}</style>
        </div>
    );
};

export default TripPlanner;
