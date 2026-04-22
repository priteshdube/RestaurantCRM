from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class OrderItem(BaseModel):
    item_id: UUID
    quantity_ordered: float
    unit_cost: float

class OrderCreate(BaseModel):
    supplier_id: UUID
    notes: Optional[str] = None
    items: List[OrderItem]

class OrderStatusUpdate(BaseModel):
    status: str