---
description: Setup development environment (Docker, Backend, Mobile)
---

1. Ensure Docker services are running
// turbo
2. docker compose up -d

3. Make mvnw executable
// turbo
4. chmod +x backend/mvnw

5. Resolve Backend Dependencies
// turbo
6. cd backend && ./mvnw dependency:resolve

7. Install Mobile Dependencies
// turbo
8. cd mobile && npm install

9. Verify Infrastructure Status
// turbo
10. docker ps --filter "name=microitinerary" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
