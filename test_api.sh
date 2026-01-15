#!/bin/bash

BASE_URL="http://localhost:8080/api"

echo "Waiting for backend to start..."
until curl -s $BASE_URL/trips > /dev/null; do
  sleep 2
  echo -n "."
done
echo " Backend is UP!"

# 1. Create a Trip
echo "Creating Trip..."
TRIP_ID=$(uuidgen)
curl -X POST $BASE_URL/trips \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$TRIP_ID\",
    \"name\": \"Integration Test Trip\",
    \"location\": \"Test City\",
    \"startDate\": \"2024-01-01\",
    \"endDate\": \"2024-01-05\",
    \"travelType\": \"BUSINESS\"
  }"
echo ""

# 2. Verify Trip Exists
echo "Verifying Trip..."
curl -s $BASE_URL/trips/$TRIP_ID | grep "Integration Test Trip" && echo "SUCCESS: Trip found" || echo "FAILURE: Trip not found"

# 3. Test Sync Push
echo "Testing Sync Push..."
SYNC_ID=$(uuidgen)
curl -X POST $BASE_URL/sync/push \
  -H "Content-Type: application/json" \
  -d "{
    \"operations\": [
      {
        \"type\": \"TRIP\", 
        \"id\": \"$SYNC_ID\",
        \"operation\": \"CREATE\",
        \"clientUpdatedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%S")\",
        \"name\": \"Synced Trip\",
        \"location\": \"Sync City\",
        \"startDate\": \"2024-02-01\",
        \"endDate\": \"2024-02-05\",
        \"travelType\": \"LEISURE\"
      }
    ]
  }"
echo "Push Completed"

# 4. Test Sync Pull
echo "Testing Sync Pull..."
curl -s "$BASE_URL/sync/pull?since=2000-01-01T00:00:00" | grep "Synced Trip" && echo "SUCCESS: Sync Pull returned data" || echo "FAILURE: Sync Pull failed"

echo "Integration Tests Completed"
