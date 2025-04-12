# Fandom Intelligence Suite - Backend Architecture

## Overview

The backend for the Fandom Intelligence Suite is designed as a modular, scalable system built with FastAPI, PostgreSQL, Celery, and Redis. This document outlines the architecture, components, and their interactions.

## Core Components

### 1. FastAPI Application

The main application server built with FastAPI will handle HTTP requests, API endpoints, and business logic.

- **Framework**: FastAPI 0.95+
- **Python Version**: 3.11+
- **Features**:
  - Automatic OpenAPI documentation
  - Request validation
  - Dependency injection
  - Asynchronous request handling
  - Type hints throughout

### 2. Database Layer

PostgreSQL will serve as the primary data store for the application.

- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0+ with async support
- **Migration Tool**: Alembic
- **Connection Pooling**: asyncpg

### 3. Background Task Processing

Celery with Redis as a message broker will handle background tasks such as:

- Google Drive file processing
- AI insight generation
- Scheduled reports
- Data aggregation for dashboards

Components:
- **Task Queue**: Celery 5.2+
- **Message Broker**: Redis 6+
- **Task Scheduling**: Celery Beat

### 4. Authentication & Authorization

Token-based authentication with role-based access control (RBAC):

- **Authentication**: JWT tokens
- **Authorization**: Role-based middleware
- **Password Hashing**: Passlib with bcrypt
- **Session Management**: Redis

### 5. External Integrations

- **Google Drive API**: For .xlsx file ingestion
  - Uses service account authentication
  - Scheduled polling for new files
  - File deduplication based on hash or timestamp

- **AI Services**: OpenAI API for insight generation
  - Text analysis
  - Fan clustering
  - Performance prediction

## Application Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── ingest.py
│   │   │   ├── insights.py
│   │   │   ├── notifications.py
│   │   │   ├── simulator.py
│   │   │   └── testing.py
│   │   ├── dependencies.py
│   │   └── router.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── events.py
│   ├── db/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── init_db.py
│   ├── models/
│   │   ├── fan.py
│   │   ├── chatter.py
│   │   ├── creator.py
│   │   ├── message.py
│   │   ├── upload.py
│   │   ├── ai_insight.py
│   │   ├── notification.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── fan.py
│   │   ├── chatter.py
│   │   ├── creator.py
│   │   ├── message.py
│   │   ├── upload.py
│   │   ├── ai_insight.py
│   │   ├── notification.py
│   │   └── user.py
│   ├── services/
│   │   ├── drive_service.py
│   │   ├── ai_service.py
│   │   └── notification_service.py
│   ├── tasks/
│   │   ├── drive_sync.py
│   │   ├── ai_insights.py
│   │   └── notifications.py
│   └── utils/
│       ├── xlsx_parser.py
│       └── deduplication.py
├── alembic/
│   ├── versions/
│   └── alembic.ini
├── celery_worker.py
├── main.py
├── requirements.txt
└── tests/
    ├── api/
    ├── services/
    └── conftest.py
```

## Data Flow

1. **API Request Flow**:
   - Client sends request to FastAPI endpoint
   - Authentication middleware validates token
   - Authorization middleware checks role permissions
   - Endpoint handler processes request
   - Response returned to client

2. **Google Drive Sync Flow**:
   - Celery Beat triggers scheduled task
   - Task checks Google Drive for new files
   - New files are downloaded
   - Files are parsed with pandas
   - Data is deduplicated and stored in database
   - Task status is updated

3. **AI Insight Generation Flow**:
   - Triggered by schedule or manual request
   - Data is retrieved from database
   - Data is processed and sent to AI service
   - Insights are generated and stored
   - Notifications are created if needed

## Scalability Considerations

- **Database**: Connection pooling, indexing, and query optimization
- **API**: Asynchronous request handling
- **Background Tasks**: Worker scaling based on queue size
- **Caching**: Redis for frequently accessed data
- **Deployment**: Containerization for easy scaling

## Security Measures

- **Authentication**: JWT with proper expiration and refresh mechanism
- **Authorization**: Fine-grained RBAC
- **Data Protection**: Encryption at rest
- **API Security**: Rate limiting, CORS, HTTPS
- **Dependency Security**: Regular updates and vulnerability scanning

## Monitoring and Logging

- **Application Logs**: Structured logging with levels
- **Performance Metrics**: Request timing, database query performance
- **Error Tracking**: Exception handling and reporting
- **Task Monitoring**: Celery task status and performance

## Deployment Options

The backend is designed to be deployable on either AWS or Render:

### AWS Deployment
- **API**: ECS Fargate or EC2
- **Database**: RDS PostgreSQL
- **Redis**: ElastiCache
- **Workers**: ECS or EC2

### Render Deployment
- **API**: Web Service
- **Database**: Managed PostgreSQL
- **Redis**: Redis Service
- **Workers**: Background Workers

Both options provide scalability, reliability, and ease of management.
