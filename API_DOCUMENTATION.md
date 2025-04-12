# Fandom Intelligence Suite - API Documentation

This document provides detailed information about the API endpoints available in the Fandom Intelligence Suite.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate, include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

To obtain a token, use the login endpoint.

## Endpoints

### Authentication

#### Login

```
POST /api/auth/login
```

Authenticates a user and returns an access token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": 0,
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "admin|manager|ops_analyst|trainer"
  }
}
```

#### Register User

```
POST /api/auth/register
```

Registers a new user (admin access required).

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "full_name": "string",
  "password": "string",
  "role": "admin|manager|ops_analyst|trainer"
}
```

**Response:**
```json
{
  "id": 0,
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "admin|manager|ops_analyst|trainer",
  "is_active": true,
  "created_at": "datetime"
}
```

#### Get Current User

```
GET /api/auth/me
```

Returns information about the currently authenticated user.

**Response:**
```json
{
  "id": 0,
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "admin|manager|ops_analyst|trainer",
  "is_active": true,
  "created_at": "datetime"
}
```

### User Management

#### Get All Users

```
GET /api/users/
```

Returns a list of all users (manager or admin access required).

**Response:**
```json
[
  {
    "id": 0,
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "admin|manager|ops_analyst|trainer",
    "is_active": true,
    "created_at": "datetime"
  }
]
```

#### Get User by ID

```
GET /api/users/{user_id}
```

Returns information about a specific user (manager or admin access required).

**Response:**
```json
{
  "id": 0,
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "admin|manager|ops_analyst|trainer",
  "is_active": true,
  "created_at": "datetime"
}
```

#### Update User

```
PUT /api/users/{user_id}
```

Updates a user's information (admin access required).

**Request Body:**
```json
{
  "email": "string",
  "full_name": "string",
  "password": "string",
  "role": "admin|manager|ops_analyst|trainer"
}
```

**Response:**
```json
{
  "id": 0,
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "admin|manager|ops_analyst|trainer",
  "is_active": true,
  "created_at": "datetime"
}
```

#### Delete User

```
DELETE /api/users/{user_id}
```

Deletes a user (admin access required).

**Response:**
```
204 No Content
```

### Dashboard

#### Get Fans

```
GET /api/dashboard/fans
```

Returns a list of fans with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (active, inactive)
- `creator_id` (optional): Filter by creator ID
- `skip` (optional): Number of records to skip (pagination)
- `limit` (optional): Maximum number of records to return (pagination)

**Response:**
```json
[
  {
    "id": 0,
    "name": "string",
    "onlyfans_id": "string",
    "total_spent": 0.0,
    "first_seen": "date",
    "last_active": "date",
    "status": "string",
    "creator_id": 0
  }
]
```

#### Get Fan by ID

```
GET /api/dashboard/fans/{fan_id}
```

Returns information about a specific fan.

**Response:**
```json
{
  "id": 0,
  "name": "string",
  "onlyfans_id": "string",
  "total_spent": 0.0,
  "first_seen": "date",
  "last_active": "date",
  "status": "string",
  "creator_id": 0
}
```

#### Get Fan Statistics

```
GET /api/dashboard/stats/fans
```

Returns statistics about fans.

**Response:**
```json
{
  "total_fans": 0,
  "active_fans": 0,
  "inactive_fans": 0,
  "average_spent": 0.0,
  "new_fans_last_30_days": 0
}
```

#### Get Top Fans

```
GET /api/dashboard/fans/top
```

Returns a list of top fans by spending.

**Query Parameters:**
- `limit` (optional): Maximum number of records to return (default: 10)

**Response:**
```json
[
  {
    "id": 0,
    "name": "string",
    "onlyfans_id": "string",
    "total_spent": 0.0,
    "first_seen": "date",
    "last_active": "date",
    "status": "string",
    "creator_id": 0
  }
]
```

### Ingestion

#### Get Messages

```
GET /api/ingest/messages
```

Returns a list of messages with optional filtering.

**Query Parameters:**
- `fan_id` (optional): Filter by fan ID
- `chatter_id` (optional): Filter by chatter ID
- `skip` (optional): Number of records to skip (pagination)
- `limit` (optional): Maximum number of records to return (pagination)

**Response:**
```json
[
  {
    "id": 0,
    "fan_id": 0,
    "chatter_id": 0,
    "content": "string",
    "is_from_fan": true,
    "timestamp": "datetime",
    "message_type": "string"
  }
]
```

#### Get Message by ID

```
GET /api/ingest/messages/{message_id}
```

