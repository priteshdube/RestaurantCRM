from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.db.supabase import supabase
from app.models.inventory import ItemCreate, ItemUpdate, StockAdjustment

router = APIRouter()

def compute_status(quantity: float, threshold: float) -> str:
    if quantity <= 0:
        return "out_of_stock"
    elif quantity <= threshold:
        return "low_stock"
    return "in_stock"


# # --- GET all items ---
# @router.get("/")
# async def get_items(
#     category_id: str = None,
#     status: str = None,
#     user=Depends(get_current_user)
# ):
#     query = supabase.table("inventory_items").select(
#         "*, categories(name), suppliers(name)"
#     ).eq("is_active", True)

#     if category_id:
#         query = query.eq("category_id", category_id)
#     if status:
#         query = query.eq("status", status)

#     result = query.execute()
#     return result.data


# # --- GET single item ---
# @router.get("/{item_id}")
# async def get_item(item_id: str, user=Depends(get_current_user)):
#     result = supabase.table("inventory_items").select(
#         "*, categories(name), suppliers(name)"
#     ).eq("id", item_id).single().execute()

#     if not result.data:
#         raise HTTPException(status_code=404, detail="Item not found")
#     return result.data


# # --- GET low stock items ---
# @router.get("/filter/low-stock")
# async def get_low_stock(user=Depends(get_current_user)):
#     result = supabase.table("inventory_items").select(
#         "*, categories(name), suppliers(name)"
#     ).eq("status", "low_stock").eq("is_active", True).execute()
#     return result.data


# # --- GET expiring soon (within 7 days) ---
# @router.get("/filter/expiring-soon")
# async def get_expiring_soon(user=Depends(get_current_user)):
#     from datetime import date, timedelta
#     today = date.today().isoformat()
#     week_later = (date.today() + timedelta(days=7)).isoformat()

#     result = supabase.table("inventory_items").select(
#         "*, categories(name), suppliers(name)"
#     ).gte("expiry_date", today).lte("expiry_date", week_later).eq("is_active", True).execute()
#     return result.data


# # --- POST create item ---
# @router.post("/")
# async def create_item(item: ItemCreate, user=Depends(get_current_user)):
#     status = compute_status(item.quantity, item.reorder_threshold)
#     data = item.model_dump(mode="json")
#     data["status"] = status

#     result = supabase.table("inventory_items").insert(data).execute()
#     return result.data[0]


# # --- PATCH update item ---
# @router.patch("/{item_id}")
# async def update_item(
#     item_id: str,
#     item: ItemUpdate,
#     user=Depends(get_current_user)
# ):
#     data = {k: v for k, v in item.model_dump(mode="json").items() if v is not None}
#     if not data:
#         raise HTTPException(status_code=400, detail="No fields to update")

#     result = supabase.table("inventory_items").update(data).eq("id", item_id).execute()
#     return result.data[0]


# # --- POST adjust stock ---
# @router.post("/{item_id}/adjust")
# async def adjust_stock(
#     item_id: str,
#     adjustment: StockAdjustment,
#     user=Depends(get_current_user)
# ):
#     # 1. Fetch current item
#     item_result = supabase.table("inventory_items").select(
#         "quantity, reorder_threshold"
#     ).eq("id", item_id).single().execute()

#     if not item_result.data:
#         raise HTTPException(status_code=404, detail="Item not found")

#     current_qty = item_result.data["quantity"]
#     threshold = item_result.data["reorder_threshold"]
#     new_qty = current_qty + adjustment.quantity_change

#     if new_qty < 0:
#         raise HTTPException(status_code=400, detail="Stock cannot go below zero")

#     # 2. Insert stock movement row
#     supabase.table("stock_movements").insert({
#         "item_id": item_id,
#         "movement_type": adjustment.movement_type,
#         "quantity_change": adjustment.quantity_change,
#         "reason": adjustment.reason,
#         "performed_by": user["user_id"]
#     }).execute()

#     # 3. Update item quantity + status
#     new_status = compute_status(new_qty, threshold)
#     supabase.table("inventory_items").update({
#         "quantity": new_qty,
#         "status": new_status
#     }).eq("id", item_id).execute()

#     return {"item_id": item_id, "new_quantity": new_qty, "status": new_status}


# # --- GET stock movement history ---
# @router.get("/{item_id}/movements")
# async def get_movements(item_id: str, user=Depends(get_current_user)):
#     result = supabase.table("stock_movements").select("*").eq(
#         "item_id", item_id
#     ).order("created_at", desc=True).execute()
#     return result.data


