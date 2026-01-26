export const mockPlans = [
    {
        id: 'plan-2024',
        year: 2024,
        name: 'My 2024 Adventures',
        totalBudget: 250000,
    }
];

export const mockCalendar = {
    plannedCost: 145000,
    months: [
        { month: 1, monthName: 'January', trips: [] },
        { month: 2, monthName: 'February', trips: [] },
        {
            month: 3, monthName: 'March', trips: [
                { id: 'trip-1', name: 'Spring Break in Goa', destination: 'Goa, India', estimatedCost: 35000 }
            ]
        },
        { month: 4, monthName: 'April', trips: [] },
        { month: 5, monthName: 'May', trips: [] },
        {
            month: 6, monthName: 'June', trips: [
                { id: 'trip-2', name: 'Leh Ladakh Expedition', destination: 'Ladakh, India', estimatedCost: 65000 }
            ]
        },
        { month: 7, monthName: 'July', trips: [] },
        { month: 8, monthName: 'August', trips: [] },
        { month: 9, monthName: 'September', trips: [] },
        {
            month: 10, monthName: 'October', trips: [
                { id: 'trip-3', name: 'Kerala Backwaters', destination: 'Kerala, India', estimatedCost: 45000 }
            ]
        },
        { month: 11, monthName: 'November', trips: [] },
        { month: 12, monthName: 'December', trips: [] },
    ]
};

export const mockTrips = [
    { id: 'trip-1', name: 'Spring Break in Goa', destination: 'Goa, India', estimatedCost: 35000 },
    { id: 'trip-2', name: 'Leh Ladakh Expedition', destination: 'Ladakh, India', estimatedCost: 65000 },
    { id: 'trip-3', name: 'Kerala Backwaters', destination: 'Kerala, India', estimatedCost: 45000 },
];

export const mockExpenses = [
    { id: 'e1', description: 'Beach Resort Stay', amount: 18000, paidByUserName: 'Rohit', category: 'ACCOMMODATION', expenseDate: '2024-03-12' },
    { id: 'e2', description: 'Scuba Diving', amount: 8000, paidByUserName: 'Anjali', category: 'ACTIVITY', expenseDate: '2024-03-13' },
    { id: 'e3', description: 'Seafood Dinner', amount: 4500, paidByUserName: 'Rohit', category: 'FOOD', expenseDate: '2024-03-14' },
];

export const mockSummary = {
    balances: [
        { userId: 'u1', userName: 'Rohit', netBalance: 12500 },
        { userId: 'u2', userName: 'Anjali', netBalance: -4500 },
        { userId: 'u3', userName: 'Siddharth', netBalance: -8000 },
    ],
    suggestedSettlements: [
        { fromUserName: 'Siddharth', toUserName: 'Rohit', amount: 8000 },
        { fromUserName: 'Anjali', toUserName: 'Rohit', amount: 4500 },
    ],
    byCategory: [
        { category: 'ACCOMMODATION', percentage: 60 },
        { category: 'FOOD', percentage: 25 },
        { category: 'ACTIVITY', percentage: 15 },
    ]
};

export const mockAISuggestions = {
    suggestions: [
        { city: 'Shimla', state: 'Himachal', country: 'India', description: 'Perfect winter getaway with scenic views.', matchScore: 98, estimatedDailyCost: 4500 },
        { city: 'Munnar', state: 'Kerala', country: 'India', description: 'Tea plantations and misty mountains.', matchScore: 92, estimatedDailyCost: 3800 },
        { city: 'Pondicherry', state: 'Tamil Nadu', country: 'India', description: 'French colonies and pristine beaches.', matchScore: 88, estimatedDailyCost: 3200 },
    ]
};
