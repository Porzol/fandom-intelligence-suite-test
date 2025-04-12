from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
import os
import hashlib
from datetime import datetime
import pandas as pd
from typing import List, Dict, Any, Optional

from app.core.config import settings

class DriveService:
    """
    Service for interacting with Google Drive API
    """
    
    def __init__(self, credentials_file: str = None):
        """
        Initialize the Drive service with credentials
        """
        self.credentials_file = credentials_file or settings.GOOGLE_DRIVE_CREDENTIALS_FILE
        self.folder_id = settings.GOOGLE_DRIVE_FOLDER_ID
        self.service = None
    
    def authenticate(self):
        """
        Authenticate with Google Drive API
        """
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_file,
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            self.service = build('drive', 'v3', credentials=credentials)
            return True
        except Exception as e:
            print(f"Authentication error: {e}")
            return False
    
    def list_files(self, file_type: str = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') -> List[Dict[str, Any]]:
        """
        List all Excel files in the specified folder
        """
        if not self.service:
            if not self.authenticate():
                return []
        
        try:
            query = f"'{self.folder_id}' in parents and mimeType='{file_type}' and trashed=false"
            results = self.service.files().list(
                q=query,
                fields="files(id, name, createdTime, modifiedTime, md5Checksum)"
            ).execute()
            
            return results.get('files', [])
        except Exception as e:
            print(f"Error listing files: {e}")
            return []
    
    def download_file(self, file_id: str, output_path: str) -> bool:
        """
        Download a file from Google Drive
        """
        if not self.service:
            if not self.authenticate():
                return False
        
        try:
            request = self.service.files().get_media(fileId=file_id)
            
            with io.FileIO(output_path, 'wb') as fh:
                downloader = MediaIoBaseDownload(fh, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
            
            return True
        except Exception as e:
            print(f"Error downloading file: {e}")
            return False
    
    def process_excel_file(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Process an Excel file and extract data
        """
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Convert DataFrame to list of dictionaries
            records = df.to_dict('records')
            
            return records
        except Exception as e:
            print(f"Error processing Excel file: {e}")
            return []
    
    def get_file_hash(self, file_path: str) -> str:
        """
        Calculate MD5 hash of a file
        """
        try:
            with open(file_path, 'rb') as f:
                file_hash = hashlib.md5()
                chunk = f.read(8192)
                while chunk:
                    file_hash.update(chunk)
                    chunk = f.read(8192)
            return file_hash.hexdigest()
        except Exception as e:
            print(f"Error calculating file hash: {e}")
            return ""
    
    def check_for_new_files(self, processed_files: List[str]) -> List[Dict[str, Any]]:
        """
        Check for new files in Google Drive that haven't been processed yet
        """
        files = self.list_files()
        new_files = []
        
        for file in files:
            if file.get('id') not in processed_files:
                new_files.append(file)
        
        return new_files
