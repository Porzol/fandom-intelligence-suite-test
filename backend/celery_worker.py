from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.task_routes = {
    "app.tasks.drive_sync.*": {"queue": "drive-sync"},
    "app.tasks.ai_insights.*": {"queue": "ai-insights"}
}

celery_app.conf.imports = [
    "app.tasks.drive_sync",
    "app.tasks.ai_insights"
]
