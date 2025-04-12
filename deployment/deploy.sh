#!/bin/bash
# Script to deploy the Fandom Intelligence Suite to Render.com

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Fandom Intelligence Suite Deployment ===${NC}"
echo "This script will guide you through deploying the application to Render.com"
echo ""

echo -e "${YELLOW}Prerequisites:${NC}"
echo "1. A Render.com account"
echo "2. GitHub repository with the Fandom Intelligence Suite code"
echo "3. OpenAI API key for AI insights functionality"
echo "4. Google Drive API credentials (optional, for file ingestion)"
echo ""

echo -e "${YELLOW}Deployment Steps:${NC}"
echo "1. Fork or push the Fandom Intelligence Suite code to your GitHub repository"
echo "2. Log in to your Render.com account"
echo "3. Create a new 'Blueprint' from your GitHub repository"
echo "4. Use the render.yaml file in the deployment directory"
echo "5. Configure the required environment variables"
echo "6. Deploy the services"
echo ""

echo -e "${YELLOW}Environment Variables to Configure:${NC}"
echo "- OPENAI_API_KEY: Your OpenAI API key"
echo "- GOOGLE_DRIVE_CREDENTIALS: Your Google Drive API credentials (JSON format)"
echo "- GOOGLE_DRIVE_FOLDER_ID: ID of the Google Drive folder to monitor"
echo "- DEFAULT_ADMIN_USERNAME: Username for the default admin account"
echo "- DEFAULT_ADMIN_PASSWORD: Password for the default admin account"
echo "- DEFAULT_ADMIN_EMAIL: Email for the default admin account"
echo ""

echo -e "${GREEN}After deployment, your application will be available at:${NC}"
echo "- Backend API: https://fandom-intelligence-api.onrender.com"
echo "- Frontend: https://fandom-intelligence-ui.onrender.com"
echo ""

echo -e "${YELLOW}Testing the Deployment:${NC}"
echo "After deployment is complete, run the test_deployment.sh script to verify everything is working correctly."
echo ""

echo -e "${BLUE}For more detailed instructions, refer to the DEPLOYMENT_GUIDE.md file.${NC}"