# # --- DELETE soft delete item ---
# @router.delete("/{item_id}")
# async def delete_item(item_id: str, user=Depends(get_current_user)):
#     supabase.table("inventory_items").update(
#         {"is_active": False}
#     ).eq("id", item_id).execute()
#     return {"message": "Item deleted"}


# GET all items — filter by user
@router.get("/")
async def get_items(
    category_id: str = None,
    status: str = None,
    user=Depends(get_current_user)
):
    query = supabase.table("inventory_items").select(
        "*, categories(name), suppliers(name)"
    ).eq("is_active", True).eq("user_id", user["user_id"])

    if category_id:
        query = query.eq("category_id", category_id)
    if status:
        query = query.eq("status", status)

    result = query.execute()
    return result.data

# GET single item — make sure it belongs to user
@router.get("/{item_id}")
async def get_item(item_id: str, user=Depends(get_current_user)):
    result = supabase.table("inventory_items").select(
        "*, categories(name), suppliers(name)"
    ).eq("id", item_id).eq("user_id", user["user_id"]).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return result.data

# GET low stock — filter by user
@router.get("/filter/low-stock")
async def get_low_stock(user=Depends(get_current_user)):
    result = supabase.table("inventory_items").select(
        "*, categories(name), suppliers(name)"
    ).eq("status", "low_stock").eq("is_active", True).eq("user_id", user["user_id"]).execute()
    return result.data

# GET expiring soon — filter by user
@router.get("/filter/expiring-soon")
async def get_expiring_soon(user=Depends(get_current_user)):
    from datetime import date, timedelta
    today = date.today().isoformat()
    week_later = (date.today() + timedelta(days=7)).isoformat()

    result = supabase.table("inventory_items").select(
        "*, categories(name), suppliers(name)"
    ).gte("expiry_date", today).lte("expiry_date", week_later).eq(
        "is_active", True
    ).eq("user_id", user["user_id"]).execute()
    return result.data

# POST create item — save user_id
@router.post("/")
async def create_item(item: ItemCreate, user=Depends(get_current_user)):
    status = compute_status(item.quantity, item.reorder_threshold)
    data = item.model_dump(mode="json")
    data["status"] = status
    data["user_id"] = user["user_id"]

    result = supabase.table("inventory_items").insert(data).execute()
    return result.data[0]

# PATCH update — verify ownership
@router.patch("/{item_id}")
async def update_item(
    item_id: str,
    item: ItemUpdate,
    user=Depends(get_current_user)
):
    data = {k: v for k, v in item.model_dump(mode="json").items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = supabase.table("inventory_items").update(data).eq(
        "id", item_id
    ).eq("user_id", user["user_id"]).execute()
    return result.data[0]

# POST adjust stock — verify ownership
@router.post("/{item_id}/adjust")
async def adjust_stock(
    item_id: str,
    adjustment: StockAdjustment,
    user=Depends(get_current_user)
):
    item_result = supabase.table("inventory_items").select(
        "quantity, reorder_threshold"
    ).eq("id", item_id).eq("user_id", user["user_id"]).single().execute()

    if not item_result.data:
        raise HTTPException(status_code=404, detail="Item not found")

    current_qty = item_result.data["quantity"]
    threshold = item_result.data["reorder_threshold"]
    new_qty = current_qty + adjustment.quantity_change

    if new_qty < 0:
        raise HTTPException(status_code=400, detail="Stock cannot go below zero")

    supabase.table("stock_movements").insert({
        "item_id": item_id,
        "movement_type": adjustment.movement_type,
        "quantity_change": adjustment.quantity_change,
        "reason": adjustment.reason,
        "performed_by": user["user_id"]
    }).execute()

    new_status = compute_status(new_qty, threshold)
    supabase.table("inventory_items").update({
        "quantity": new_qty,
        "status": new_status
    }).eq("id", item_id).eq("user_id", user["user_id"]).execute()

    return {"item_id": item_id, "new_quantity": new_qty, "status": new_status}

# GET movements — verify item ownership first
@router.get("/{item_id}/movements")
async def get_movements(item_id: str, user=Depends(get_current_user)):
    item = supabase.table("inventory_items").select("id").eq(
        "id", item_id
    ).eq("user_id", user["user_id"]).single().execute()

    if not item.data:
        raise HTTPException(status_code=404, detail="Item not found")

    result = supabase.table("stock_movements").select("*").eq(
        "item_id", item_id
    ).order("created_at", desc=True).execute()
    return result.data

# DELETE — verify ownership
@router.delete("/{item_id}")
async def delete_item(item_id: str, user=Depends(get_current_user)):
    supabase.table("inventory_items").update(
        {"is_active": False}
    ).eq("id", item_id).eq("user_id", user["user_id"]).execute()
    return {"message": "Item deleted"}