from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.db.supabase import supabase

router = APIRouter()

@router.get("/")
async def get_categories(user=Depends(get_current_user)):
    result = supabase.table("categories").select("*").execute()
    return result.data