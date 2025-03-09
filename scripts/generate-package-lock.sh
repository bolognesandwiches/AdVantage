#!/bin/bash

# This script generates a package-lock.json file for the frontend
# It can be run directly or through the make command

# Navigate to the frontend directory
cd "$(dirname "$0")/../frontend" || exit

# Run npm install to generate package-lock.json
echo "Generating package-lock.json for frontend..."
npm install --package-lock-only

echo "package-lock.json generated successfully!" 