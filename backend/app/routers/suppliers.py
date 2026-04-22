from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.db.supabase import supabase
from app.models.supplier import SupplierCreate, SupplierUpdate

router = APIRouter()

@router.get("/")
async def get_suppliers(user=Depends(get_current_user)):
    result = supabase.table("suppliers").select("*").eq("is_active", True).execute()
    return result.data

@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str, user=Depends(get_current_user)):
    supplier_result = supabase.table("suppliers").select("*").eq("id", supplier_id).single().execute()

    if not supplier_result.data:
        raise HTTPException(status_code=404, detail="Supplier not found")

    items_result = supabase.table("inventory_items").select(
        "id, name, quantity, unit, status"
    ).eq("supplier_id", supplier_id).eq("is_active", True).execute()

    supplier = supplier_result.data
    supplier["inventory_items"] = items_result.data or []

    return supplier

@router.post("/")
async def create_supplier(supplier: SupplierCreate, user=Depends(get_current_user)):
    result = supabase.table("suppliers").insert(supplier.model_dump()).execute()
    return result.data[0]

@router.patch("/{supplier_id}")
async def update_supplier(supplier_id: str, supplier:SupplierUpdate, user=Depends(get_current_user)):
    exist = supabase.table("suppliers").select("*").eq("id", supplier_id).single().execute()

    if not exist.data:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    result = supabase.table("suppliers").update(supplier.model_dump(exclude_unset=True)).eq("id", supplier_id).execute()
    return result.data[0]

@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, user = Depends(get_current_user)):
    exist = supabase.table("suppliers").select("*").eq("id", supplier_id).single().execute()

    if not exist.data:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supabase.table("suppliers").update({"is_active": False}).eq("id", supplier_id).execute()
    return {"detail": "Supplier deleted successfully"}

