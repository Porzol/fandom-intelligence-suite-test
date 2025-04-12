from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd
from datetime import datetime
import hashlib
import tempfile
import os

from app.db.base import get_db
from app.schemas.upload import Upload, UploadCreate
from app.schemas.message import Message, MessageCreate
from app.utils.xlsx_parser import XLSXParser
from app.tasks.drive_sync import check_drive_for_new_files

router = APIRouter()

@router.post("/drive-check", response_model=Dict[str, Any])
async def check_google_drive(background_tasks: BackgroundTasks):
    """
    Check Google Drive for new .xlsx files and process them
    """
    # Schedule the Celery task to check Google Drive
    task = check_drive_for_new_files.delay()
    
    return {
        "status": "scheduled", 
        "message": "Drive check scheduled",
        "task_id": task.id
    }

@router.post("/manual", response_model=Dict[str, Any])
async def manual_upload(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Allow manual upload of .xlsx files
    """
    # Validate file is an Excel file
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .xlsx files are supported"
        )
    
    # Read file content
    contents = await file.read()
    
    # Generate file hash
    file_hash = hashlib.md5(contents).hexdigest()
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as temp_file:
        temp_path = temp_file.name
        temp_file.write(contents)
    
    try:
        # Process Excel file using the XLSX parser
        records = XLSXParser.parse_file(temp_path)
        
        # Deduplicate records
        unique_records = XLSXParser.deduplicate_records(records)
        
        # In a real implementation, we would:
        # 1. Create an Upload record in the database
        # 2. Process each record and create Message records
        # 3. Update Fan, Chatter, and Creator records as needed
        
        return {
            "status": "success",
            "file_name": file.filename,
            "file_hash": file_hash,
            "records_count": len(unique_records),
            "processed": True
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
