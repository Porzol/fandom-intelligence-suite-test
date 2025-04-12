#!/bin/bash
# Test script for deployed Fandom Intelligence Suite

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend API URL
API_URL="https://fandom-intelligence-api.onrender.com"
# Frontend URL
FRONTEND_URL="https://fandom-intelligence-ui.onrender.com"

echo "Testing Fandom Intelligence Suite deployment..."
echo "Backend API: $API_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Test backend health endpoint
echo "Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/health)
if [ "$HEALTH_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed with status code $HEALTH_RESPONSE${NC}"
fi

# Test frontend accessibility
echo "Testing frontend accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$FRONTEND_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Frontend accessibility check passed${NC}"
else
    echo -e "${RED}✗ Frontend accessibility check failed with status code $FRONTEND_RESPONSE${NC}"
fi

# Test API authentication endpoint
echo "Testing API authentication endpoint..."
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/auth/login -d "username=admin&password=admin123")
if [ "$AUTH_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Authentication endpoint check passed${NC}"
else
    echo -e "${RED}✗ Authentication endpoint check failed with status code $AUTH_RESPONSE${NC}"
fi

# Get auth token for further tests
echo "Getting authentication token for API tests..."
TOKEN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login -d "username=admin&password=admin123")
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Successfully obtained authentication token${NC}"
    
    # Test protected API endpoint
    echo "Testing protected API endpoint..."
    PROTECTED_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" $API_URL/api/auth/me)
    if [ "$PROTECTED_RESPONSE" == "200" ]; then
        echo -e "${GREEN}✓ Protected endpoint check passed${NC}"
    else
        echo -e "${RED}✗ Protected endpoint check failed with status code $PROTECTED_RESPONSE${NC}"
    fi
else
    echo -e "${RED}✗ Failed to obtain authentication token${NC}"
fi

echo ""
echo "Deployment test completed."
