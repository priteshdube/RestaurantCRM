# 🥬 FreshTrack

A full-stack inventory and freshness management system for restaurants and food service businesses. Track stock levels, monitor expiration dates, manage suppliers, and maintain a complete audit trail of all stock movements.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + shadcn/ui |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase JWT + FastAPI Middleware |

---

## 📁 Project Structure

```
freshtrack/
├── backend/
│   ├── core/        # Config, dependencies
│   ├── db/          # Supabase client
│   ├── models/      # Pydantic schemas
│   └── routers/     # API route handlers
└── frontend/
    └── app/         # Next.js App Router pages & components
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Supabase project (get one at [supabase.com](https://supabase.com))

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Start the server:

```bash
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory/` | List all inventory items |
| `GET` | `/api/inventory/{id}` | Get a single item |
| `GET` | `/api/inventory/filter/low-stock` | Filter low-stock items |
| `GET` | `/api/inventory/filter/expiring-soon` | Filter items expiring soon |
| `POST` | `/api/inventory/` | Create a new item |
| `PATCH` | `/api/inventory/{id}` | Update an item |
| `POST` | `/api/inventory/{id}/adjust` | Adjust stock (auto-recalculates status) |
| `GET` | `/api/inventory/{id}/movements` | Get stock movement history |
| `DELETE` | `/api/inventory/{id}` | Soft delete an item |

---

## 🗄 Database Schema

- **inventory_items** — Core inventory records with status enum and soft delete
- **categories** — Item categories (seeded with defaults)
- **suppliers** — Supplier information
- **stock_movements** — Full audit trail of every stock change

---

## ⚠️ AI & Open Source Acknowledgment

This project makes use of the following open-source tools and libraries:
- [Next.js](https://nextjs.org/) (MIT) · [FastAPI](https://fastapi.tiangolo.com/) (MIT) · [Supabase](https://supabase.com/) (Apache 2.0) · [shadcn/ui](https://ui.shadcn.com/) (MIT)



---

## 👤 Author

**Pritesh Dube** — Senior Seminar Project, Spring 2026
