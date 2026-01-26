import Dexie from 'dexie';

export const db = new Dexie('MicroItineraryDB');

db.version(1).stores({
    plans: 'id, user_id, year',
    trips: 'id, annual_plan_id, start_date',
    expenses: 'id, trip_id, expense_date',
    ai_cache: 'key, expires_at'
});

export const offlineService = {
    // Plans
    savePlan: (plan) => db.plans.put(plan),
    getPlans: () => db.plans.toArray(),

    // Trips
    saveTrip: (trip) => db.trips.put(trip),
    getTripsByPlan: (planId) => db.trips.where('annual_plan_id').equals(planId).toArray(),

    // Expenses
    saveExpense: (expense) => db.expenses.put(expense),
    getExpensesByTrip: (tripId) => db.expenses.where('trip_id').equals(tripId).toArray(),
};
