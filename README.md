# MicroItinerary - AI Travel Planner

An AI-powered Progressive Web Application (PWA) for planning annual travel itineraries. Features intelligent destination suggestions, cost estimation in INR, and Splitwise-style expense splitting for group trips.

## ✨ Features

- **📅 Annual Trip Planning** - Plan trips for an entire year with a 12-month calendar view
- **🤖 AI-Powered Suggestions** - Get destination recommendations based on season, budget, and preferences
- **💰 Cost Estimation** - AI-generated cost breakdowns in INR for hotels, food, transport, and activities
- **👥 Group Travel** - Support for solo, friends, and family trips
- **💸 Expense Splitting** - Splitwise-style expense tracking and settlement
- **🏨 Amenities Filter** - Filter by WiFi, food, parking, and more
- **📱 PWA** - Install on mobile and desktop, works offline
- **🔐 Google Login** - Secure authentication with Google OAuth

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + PWA |
| **Styling** | CSS (modern design system) |
| **Backend** | Spring Boot 3.2.2 + Java 21 |
| **Database** | PostgreSQL 16 |
| **Authentication** | Google OAuth 2.0 + JWT |
| **AI** | OpenAI GPT-4 API |
| **Caching** | Redis |

### External APIs

- **OpenAI API** - Destination suggestions, cost estimation
- **Country State City API** - Location data
- **REST Countries API** - Country metadata

## 🚀 Getting Started

### Prerequisites

- Java 21 JDK
- Node.js 18+
- PostgreSQL 16
- Redis
- OpenAI API Key
- Google OAuth Credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd microitinerary
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start the database and Redis**
   ```bash
   docker-compose up -d
   ```

4. **Run the backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

5. **Run the frontend**
   ```bash
   cd web
   npm install
   npm run dev
   ```

6. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html

## 📂 Project Structure

```
microitinerary/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/microitinerary/
│   │       ├── config/         # Security, OAuth, Redis config
│   │       ├── controller/     # REST Controllers
│   │       ├── domain/         # JPA Entities
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── repository/     # JPA Repositories
│   │       └── service/        # Business Logic + AI Integration
│   └── src/main/resources/
│       ├── application.yml     # App config
│       └── db/migration/       # Flyway migrations
├── web/                        # React PWA Frontend
│   ├── public/
│   │   ├── manifest.json       # PWA manifest
│   │   └── service-worker.js   # Offline support
│   └── src/
│       ├── api/                # API clients
│       ├── components/         # React components
│       ├── context/            # Auth & offline context
│       ├── db/                 # IndexedDB utilities
│       └── pages/              # Page components
├── docker-compose.yml          # PostgreSQL + Redis
├── .env.example                # Environment template
└── test/                       # API tests
```

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `JWT_SECRET` | Secret for JWT token signing |
| `POSTGRES_*` | Database connection details |
| `REDIS_*` | Redis connection details |

## 📱 PWA Features

- **Installable** - Add to home screen on mobile and desktop
- **Offline Support** - Cached pages and AI responses work offline
- **Background Sync** - Changes sync when connection is restored

## 📄 License

MIT License