Returns information about a specific message.

**Response:**
```json
{
  "id": 0,
  "fan_id": 0,
  "chatter_id": 0,
  "content": "string",
  "is_from_fan": true,
  "timestamp": "datetime",
  "message_type": "string"
}
```

#### Create Message

```
POST /api/ingest/messages
```

Creates a new message.

**Request Body:**
```json
{
  "fan_id": 0,
  "chatter_id": 0,
  "content": "string",
  "is_from_fan": true,
  "timestamp": "datetime",
  "message_type": "string"
}
```

**Response:**
```json
{
  "id": 0,
  "fan_id": 0,
  "chatter_id": 0,
  "content": "string",
  "is_from_fan": true,
  "timestamp": "datetime",
  "message_type": "string"
}
```

#### Upload Message Batch

```
POST /api/ingest/batch
```

Uploads a batch of messages.

**Request Body:**
```json
{
  "messages": [
    {
      "fan_id": 0,
      "chatter_id": 0,
      "content": "string",
      "is_from_fan": true,
      "timestamp": "datetime",
      "message_type": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "count": 0
}
```

#### Trigger Google Drive Sync

```
POST /api/ingest/drive/sync
```

Triggers a synchronization with Google Drive to import new files.

**Response:**
```json
{
  "status": "string",
  "message": "string"
}
```

### AI Insights

#### Get Insights

```
GET /api/insights/
```

Returns a list of AI-generated insights with optional filtering.

**Query Parameters:**
- `target_type` (optional): Filter by target type (fan, chatter, creator, message, general)
- `target_id` (optional): Filter by target ID
- `is_archived` (optional): Filter by archive status (default: false)
- `skip` (optional): Number of records to skip (pagination)
- `limit` (optional): Maximum number of records to return (pagination)

