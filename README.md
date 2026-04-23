# FreshTrack

A full-stack inventory management system built for restaurants and food service businesses. Track stock levels, monitor expiration dates, manage suppliers, and create purchase orders — all scoped per user account.

---

## Features

- **Inventory management** — Add, update, and soft-delete inventory items with quantity tracking
- **Stock status** — Automatically computed as `in_stock`, `low_stock`, or `out_of_stock` based on reorder thresholds
- **Expiry tracking** — Filter items expiring within 7 days
- **Supplier management** — Maintain supplier contact details and link them to inventory items
- **Purchase orders** — Create draft orders, send them, and mark as received (auto-updates inventory quantities)
- **Stock movement audit trail** — Every stock change is logged with reason and user
- **Per-user data isolation** — All data is scoped to the authenticated user's account
- **Authentication** — Supabase Auth with JWT verification on every API request

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python 3.12) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| HTTP Client | Axios (frontend), httpx (backend) |

---

## Project Structure

```
FreshTrack/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth.py          # JWT verification via Supabase JWKS
│   │   │   └── config.py        # Pydantic settings (reads from .env)
│   │   ├── db/
│   │   │   └── supabase.py      # Supabase service client
│   │   ├── models/
│   │   │   ├── inventory.py     # ItemCreate, ItemUpdate, StockAdjustment
│   │   │   ├── order.py         # OrderCreate, OrderStatusUpdate
│   │   │   └── supplier.py      # SupplierCreate, SupplierUpdate
│   │   ├── routers/
│   │   │   ├── inventory.py
│   │   │   ├── categories.py
│   │   │   ├── suppliers.py
│   │   │   └── orders.py
│   │   └── main.py              # FastAPI app, CORS, router registration
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   ├── signin/          # Sign in page
    │   │   └── signup/          # Sign up page
    │   └── (dashboard)/
    │       ├── layout.tsx       # Sidebar, auth guard
    │       ├── dashboard/       # Overview page
    │       ├── inventory/       # Inventory list, new item, item detail
    │       ├── suppliers/       # Supplier list and detail
    │       ├── orders/          # Purchase orders
    │       └── alerts/          # Low stock and expiring soon alerts
    ├── lib/
    │   ├── api.ts               # Axios instance with auth interceptor
    │   └── supabase.ts          # Supabase browser client
    └── components/ui/           # shadcn/ui components
```

---

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- A [Supabase](https://supabase.com) project with the following tables created (see Database Schema below)

---

## Database Schema

Create the following tables in your Supabase project under the **SQL Editor**:

```sql
-- Categories (shared across users)
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

-- Suppliers
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  lead_time_days int default 3,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Inventory items
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  sku text,
  unit text not null,
  quantity float default 0,
  reorder_threshold float default 0,
  cost_per_unit float default 0,
  expiry_date date,
  status text default 'in_stock',
  is_active boolean default true,
  category_id uuid references categories(id),
  supplier_id uuid references suppliers(id),
  created_at timestamptz default now()
);

-- Stock movements (audit trail)
create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references inventory_items(id),
  movement_type text not null,
  quantity_change float not null,
  reason text,
  performed_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Purchase orders
create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  supplier_id uuid references suppliers(id),
  notes text,
  total_cost float default 0,
  status text default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Purchase order items
create table purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references purchase_orders(id) on delete cascade,
  item_id uuid references inventory_items(id),
  quantity_ordered float not null,
  unit_cost float not null
);
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/priteshdube/RestaurantCRM.git
cd RestaurantCRM
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

> Find these in your Supabase dashboard under **Project Settings → API**.  
> Use the **service role** key (not the anon key) for the backend — it bypasses row-level security.

Start the backend:

```bash
uvicorn app.main:app --reload
```

API will be running at `http://localhost:8000`  
Interactive API docs available at `http://localhost:8000/docs`

---

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend/` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Use the **anon** key here (not the service role key) — this is safe to expose in the browser.

Start the frontend:

```bash
npm run dev
```

App will be running at `http://localhost:3000`

---

## API Endpoints

All endpoints require a valid Supabase JWT passed as `Authorization: Bearer <token>`.

### Inventory

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/inventory/` | List all items for the current user |
| `GET` | `/api/inventory/{id}` | Get a single item |
| `GET` | `/api/inventory/filter/low-stock` | Items below reorder threshold |
| `GET` | `/api/inventory/filter/expiring-soon` | Items expiring within 7 days |
| `POST` | `/api/inventory/` | Create a new item |
| `PATCH` | `/api/inventory/{id}` | Update an item |
| `POST` | `/api/inventory/{id}/adjust` | Adjust stock quantity |
| `GET` | `/api/inventory/{id}/movements` | Get stock movement history |
| `DELETE` | `/api/inventory/{id}` | Soft delete an item |

### Suppliers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suppliers/` | List all suppliers |
| `GET` | `/api/suppliers/{id}` | Get supplier with linked inventory items |
| `POST` | `/api/suppliers/` | Create a supplier |
| `PATCH` | `/api/suppliers/{id}` | Update a supplier |
| `DELETE` | `/api/suppliers/{id}` | Soft delete a supplier |

### Purchase Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders/` | List all orders |
| `GET` | `/api/orders/{id}` | Get order with line items |
| `POST` | `/api/orders/` | Create a new order |
| `PATCH` | `/api/orders/{id}/status` | Update order status (`draft` → `sent` → `received` → `cancelled`) |
| `DELETE` | `/api/orders/{id}` | Delete a draft or cancelled order |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories/` | List all categories |

---

## Deployment

### Backend — Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, select the `backend/` folder as the root
4. Set the following:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
6. Deploy — note the URL (e.g. `https://freshtrack-api.onrender.com`)

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select the repo, set **Root Directory** to `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` → set to your Render backend URL
4. Deploy

> After deploying the frontend, update the CORS `allow_origins` in `backend/app/main.py` to include your Vercel URL, then redeploy the backend.

---

## Author

**Pritesh Dube** — Senior Seminar Project, Spring 2026
