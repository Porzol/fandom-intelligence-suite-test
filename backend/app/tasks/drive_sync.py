from celery import Celery
from celery.schedules import crontab
import os
import tempfile
from datetime import datetime
from typing import List, Dict, Any

from app.core.config import settings
from app.services.drive_service import DriveService
from app.utils.xlsx_parser import XLSXParser

# Initialize Celery
celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

# Configure Celery
celery_app.conf.task_routes = {
    "app.tasks.drive_sync.*": {"queue": "drive-sync"},
    "app.tasks.ai_insights.*": {"queue": "ai-insights"}
}

# Configure periodic tasks
celery_app.conf.beat_schedule = {
    "check-google-drive": {
        "task": "app.tasks.drive_sync.check_drive_for_new_files",
        "schedule": crontab(minute=f"*/{settings.GOOGLE_DRIVE_CHECK_INTERVAL_MINUTES}")
    }
}

@celery_app.task(name="app.tasks.drive_sync.check_drive_for_new_files")
def check_drive_for_new_files():
    """
    Celery task to check Google Drive for new files
    """
    from app.db.session import get_db
    from app.models.upload import Upload
    
    # Get list of already processed files
    processed_files = []
    # In a real implementation, we would query the database for processed files
    
    # Initialize Drive service
    drive_service = DriveService()
    
    # Check for new files
    new_files = drive_service.check_for_new_files(processed_files)
    
    # Process each new file
    for file in new_files:
        process_drive_file.delay(file['id'], file['name'], file.get('md5Checksum', ''))
    
    return {"status": "success", "new_files_count": len(new_files)}

@celery_app.task(name="app.tasks.drive_sync.process_drive_file")
def process_drive_file(file_id: str, file_name: str, file_hash: str):
    """
    Celery task to process a single Google Drive file
    """
    # Initialize Drive service
    drive_service = DriveService()
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as temp_file:
        temp_path = temp_file.name
    
    try:
        # Download file
        success = drive_service.download_file(file_id, temp_path)
        if not success:
            return {"status": "error", "message": "Failed to download file"}
        
        # Verify file hash
        calculated_hash = drive_service.get_file_hash(temp_path)
        if file_hash and calculated_hash != file_hash:
            return {"status": "error", "message": "File hash mismatch"}
        
        # Process Excel file using the XLSX parser
        records = XLSXParser.parse_file(temp_path)
        
        # Deduplicate records
        unique_records = XLSXParser.deduplicate_records(records)
        
        # In a real implementation, we would:
        # 1. Create an Upload record in the database
        # 2. Process each record and create Message records
        # 3. Update Fan, Chatter, and Creator records as needed
        # 4. Mark the Upload as processed
        
        return {
            "status": "success", 
            "file_name": file_name, 
            "records_count": len(unique_records)
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
