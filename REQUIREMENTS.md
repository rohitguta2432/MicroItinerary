# Product Requirements & Feature Use Cases

## 1. Product Overview
**Product Name**: MicroItinerary
**Vision**: A robust, offline-first mobile application that allows travelers to plan, manage, and execute detailed travel itineraries without relying on constant internet connectivity.
**Key Value Proposition**: Seamless synchronization ensures data integrity across devices while prioritizing a fluid, offline-capable user experience.

## 2. Functional Requirements

### FR-001: Trip Management
- **Description**: Users can organize their travels into distinct trips.
- **Requirements**:
    - User shall be able to create a new trip with a Title, Start Date, and End Date.
    - User shall be able to view a list of all trips, sorted by date.
    - User shall be able to edit trip details or delete a trip.
    - All actions must be available offline.

### FR-002: Itinerary Planning
- **Description**: Users can plan activities for each day of their trip.
- **Requirements**:
    - User shall be able to see a day-by-day view of the trip.
    - User shall be able to add activities to specific days with a title and time.
    - User shall be able to reorder activities within a day using drag-and-drop.
    - Reordering must persist and sync to the server.

### FR-003: Offline Sync Capability
- **Description**: Data must sync between the local device and the server when online.
- **Requirements**:
    - The app must queue all local changes (Creates, Updates, Deletes) when offline.
    - The app must automatically push local changes and pull remote updates when connectivity is restored (or triggered manually).
    - Conflict Resolution: "Last-Write-Wins" strategy based on `updatedAt` timestamps.

### FR-004: Packing List (Future Scope)
- **Description**: A checklist for items to pack.
- **Requirements**:
    - User can add items and toggle their "checked" state.

## 3. Feature Use Cases

### UC-001: Creating a Weekend Getaway (Offline)
**Actor**: Traveler (Alice)
**Precondition**: Alice is on a flight with no Wi-Fi.
**Flow**:
1. Alice opens MicroItinerary.
2. Taps "Add Trip".
3. Enters "Weekend in Rome", Date: "May 1 - May 3".
4. Taps "Save".
5. App saves trip locally with `dirty=1` flag.
**Postcondition**: Trip appears in the list. Data is pending sync.

### UC-002: Reordering Activities
**Actor**: Traveler (Bob)
**Precondition**: Bob has a trip with 3 activities: "Museum", "Lunch", "Park".
**Flow**:
1. Bob decides to go to the Park before Lunch.
2. Bob opens the Itinerary View.
3. Long-presses "Park" and drags it above "Lunch".
4. Releases the item.
**Postcondition**: The order is updated in the UI and database (`orderIndex` changed).

### UC-003: Syncing Back Online
**Actor**: Traveler (Alice)
**Precondition**: Alice lands and connects to airport Wi-Fi.
**Flow**:
1. Alice opens the app / pulls-to-refresh.
2. App detects network.
3. App sends "Weekend in Rome" trip to backend.
4. Backend saves trip and returns success.
5. App marks local record as clean (`dirty=0`).
**Postcondition**: Trip is safely backed up on the server.

## 4. Technical Non-Functional Requirements
- **Performance**: App must load content from local DB instantly (<100ms).
- **Reliability**: Sync must not lose data; verified via soft-deletes and extensive transaction logs.
- **Compatibility**: Support for Android and iOS (via Expo).
