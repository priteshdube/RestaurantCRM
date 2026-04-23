from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.db.supabase import supabase
from app.models.order import OrderCreate, OrderStatusUpdate

router = APIRouter()

# @router.get("/")
# async def get_orders(user=Depends(get_current_user)):
#     result = supabase.table("purchase_orders").select(
#         "*, suppliers(name)"
#     ).order("created_at", desc=True).execute()
#     return result.data

@router.get("/")
async def get_orders(user=Depends(get_current_user)):
    result = supabase.table("purchase_orders").select(
        "*, suppliers(name)"
    ).eq("user_id", user["user_id"]).order("created_at", desc=True).execute()
    return result.data


@router.get("/{order_id}")
async def get_order(order_id: str, user=Depends(get_current_user)):
    result = supabase.table("purchase_orders").select(
        "*, suppliers(name), purchase_order_items(*, inventory_items(name, unit))"
    ).eq("id", order_id).eq("user_id", user["user_id"]).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return result.data

# @router.post("/")
# async def create_order(order: OrderCreate, user=Depends(get_current_user)):
#     total_cost = sum(i.quantity_ordered * i.unit_cost for i in order.items)

#     order_result = supabase.table("purchase_orders").insert({
#         "supplier_id": str(order.supplier_id),
#         "notes": order.notes,
#         "total_cost": total_cost,
#         "created_by": user["user_id"],
#         "status": "draft"
#     }).execute()

#     order_id = order_result.data[0]["id"]

#     order_items = [
#         {
#             "order_id": order_id,
#             "item_id": str(i.item_id),
#             "quantity_ordered": i.quantity_ordered,
#             "unit_cost": i.unit_cost,
#         }
#         for i in order.items
#     ]
#     supabase.table("purchase_order_items").insert(order_items).execute()

#     return order_result.data[0]

@router.post("/")
async def create_order(order: OrderCreate, user=Depends(get_current_user)):
    total_cost = sum(i.quantity_ordered * i.unit_cost for i in order.items)

    order_result = supabase.table("purchase_orders").insert({
        "supplier_id": str(order.supplier_id),
        "notes": order.notes,
        "total_cost": total_cost,
        "created_by": user["user_id"],
        "user_id": user["user_id"],
        "status": "draft"
    }).execute()

    order_id = order_result.data[0]["id"]
    order_items = [
        {
            "order_id": order_id,
            "item_id": str(i.item_id),
            "quantity_ordered": i.quantity_ordered,
            "unit_cost": i.unit_cost,
        }
        for i in order.items
    ]
    supabase.table("purchase_order_items").insert(order_items).execute()
    return order_result.data[0]

@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    body: OrderStatusUpdate,
    user=Depends(get_current_user)
):
    valid = ["draft", "sent", "received", "cancelled"]
    if body.status not in valid:
        raise HTTPException(status_code=400, detail="Invalid status")

    # If marking as received, update inventory quantities
    if body.status == "received":
        order = supabase.table("purchase_orders").select(
            "status"
        ).eq("id", order_id).eq("user_id", user["user_id"]).single().execute()

        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found")

        if order.data["status"] == "received":
            raise HTTPException(
                status_code=400, detail="Order already received"
            )

        items = supabase.table("purchase_order_items").select(
            "item_id, quantity_ordered"
        ).eq("order_id", order_id).execute()

        for oi in items.data:
            current = supabase.table("inventory_items").select(
                "quantity, reorder_threshold"
            ).eq("id", oi["item_id"]).single().execute()

            new_qty = current.data["quantity"] + oi["quantity_ordered"]
            threshold = current.data["reorder_threshold"]
            new_status = (
                "out_of_stock" if new_qty <= 0
                else "low_stock" if new_qty <= threshold
                else "in_stock"
            )

            supabase.table("inventory_items").update({
                "quantity": new_qty,
                "status": new_status
            }).eq("id", oi["item_id"]).execute()

            supabase.table("stock_movements").insert({
                "item_id": oi["item_id"],
                "movement_type": "received",
                "quantity_change": oi["quantity_ordered"],
                "reason": f"Purchase order {order_id}",
                "performed_by": user["user_id"]
            }).execute()

    supabase.table("purchase_orders").update(
        {"status": body.status}
    ).eq("id", order_id).eq("user_id", user["user_id"]).execute()

    return {"message": f"Order marked as {body.status}"}

@router.delete("/{order_id}")
async def delete_order(order_id: str, user=Depends(get_current_user)):
    order = supabase.table("purchase_orders").select(
        "status"
    ).eq("id", order_id).eq("user_id", user["user_id"]).single().execute()

    if not order.data:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.data["status"] not in ["draft", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail="Only draft or cancelled orders can be deleted"
        )

    supabase.table("purchase_orders").delete().eq("id", order_id).eq("user_id", user["user_id"]).execute()
    return {"message": "Order deleted"}