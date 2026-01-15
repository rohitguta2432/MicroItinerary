# MicroItinerary

A comprehensive, offline-first travel itinerary builder featuring a React Native mobile app and a Spring Boot backend, designed for seamless travel planning with or without an internet connection.

## 🏗️ Architecture

### Frontend (Mobile)
- **Framework**: React Native (Expo Managed Workflow)
- **Language**: TypeScript
- **State Management**: Zustand
- **Local Database**: Expo SQLite
- **Network**: Axios
- **Sync Strategy**: 
    - Offline-first: All writes go to SQLite immediately.
    - Sync Queue: Mutations are logged in a local `sync_queue` table.
    - Push/Pull: Background service pushes local changes and pulls server updates.

### Backend (Server)
- **Framework**: Spring Boot 3 (Java 21)
- **Database**: PostgreSQL
- **Migrations**: Flyway
- **Conflict Resolution**: Last-Write-Wins based on precise timestamps.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm/yarn
- Java 21 JDK
- PostgreSQL
- Expo Go App (on your phone) or Android Emulator

### Backend Setup
1.  Navigate to `backend/`.
2.  Ensure PostgreSQL is running and create a database named `microitinerary`.
3.  Update `src/main/resources/application.yml` with your DB credentials.
4.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
    (On first run, Flyway will create the tables automatically).

### Mobile Setup
1.  Navigate to `mobile/`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Expo server:
    ```bash
    npx expo start
    ```
4.  Scan the QR code with your phone or press `a` for Android Emulator.
    *Note: If using Android Emulator, ensure the backend URL in `src/services/syncService.ts` is set to `http://10.0.2.2:8080`.*

## 📂 Project Structure

```
microitinerary/
├── backend/                # Spring Boot Project
│   ├── src/main/java/      # Java Source (Controllers, Services, Entities)
│   └── src/main/resources/ # Config & Migrations
└── mobile/                 # React Native Project
    ├── src/app/            # Screens & Navigation
    ├── src/db/             # SQLite Schema & Client
    ├── src/services/       # Sync Logic
    └── src/store/          # Zustand State
```

## 🔄 Sync Flow Explained
1.  **User Action**: User creates a Trip.
2.  **Local Commit**: Trip is saved to SQLite `trips` table.
3.  **Queue**: An entry is added to `sync_queue` with status `PENDING`.
4.  **Sync Trigger**: App detects network.
5.  **Push**: `syncService` sends queued items to `POST /api/sync/push`.
6.  **Pull**: Service requests updates via `GET /api/sync/pull`.
7.  **Merge**: Server changes are applied to local SQLite.

## ✅ MVP Features
- Create/Edit Trips
- Add Places to a "Bucket"
- Drag & Drop Itinerary Planning (Placeholder UI)
- Offline Capability
- Basic Sync System
