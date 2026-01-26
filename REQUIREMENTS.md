# Product Requirements & Feature Use Cases

## 1. Product Overview
**Product Name**: MicroItinerary - AI Travel Planner
**Vision**: An AI-powered Progressive Web Application (PWA) that helps travelers plan their entire year of travel with intelligent destination suggestions, cost estimation, and collaborative expense management.
**Key Value Proposition**: AI-driven travel planning with smart budgeting and group expense splitting, all accessible offline.

## 2. Functional Requirements

### FR-001: User Authentication
- **Description**: Users can sign in using their Google account.
- **Requirements**:
    - User shall be able to sign in with Google OAuth.
    - User profile (name, email, picture) shall be stored.
    - User shall stay logged in across sessions (JWT).
    - User can log out from any device.

### FR-002: Annual Trip Planning
- **Description**: Users can create and manage an annual travel plan.
- **Requirements**:
    - User shall be able to create an annual plan with a name and total budget (INR).
    - User shall see a 12-month calendar view of their trips.
    - User shall be able to assign trips to specific months.
    - Dashboard shows budget usage vs remaining.

### FR-003: AI-Powered Destination Suggestions
- **Description**: Users receive intelligent destination recommendations.
- **Requirements**:
    - User shall be able to request AI suggestions based on:
        - Month/Season
        - Budget range
        - Group type (Solo/Friends/Family)
        - Preferred amenities
    - Suggestions shall include reasoning (e.g., "December is perfect for Goa beaches").
    - Suggestions shall be cached for offline access.

### FR-004: AI Cost Estimation
- **Description**: Users receive AI-generated cost breakdowns.
- **Requirements**:
    - User shall receive estimated costs in INR for:
        - Accommodation
        - Food & Dining
        - Transportation
        - Activities & Entry Fees
        - Miscellaneous
    - Estimates consider: destination, duration, group size, amenities.
    - User shall be able to adjust estimates manually.

### FR-005: Trip Management
- **Description**: Users can create and manage individual trips.
- **Requirements**:
    - User shall create trips with:
        - Name, Destination (Country/State/City)
        - Start Date, End Date
        - Travel Type (Leisure/Business/Adventure/Religious)
        - Group Type (Solo/Friends/Family)
        - Required Amenities (WiFi, Food, Parking, Pool, etc.)
    - User shall edit and delete trips.
    - Multi-step trip creation wizard.

### FR-006: Group Collaboration
- **Description**: Users can invite others to join trips.
- **Requirements**:
    - Trip owner can invite members via:
        - Email invitation
        - Shareable invite link
    - Invited users receive email with invitation.
    - Invited users can accept/decline invitation.
    - Trip shows all members.

### FR-007: Expense Tracking
- **Description**: Users can track trip expenses.
- **Requirements**:
    - User shall add expenses with:
        - Amount (INR)
        - Category (Hotel/Food/Transport/Activity/Other)
        - Description
        - Who paid
    - Expense list shows all trip expenses.
    - Running total displayed.

### FR-008: Expense Splitting (Splitwise-style)
- **Description**: Expenses are automatically split among group members.
- **Requirements**:
    - Expenses split equally by default.
    - User can specify custom split amounts.
    - System calculates "who owes whom".
    - User can mark splits as settled.
    - Settlement summary shows net balances.

### FR-009: Cost Analyzer
- **Description**: Users can analyze trip costs.
- **Requirements**:
    - View cost breakdown by category (pie chart).
    - Compare estimated vs actual costs.
    - See per-person cost summary.
    - View cost trends across trips.

### FR-010: PWA & Offline Support
- **Description**: App works offline and is installable.
- **Requirements**:
    - App is installable on mobile and desktop.
    - Static assets cached for offline access.
    - AI suggestions cached for offline viewing.
    - Changes made offline sync when online.
    - Offline indicator shows connection status.

### FR-011: Amenities Filtering
- **Description**: Users can filter destinations by amenities.
- **Requirements**:
    - Supported amenities:
        - WiFi
        - Breakfast included
        - Parking
        - Pool
        - Gym
        - Pet-friendly
        - Airport shuttle
    - AI suggestions consider amenity preferences.

## 3. Non-Functional Requirements

### Performance
- Page load: < 2 seconds (online), < 100ms (cached/offline)
- AI response: < 5 seconds

### Security
- All API calls authenticated via JWT
- API keys stored securely (not in frontend)
- HTTPS required in production

### Scalability
- Support for Redis caching (AI responses)
- Database indexing for query performance

### Compatibility
- Modern browsers: Chrome, Edge, Safari, Firefox
- Mobile: Android, iOS (via PWA)
- Desktop: Windows, macOS, Linux (via PWA)

## 4. Currency
- All monetary values in Indian Rupees (₹ INR)
- No currency conversion required
