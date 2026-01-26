#!/bin/bash

# Load environment variables from .env file
if [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# Run Spring Boot application
./mvnw spring-boot:run
