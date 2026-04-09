from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import inventory, categories, suppliers
from app.core.auth import get_current_user


app = FastAPI(title="FreshTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚠️ DEV ONLY — remove this before production
async def override_auth():
    return {"user_id": "test-user"}

app.dependency_overrides[get_current_user] = override_auth

app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["suppliers"])

@app.get("/health")
def health():
    return {"status": "ok"}

