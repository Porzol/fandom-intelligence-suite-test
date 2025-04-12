import pandas as pd
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime

class XLSXParser:
    """
    Parser for Excel files containing chat logs
    """
    
    @staticmethod
    def parse_file(file_path: str) -> List[Dict[str, Any]]:
        """
        Parse an Excel file and extract structured data
        """
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Ensure required columns exist
            required_columns = ['fan_name', 'chatter_name', 'creator_name', 'sent_time', 'message_type', 'content']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
            
            # Clean and transform data
            df = XLSXParser._clean_dataframe(df)
            
            # Convert to list of dictionaries
            records = df.to_dict('records')
            
            return records
        
        except Exception as e:
            print(f"Error parsing Excel file: {e}")
            return []
    
    @staticmethod
    def _clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and transform the DataFrame
        """
        # Convert column names to lowercase and strip whitespace
        df.columns = [col.lower().strip() for col in df.columns]
        
        # Handle date/time columns
        if 'sent_time' in df.columns:
            df['sent_time'] = pd.to_datetime(df['sent_time'], errors='coerce')
        
        # Fill missing values
        df['message_type'] = df['message_type'].fillna('text')
        df['price'] = df['price'].fillna(0.0)
        df['purchased'] = df['purchased'].fillna(False)
        
        # Convert boolean columns
        if 'purchased' in df.columns:
            df['purchased'] = df['purchased'].astype(bool)
        
        # Convert numeric columns
        if 'price' in df.columns:
            df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0.0)
        
        return df
    
    @staticmethod
    def generate_deduplication_key(record: Dict[str, Any]) -> str:
        """
        Generate a deduplication key for a record
        
        The key is based on: Sender + Sent Time + Fan Name
        """
        sender = record.get('chatter_name', '')
        sent_time = record.get('sent_time', '')
        fan_name = record.get('fan_name', '')
        
        if isinstance(sent_time, datetime):
            sent_time = sent_time.isoformat()
        
        key = f"{sender}|{sent_time}|{fan_name}"
        return hashlib.md5(key.encode()).hexdigest()
    
    @staticmethod
    def deduplicate_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicate records based on the deduplication key
        """
        unique_records = {}
        
        for record in records:
            key = XLSXParser.generate_deduplication_key(record)
            if key not in unique_records:
                unique_records[key] = record
        
        return list(unique_records.values())
