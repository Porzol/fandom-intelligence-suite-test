#!/bin/bash
# Frontend build script for Render.com deployment

# Exit on error
set -e

# Install Node.js dependencies
npm install

# Create production environment file
echo "REACT_APP_API_URL=https://fandom-intelligence-api.onrender.com/api" > .env.production

# Build the React application
npm run build

echo "Frontend build completed successfully"
