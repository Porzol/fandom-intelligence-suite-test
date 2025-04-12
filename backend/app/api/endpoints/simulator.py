from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

from app.db.base import get_db

router = APIRouter()

@router.post("/start", response_model=Dict[str, Any])
async def start_simulation(
    simulation_data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Start a new chatter simulation session
    """
    simulation_id = str(uuid.uuid4())
    
    # In a real implementation, we would create a simulation session in the database
    # For now, return a placeholder response
    return {
        "simulation_id": simulation_id,
        "status": "started",
        "fan_profile": {
            "name": simulation_data.get("fan_name", "Simulated Fan"),
            "spending_level": simulation_data.get("spending_level", "medium"),
            "personality": simulation_data.get("personality", "friendly"),
            "interests": simulation_data.get("interests", ["travel", "fitness"])
        },
        "scenario": simulation_data.get("scenario", "general conversation"),
        "start_time": datetime.now().isoformat()
    }

@router.post("/message/{simulation_id}", response_model=Dict[str, Any])
async def send_simulation_message(
    simulation_id: str,
    message_data: Dict[str, str] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message in an active simulation
    """
    # In a real implementation, we would process the message and generate a response
    # For now, return a placeholder response
    import random
    
    responses = [
        "Hey! That's so cool! 😊",
        "I'd love to hear more about that!",
        "Hmm, interesting! Tell me more?",
        "That sounds amazing! What else?",
        "I've been thinking about you today 💕",
        "Would you like to see some exclusive content? 😉"
    ]
    
    return {
        "simulation_id": simulation_id,
        "response": random.choice(responses),
        "metrics": {
            "engagement_score": random.uniform(0.5, 1.0),
            "conversion_potential": random.uniform(0.2, 0.8),
            "sentiment": random.choice(["positive", "neutral", "flirty"])
        },
        "coaching_tips": [
            "Try asking a follow-up question",
            "This would be a good time to offer exclusive content",
            "Use more emojis to increase engagement"
        ]
    }

@router.get("/end/{simulation_id}", response_model=Dict[str, Any])
async def end_simulation(
    simulation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    End a simulation and get final results
    """
    # In a real implementation, we would calculate final metrics and store results
    # For now, return a placeholder response
    import random
    
    return {
        "simulation_id": simulation_id,
        "status": "completed",
        "duration_minutes": random.randint(5, 30),
        "final_score": random.uniform(60, 95),
        "metrics": {
            "engagement_rate": random.uniform(0.6, 0.9),
            "response_quality": random.uniform(0.5, 1.0),
            "conversion_opportunities": random.randint(1, 5),
            "conversion_success": random.randint(0, 3)
        },
        "feedback": [
            "Good use of personal questions",
            "Could improve timing of premium content offers",
            "Excellent response time and engagement"
        ]
    }
