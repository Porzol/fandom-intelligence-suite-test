from fastapi import APIRouter

from app.api.endpoints import auth, users, ingest, dashboard, testing, simulator, insights, notifications

api_router = APIRouter()

# Include all API routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["ingestion"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(testing.router, prefix="/test", tags=["testing"])
api_router.include_router(simulator.router, prefix="/simulate", tags=["simulator"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
