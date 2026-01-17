#!/bin/bash

# Function to run newman
run_newman() {
    local cmd=$1
    local script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    echo "Running MicroItinerary Postman Tests using $cmd..."
    $cmd run "$script_dir/MicroItinerary.postman_collection.json" --env-var "baseUrl=http://localhost:8080" --reporters cli
}

# Check if newman is installed globally
if command -v newman &> /dev/null; then
    run_newman "newman"
# Check if npx is installed
elif command -v npx &> /dev/null; then
    echo "Global newman not found. Trying with npx..."
    run_newman "npx newman"
else
    echo "Error: Neither 'newman' nor 'npx' could be found."
    echo "Please install newman globally: npm install -g newman"
    echo "Or ensure npm/npx is installed."
    exit 1
fi

# Check the exit code (of the last executed command)
if [ $? -eq 0 ]; then
    echo "Tests passed successfully!"
else
    echo "Tests failed!"
    exit 1
fi
