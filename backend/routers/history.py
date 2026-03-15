from fastapi import APIRouter
from ..services.history_service import history_service

router = APIRouter()

@router.get("/api/history")
def get_history(limit: int = 50):
    """
    Returns the recent session history of queries and responses.
    """
    return history_service.get_history(limit=limit)

