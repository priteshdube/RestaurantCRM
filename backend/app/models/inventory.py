from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class ItemCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category_id: Optional[UUID] = None
    supplier_id: Optional[UUID] = None
    unit: str
    quantity: float = 0
    reorder_threshold: float = 0
    cost_per_unit: float = 0
    expiry_date: Optional[date] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[UUID] = None
    supplier_id: Optional[UUID] = None
    unit: Optional[str] = None
    reorder_threshold: Optional[float] = None
    cost_per_unit: Optional[float] = None
    expiry_date: Optional[date] = None

class StockAdjustment(BaseModel):
    movement_type: str   # 'received' | 'adjusted' | 'wasted' | 'used'
    quantity_change: float
    reason: Optional[str] = None