**Response:**
```json
[
  {
    "id": 0,
    "target_type": "fan|chatter|creator|message|general",
    "target_id": 0,
    "summary": "string",
    "details": "string",
    "tags": ["string"],
    "confidence_score": 0.0,
    "action_items": ["string"],
    "metadata": {},
    "is_archived": false,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

#### Get Insight by ID

```
GET /api/insights/{insight_id}
```

Returns information about a specific insight.

**Response:**
```json
{
  "id": 0,
  "target_type": "fan|chatter|creator|message|general",
  "target_id": 0,
  "summary": "string",
  "details": "string",
  "tags": ["string"],
  "confidence_score": 0.0,
  "action_items": ["string"],
  "metadata": {},
  "is_archived": false,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Generate Insight

```
POST /api/insights/generate
```

Generates a new AI insight (analyst access required).

**Request Body:**
```json
{
  "target_type": "fan|chatter|creator|message|general",
  "target_id": 0,
  "custom_prompt": "string"
}
```

**Response:**
```json
{
  "status": "processing",
  "message": "string",
  "insight_id": null
}
```

#### Archive Insight

```
POST /api/insights/archive/{insight_id}
```

Archives an insight (analyst access required).

**Response:**
```json
{
  "id": 0,
  "target_type": "fan|chatter|creator|message|general",
  "target_id": 0,
  "summary": "string",
  "details": "string",
  "tags": ["string"],
  "confidence_score": 0.0,
  "action_items": ["string"],
  "metadata": {},
  "is_archived": true,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### A/B Testing

#### Get Test Scenarios

```
GET /api/test/scenarios
```

Returns a list of A/B test scenarios.

**Response:**
```json
[
  {
    "id": 0,
    "name": "string",
    "description": "string",
    "variants": [
      {
        "id": 0,
        "name": "string",
        "content": "string",
        "is_control": true
      }
    ],
    "target_segment": "string",
    "success_metric": "string",
    "status": "draft|running|completed",
    "created_at": "datetime"
  }
]
```

#### Create Test Scenario

```
POST /api/test/scenarios
```

Creates a new A/B test scenario (analyst access required).

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "variants": [
    {
      "name": "string",
      "content": "string",
      "is_control": true
    }
  ],
  "target_segment": "string",
  "success_metric": "string"
}
```

**Response:**
```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "variants": [
    {
      "id": 0,
      "name": "string",
      "content": "string",
      "is_control": true
    }
  ],
  "target_segment": "string",
  "success_metric": "string",
  "status": "draft",
  "created_at": "datetime"
}
```

#### Start Test

```
POST /api/test/scenarios/{scenario_id}/start
```

Starts an A/B test (analyst access required).

**Response:**
```json
{
  "scenario_id": 0,
  "status": "running",
  "started_at": "datetime"
}
```

#### Stop Test

```
POST /api/test/scenarios/{scenario_id}/stop
```

Stops an A/B test (analyst access required).

**Response:**
```json
{
  "scenario_id": 0,
  "status": "completed",
  "stopped_at": "datetime"
}
```

#### Get Test Results

```
GET /api/test/scenarios/{scenario_id}/results
```

Returns results for an A/B test.

**Response:**
```json
{
  "scenario_id": 0,
  "status": "completed",
  "variants": [
    {
      "id": 0,
      "name": "string",
      "is_control": true,
      "metrics": {
        "impressions": 0,
        "conversions": 0,
        "conversion_rate": 0.0
      }
    }
  ],
  "winner": {
    "variant_id": 0,
    "name": "string",
    "improvement": 0.0
  }
}
```

### Simulator

#### Get Simulation Scenarios

```
GET /api/simulate/scenarios
```

Returns a list of available simulation scenarios.

**Response:**
```json
[
  {
    "id": "string",
    "type": "string",
    "name": "string",
    "description": "string"
  }
]
```

#### Get Fan Types

```
GET /api/simulate/fan-types
```

Returns a list of available fan types for simulation.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "characteristics": ["string"]
  }
]
```

#### Simulate Conversation

```
POST /api/simulate/conversation
```

Starts a new simulated conversation (trainer access required).

**Request Body:**
```json
{
  "fan_type": "string",
  "initial_message": "string",
  "scenario": "string"
}
```

**Response:**
```json
{
  "conversation_id": "string",
  "messages": [
    {
      "id": "string",
      "content": "string",
      "is_from_fan": true,
      "timestamp": "datetime"
    }
  ]
}
```

#### Continue Simulation

```
POST /api/simulate/conversation/{conversation_id}/continue
```

Continues a simulated conversation (trainer access required).

**Request Body:**
```json
{
  "message": "string"
}
```

**Response:**
```json
{
  "conversation_id": "string",
  "messages": [
    {
      "id": "string",
      "content": "string",
      "is_from_fan": true,
      "timestamp": "datetime"
    }
  ]
}
```

#### Rate Simulation Response

```
POST /api/simulate/message/{message_id}/rate
```

Rates a response in a simulated conversation (trainer access required).

**Request Body:**
```json
{
  "rating": 0,
  "feedback": "string"
}
```

**Response:**
```json
{
  "message_id": "string",
  "rating": 0,
  "feedback": "string"
}
```

### Notifications

#### Get Notifications

```
GET /api/notifications/
```

Returns a list of notifications for the current user.

**Query Parameters:**
- `is_read` (optional): Filter by read status
- `is_archived` (optional): Filter by archive status (default: false)
- `skip` (optional): Number of records to skip (pagination)
- `limit` (optional): Maximum number of records to return (pagination)

**Response:**
```json
[
  {
    "id": 0,
    "message": "string",
    "severity": "normal|caution|risk",
    "is_read": false,
    "is_archived": false,
    "related_type": "string",
    "related_id": 0,
    "created_at": "datetime"
  }
]
```

#### Mark Notification as Read

```
POST /api/notifications/{notification_id}/read
```

Marks a notification as read.

**Response:**
```json
{
  "id": 0,
  "message": "string",
  "severity": "normal|caution|risk",
  "is_read": true,
  "is_archived": false,
  "related_type": "string",
  "related_id": 0,
  "created_at": "datetime"
}
```

#### Archive Notification

```
POST /api/notifications/{notification_id}/archive
```

Archives a notification.

**Response:**
```json
{
  "id": 0,
  "message": "string",
  "severity": "normal|caution|risk",
  "is_read": true,
  "is_archived": true,
  "related_type": "string",
  "related_id": 0,
  "created_at": "datetime"
}
```

### System

#### Health Check

```
GET /api/health
```

Returns the health status of the system.

**Response:**
```json
{
  "status": "healthy",
  "version": "string",
  "uptime": 0
}
```

## Error Responses

When an error occurs, the API will return an appropriate HTTP status code along with a JSON response containing error details:

```json
{
  "detail": "Error message"
}
```

Common error status codes:
- 400: Bad Request - The request was invalid
- 401: Unauthorized - Authentication is required or failed
- 403: Forbidden - The user doesn't have permission to perform the requested operation
- 404: Not Found - The requested resource was not found
- 422: Unprocessable Entity - Validation error
- 500: Internal Server Error - An unexpected error occurred on the server
