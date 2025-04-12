# Fandom Intelligence Suite

A full-stack analytics platform for OnlyFans agencies to optimize fan engagement, chatter performance, and creator earnings.

## Overview

The Fandom Intelligence Suite is a comprehensive platform designed to help OnlyFans agencies manage their operations more effectively. It provides tools for data analysis, AI-powered insights, A/B testing, chatter simulation, and team management.

## Features

- **Fan Intelligence Dashboard**: Track fan metrics, spending patterns, and engagement levels
- **AI Insight Engine**: Generate AI-powered insights and recommendations
- **AI Coaching Assistant**: Get real-time suggestions for fan interactions
- **A/B Testing Lab**: Test different messaging strategies to optimize performance
- **Chatter Simulator**: Train chatters with simulated fan interactions
- **Creator Command Center**: Manage creators and track their performance
- **Team Ops Dashboard**: Monitor team performance and manage shifts
- **Notification Center**: Stay updated with system alerts and notifications

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL
- JWT Authentication
- Celery for background tasks
- Redis for task queue
- OpenAI API integration

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication
- Chart.js for data visualization

## Installation

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL
- Redis (for Celery)

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fandom-intelligence-suite.git
cd fandom-intelligence-suite
```

2. Set up a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

7. (Optional) Start Celery worker for background tasks:
```bash
celery -A celery_worker.celery worker --loglevel=info
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
```

4. Start the development server:
```bash
npm start
```

## Deployment

### Backend Deployment

The backend can be deployed to various platforms:

#### Option 1: Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from your `.env` file

#### Option 2: AWS

1. Set up an EC2 instance with Python installed
2. Clone the repository and install dependencies
3. Set up a PostgreSQL database (RDS recommended)
4. Configure environment variables
5. Use Gunicorn with Nginx as a reverse proxy
6. Set up systemd services for the API and Celery worker

### Frontend Deployment

The frontend can be deployed to:

#### Option 1: Netlify/Vercel

1. Connect your GitHub repository
2. Set the build command: `npm run build`
3. Set the publish directory: `build`
4. Configure environment variables

#### Option 2: AWS S3 + CloudFront

1. Build the frontend: `npm run build`
2. Upload the build folder to an S3 bucket
3. Configure the bucket for static website hosting
4. Set up CloudFront for CDN and HTTPS

## Usage

### Initial Setup

1. Access the application at `http://localhost:3000`
2. Log in with the default admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. Change the default password immediately
4. Set up your agency profile and add team members

### Data Import

1. Upload Excel files with chat logs via the ingestion interface
2. Configure Google Drive integration for automatic imports
3. Verify data in the dashboard

### User Roles

- **Admin**: Full access to all features
- **Manager**: Access to most features except user management
- **Ops Analyst**: Access to analytics and insights
- **Trainer**: Access to coaching and simulation tools

## API Documentation

API documentation is available at `http://localhost:8000/docs` when the backend is running.

## Development

### Project Structure

```
fandom_intelligence_suite/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   └── router.py
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tasks/
│   │   └── utils/
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── main.py
│   ├── celery_worker.py
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── types/
    │   └── utils/
    ├── .env
    ├── package.json
    └── tailwind.config.js
```

### Running Tests

To run backend tests:

```bash
cd backend
pytest
```

To run frontend tests:

```bash
cd frontend
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact [your-email@example.com](mailto:your-email@example.com).
