from fastapi import FastAPI
from dotenv import load_dotenv
import os
from supabase import create_client, Client


load_dotenv()


app = FastAPI()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

@app.get("/")
def home():
    return {"status": "Connected to Supabase!"}

@app.get("/inventory")
def get_inventory():
    response = supabase.table("inventory").select("*").execute()
    return response.data