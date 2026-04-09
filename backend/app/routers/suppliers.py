from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.db.supabase import supabase

router = APIRouter()

@router.get("/")
async def get_suppliers(user=Depends(get_current_user)):
    result = supabase.table("suppliers").select("*").eq("is_active", True).execute()
    return result.data