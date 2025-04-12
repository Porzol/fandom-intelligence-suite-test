from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

from app.db.base import get_db

router = APIRouter()

# In-memory storage for test results
test_results = {}

@router.post("/start", response_model=Dict[str, Any])
async def start_test(
    test_data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Start a new A/B test
    """
    test_id = str(uuid.uuid4())
    
    # Store test configuration
    test_results[test_id] = {
        "id": test_id,
        "name": test_data.get("name", f"Test {test_id[:8]}"),
        "variant_a": test_data.get("variant_a", {}),
        "variant_b": test_data.get("variant_b", {}),
        "start_date": datetime.now(),
        "end_date": None,
        "status": "running",
        "metrics": {
            "variant_a": {
                "impressions": 0,
                "conversions": 0,
                "revenue": 0.0
            },
            "variant_b": {
                "impressions": 0,
                "conversions": 0,
                "revenue": 0.0
            }
        }
    }
    
    return {"test_id": test_id, "status": "started"}

@router.get("/results/{test_id}", response_model=Dict[str, Any])
async def get_test_results(
    test_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get results for a specific test
    """
    if test_id not in test_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # In a real implementation, we would calculate metrics from the database
    # For now, return the stored test with some simulated metrics
    test = test_results[test_id]
    
    # Simulate some metrics if the test is running
    if test["status"] == "running":
        import random
        
        test["metrics"]["variant_a"]["impressions"] += random.randint(5, 20)
        test["metrics"]["variant_a"]["conversions"] += random.randint(0, 3)
        test["metrics"]["variant_a"]["revenue"] += random.uniform(0, 10)
        
        test["metrics"]["variant_b"]["impressions"] += random.randint(5, 20)
        test["metrics"]["variant_b"]["conversions"] += random.randint(0, 4)
        test["metrics"]["variant_b"]["revenue"] += random.uniform(0, 12)
    
    return test
