from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Depends, Response
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os, logging, uuid, io, csv
import bcrypt
import jwt

# --- Config ---
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret')
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@shraddha.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# CORS
frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://shraddha-recent-bp3e6m6t2-hingepratik8-4340s-projects.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- Auth Helpers ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Pydantic Models ---
class LoginRequest(BaseModel):
    email: str
    password: str

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    category_id: str = ""
    subcategory_id: str = ""
    is_featured: bool = False
    availability: str = "in_stock"
    specifications: List[dict] = []
    colour_variants: List[dict] = []

class CategoryCreate(BaseModel):
    name: str
    subcategories: List[dict] = []

class QueryCreate(BaseModel):
    customer_name: str
    email: str
    phone: str
    products: List[dict] = []
    message: str = ""
    type: str = "single"

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str
    message: str

class SettingsUpdate(BaseModel):
    whatsapp_number: str = ""
    phone_number: str = ""
    email: str = ""
    company_name: str = ""
    address: str = ""
    tagline: str = ""
    social_links: dict = {}
    google_maps_url: str = ""


# ==================== AUTH ROUTES ====================
@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    admin = await db.admins.find_one({"email": req.email.lower()}, {"_id": 0})
    if not admin or not verify_password(req.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(admin["id"], admin["email"])
    response.set_cookie(
        key="access_token", value=token,
        httponly=True, secure=False, samesite="lax",
        max_age=86400, path="/"
    )
    return {"id": admin["id"], "email": admin["email"], "name": admin.get("name", "Admin")}

@api_router.get("/auth/me")
async def get_me(admin=Depends(get_current_admin)):
    return {"id": admin["id"], "email": admin["email"], "name": admin.get("name", "Admin")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


# ==================== PRODUCT ROUTES ====================
@api_router.get("/products")
async def list_products(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    page: int = 1,
    limit: int = 12
):
    query = {}
    if category:
        query["category_id"] = category
    if subcategory:
        query["subcategory_id"] = subcategory
    if featured is not None:
        query["is_featured"] = featured
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"products": products, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.products.update_one({"id": product_id}, {"$inc": {"views_count": 1}})
    product["views_count"] = product.get("views_count", 0) + 1
    # Get category and subcategory names
    if product.get("category_id"):
        cat = await db.categories.find_one({"id": product["category_id"]}, {"_id": 0})
        if cat:
            product["category_name"] = cat["name"]
            for sub in cat.get("subcategories", []):
                if sub.get("id") == product.get("subcategory_id"):
                    product["subcategory_name"] = sub["name"]
                    break
    # Related products
    related = await db.products.find(
        {"category_id": product.get("category_id"), "id": {"$ne": product_id}},
        {"_id": 0}
    ).limit(4).to_list(4)
    product["related_products"] = related
    return product

@api_router.post("/products")
async def create_product(product: ProductCreate, admin=Depends(get_current_admin)):
    doc = product.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = doc["name"].lower().replace(" ", "-").replace("/", "-")
    doc["views_count"] = 0
    doc["queries_count"] = 0
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    created = await db.products.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate, admin=Depends(get_current_admin)):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = product.model_dump()
    update_data["slug"] = update_data["name"].lower().replace(" ", "-").replace("/", "-")
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


# ==================== CATEGORY ROUTES ====================
@api_router.get("/categories")
async def list_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    # Add product count per category
    for cat in categories:
        cat["product_count"] = await db.products.count_documents({"category_id": cat["id"]})
    return categories

@api_router.post("/categories")
async def create_category(category: CategoryCreate, admin=Depends(get_current_admin)):
    doc = category.model_dump()
    doc["id"] = str(uuid.uuid4())
    for sub in doc["subcategories"]:
        if "id" not in sub:
            sub["id"] = str(uuid.uuid4())
    await db.categories.insert_one(doc)
    created = await db.categories.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.put("/categories/{category_id}")
async def update_category(category_id: str, category: CategoryCreate, admin=Depends(get_current_admin)):
    existing = await db.categories.find_one({"id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    update_data = category.model_dump()
    for sub in update_data["subcategories"]:
        if "id" not in sub:
            sub["id"] = str(uuid.uuid4())
    await db.categories.update_one({"id": category_id}, {"$set": update_data})
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    return updated

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, admin=Depends(get_current_admin)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}


# ==================== QUERY ROUTES ====================
@api_router.post("/queries")
async def create_query(query_data: QueryCreate):
    doc = query_data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["is_read"] = False
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.queries.insert_one(doc)
    for p in doc.get("products", []):
        await db.products.update_one(
            {"name": p.get("product_name")},
            {"$inc": {"queries_count": 1}}
        )
    logger.info(f"[EMAIL MOCK] Query from {doc['customer_name']} for {len(doc.get('products', []))} product(s)")
    created = await db.queries.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.get("/queries")
async def list_queries(
    admin=Depends(get_current_admin),
    is_read: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    query = {}
    if is_read is not None:
        query["is_read"] = is_read
    if search:
        query["$or"] = [
            {"customer_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    skip = (page - 1) * limit
    total = await db.queries.count_documents(query)
    queries = await db.queries.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"queries": queries, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

@api_router.put("/queries/{query_id}/read")
async def toggle_query_read(query_id: str, admin=Depends(get_current_admin)):
    existing = await db.queries.find_one({"id": query_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Query not found")
    new_status = not existing.get("is_read", False)
    await db.queries.update_one({"id": query_id}, {"$set": {"is_read": new_status}})
    return {"is_read": new_status}

@api_router.delete("/queries/{query_id}")
async def delete_query(query_id: str, admin=Depends(get_current_admin)):
    result = await db.queries.delete_one({"id": query_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Query not found")
    return {"message": "Query deleted"}

@api_router.get("/queries/export")
async def export_queries(admin=Depends(get_current_admin)):
    queries = await db.queries.find({}, {"_id": 0}).sort("created_at", -1).to_list(10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Name", "Email", "Phone", "Products", "Message", "Type", "Read"])
    for q in queries:
        products_str = "; ".join([
            f"{p.get('product_name', '')} ({p.get('colour_selected', '')})"
            for p in q.get("products", [])
        ])
        writer.writerow([
            q.get("created_at", ""), q.get("customer_name", ""),
            q.get("email", ""), q.get("phone", ""),
            products_str, q.get("message", ""),
            q.get("type", ""), "Yes" if q.get("is_read") else "No"
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=queries_export.csv"}
    )


# ==================== CONTACT ROUTE ====================
@api_router.post("/contact")
async def create_contact(contact: ContactCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "customer_name": contact.name,
        "email": contact.email,
        "phone": contact.phone,
        "message": contact.message,
        "products": [],
        "type": "contact",
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.queries.insert_one(doc)
    logger.info(f"[EMAIL MOCK] Contact from {contact.name} ({contact.email})")
    return {"message": "Your message has been sent successfully."}


# ==================== DASHBOARD ROUTE ====================
@api_router.get("/dashboard/stats")
async def dashboard_stats(admin=Depends(get_current_admin)):
    total_products = await db.products.count_documents({})
    total_categories = await db.categories.count_documents({})
    total_queries = await db.queries.count_documents({})
    unread_queries = await db.queries.count_documents({"is_read": False})

    now = datetime.now(timezone.utc)
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_queries = []
    for i in range(5, -1, -1):
        m = now.month - i
        y = now.year
        while m <= 0:
            m += 12
            y -= 1
        ms = datetime(y, m, 1, tzinfo=timezone.utc).isoformat()
        nm = m + 1
        ny = y
        if nm > 12:
            nm = 1
            ny += 1
        me = datetime(ny, nm, 1, tzinfo=timezone.utc).isoformat()
        count = await db.queries.count_documents({"created_at": {"$gte": ms, "$lt": me}})
        monthly_queries.append({"month": month_names[m - 1], "count": count})

    top_queried = await db.products.find(
        {}, {"_id": 0, "name": 1, "queries_count": 1}
    ).sort("queries_count", -1).limit(5).to_list(5)

    top_viewed = await db.products.find(
        {}, {"_id": 0, "name": 1, "views_count": 1}
    ).sort("views_count", -1).limit(5).to_list(5)

    recent_queries = await db.queries.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_queries": total_queries,
        "unread_queries": unread_queries,
        "monthly_queries": monthly_queries,
        "top_queried": top_queried,
        "top_viewed": top_viewed,
        "recent_queries": recent_queries
    }


# ==================== SETTINGS ROUTES ====================
def get_default_settings():
    return {
        "id": "settings",
        "whatsapp_number": os.environ.get("WHATSAPP_NUMBER", "87766986473"),
        "phone_number": os.environ.get("WHATSAPP_NUMBER", "87766986473"),
        "email": "info@shraddhaenterprises.com",
        "company_name": "Shraddha Enterprises",
        "address": "Indradhanu, Sector No. 21, Scheme No. 4, Plot No. 78, Yamunanagar, Nigdi, Pune - 411044, Maharashtra, India",
        "tagline": "Your trusted partner for quality industrial & electrical products",
        "social_links": {},
        "google_maps_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.436!2d73.7689!3d18.6518!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e76c8fa205%3A0x0!2sNigdi%2C+Pune!5e0!3m2!1sen!2sin!4v1609459200000"
    }

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if not settings:
        return get_default_settings()
    return settings

@api_router.put("/settings")
async def update_settings(settings: SettingsUpdate, admin=Depends(get_current_admin)):
    data = settings.model_dump()
    data["id"] = "settings"
    await db.settings.update_one({"id": "settings"}, {"$set": data}, upsert=True)
    updated = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    return updated


# ==================== TESTIMONIALS ROUTE ====================
@api_router.get("/testimonials")
async def list_testimonials():
    testimonials = await db.testimonials.find({"is_visible": True}, {"_id": 0}).to_list(50)
    return testimonials


# ==================== FILE UPLOAD ====================
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    allowed = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
    filename = f"{uuid.uuid4()}{ext}"
    filepath = UPLOAD_DIR / filename
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    with open(filepath, "wb") as f:
        f.write(content)
    return {"url": f"/api/uploads/{filename}", "filename": filename}


# ==================== SEED DATA ====================
async def seed_data():
    # Seed admin
    existing_admin = await db.admins.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing_admin:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing_admin["password_hash"]):
        await db.admins.update_one(
            {"email": ADMIN_EMAIL.lower()},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}}
        )

    # Seed settings
    if not await db.settings.find_one({"id": "settings"}):
        await db.settings.insert_one(get_default_settings())

    # Seed categories
    if await db.categories.count_documents({}) == 0:
        cats = [
            {"id": str(uuid.uuid4()), "name": "Crimping Tools", "subcategories": [
                {"id": str(uuid.uuid4()), "name": "Ferrule Crimping"},
                {"id": str(uuid.uuid4()), "name": "Terminal Crimping"},
                {"id": str(uuid.uuid4()), "name": "Hydraulic Crimping"}
            ]},
            {"id": str(uuid.uuid4()), "name": "Cable Accessories", "subcategories": [
                {"id": str(uuid.uuid4()), "name": "Cable Ties"},
                {"id": str(uuid.uuid4()), "name": "Cable Glands"},
                {"id": str(uuid.uuid4()), "name": "Cable Markers"}
            ]},
            {"id": str(uuid.uuid4()), "name": "Electrical Components", "subcategories": [
                {"id": str(uuid.uuid4()), "name": "Circuit Breakers"},
                {"id": str(uuid.uuid4()), "name": "Contactors"},
                {"id": str(uuid.uuid4()), "name": "Relays"}
            ]},
            {"id": str(uuid.uuid4()), "name": "Safety Equipment", "subcategories": [
                {"id": str(uuid.uuid4()), "name": "Safety Gloves"},
                {"id": str(uuid.uuid4()), "name": "Safety Helmets"},
                {"id": str(uuid.uuid4()), "name": "Safety Goggles"}
            ]}
        ]
        await db.categories.insert_many(cats)
        logger.info("Categories seeded")

        # Seed products
        cat_map = {c["name"]: c for c in cats}
        img1 = "https://images.unsplash.com/photo-1759830337357-29c472b6746c?w=600"
        img2 = "https://images.unsplash.com/photo-1773952136583-5175e906267c?w=600"
        img3 = "https://images.unsplash.com/photo-1758101755915-462eddc23f57?w=600"

        products = [
            {
                "id": str(uuid.uuid4()), "name": "Ferrule Crimping Tool TP-70E",
                "slug": "ferrule-crimping-tool-tp-70e",
                "description": "Professional-grade ferrule crimping tool with ratchet mechanism for consistent crimps. Suitable for wire sizes 0.25mm to 70mm squared. Ergonomic PVC grip handles reduce fatigue during extended use.",
                "category_id": cat_map["Crimping Tools"]["id"],
                "subcategory_id": cat_map["Crimping Tools"]["subcategories"][0]["id"],
                "is_featured": True, "availability": "in_stock",
                "specifications": [
                    {"key": "Wire Range", "value": "0.25 - 70 mm"},
                    {"key": "Length", "value": "250 mm"},
                    {"key": "Weight", "value": "0.85 kg"},
                    {"key": "Material", "value": "Chrome Vanadium Steel"},
                    {"key": "Handle", "value": "Ergonomic PVC Grip"}
                ],
                "colour_variants": [
                    {"colour_name": "Orange", "hex_code": "#f97316", "images": [img1]},
                    {"colour_name": "Black", "hex_code": "#1a1a2e", "images": [img2]},
                    {"colour_name": "Blue", "hex_code": "#2563eb", "images": [img3]}
                ],
                "views_count": 156, "queries_count": 23,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "name": "Hydraulic Crimping Tool HC-300",
                "slug": "hydraulic-crimping-tool-hc-300",
                "description": "Heavy-duty hydraulic crimping tool for large cable lugs and connectors. 300kN crimping force with safety valve protection. Comes with complete die set.",
                "category_id": cat_map["Crimping Tools"]["id"],
                "subcategory_id": cat_map["Crimping Tools"]["subcategories"][2]["id"],
                "is_featured": True, "availability": "in_stock",
                "specifications": [
                    {"key": "Crimping Force", "value": "300 kN"},
                    {"key": "Range", "value": "16 - 300 mm"},
                    {"key": "Weight", "value": "5.2 kg"},
                    {"key": "Pump Type", "value": "Manual Hydraulic"}
                ],
                "colour_variants": [
                    {"colour_name": "Red", "hex_code": "#dc2626", "images": [img2]},
                    {"colour_name": "Black", "hex_code": "#1a1a2e", "images": [img1]}
                ],
                "views_count": 98, "queries_count": 15,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "name": "Terminal Crimping Plier CT-25",
                "slug": "terminal-crimping-plier-ct-25",
                "description": "Precision terminal crimping plier for insulated and non-insulated terminals. Three crimping zones for different terminal sizes. Spring-loaded handles for easy operation.",
                "category_id": cat_map["Crimping Tools"]["id"],
                "subcategory_id": cat_map["Crimping Tools"]["subcategories"][1]["id"],
                "is_featured": False, "availability": "in_stock",
                "specifications": [
                    {"key": "Terminal Range", "value": "0.5 - 6 mm"},
                    {"key": "Length", "value": "220 mm"},
                    {"key": "Weight", "value": "0.35 kg"}
                ],
                "colour_variants": [
                    {"colour_name": "Yellow", "hex_code": "#eab308", "images": [img3]},
                    {"colour_name": "Red", "hex_code": "#dc2626", "images": [img1]}
                ],
                "views_count": 67, "queries_count": 8,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "name": "Nylon Cable Ties 300mm Pack",
                "slug": "nylon-cable-ties-300mm",
                "description": "High-quality UV-resistant nylon cable ties. Self-locking mechanism ensures secure fastening. Pack of 100 pieces. Operating temperature -40 to 85 degrees C.",
                "category_id": cat_map["Cable Accessories"]["id"],
                "subcategory_id": cat_map["Cable Accessories"]["subcategories"][0]["id"],
                "is_featured": False, "availability": "in_stock",
                "specifications": [
                    {"key": "Length", "value": "300 mm"},
                    {"key": "Width", "value": "4.8 mm"},
                    {"key": "Material", "value": "Nylon 66"},
                    {"key": "Pack Size", "value": "100 pcs"},
                    {"key": "Tensile Strength", "value": "22 kg"}
                ],
                "colour_variants": [
                    {"colour_name": "White", "hex_code": "#f8fafc", "images": [img1]},
                    {"colour_name": "Black", "hex_code": "#1a1a2e", "images": [img2]}
                ],
                "views_count": 234, "queries_count": 5,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "name": "Brass Cable Gland PG-16",
                "slug": "brass-cable-gland-pg-16",
                "description": "Industrial brass cable gland with nickel plating for corrosion resistance. IP68 rated waterproof entry. Includes locknut and washer. Ideal for panel and junction box applications.",
                "category_id": cat_map["Cable Accessories"]["id"],
                "subcategory_id": cat_map["Cable Accessories"]["subcategories"][1]["id"],
                "is_featured": True, "availability": "in_stock",
                "specifications": [
                    {"key": "Thread Size", "value": "PG 16"},
                    {"key": "Cable Range", "value": "10 - 14 mm"},
                    {"key": "Material", "value": "Brass (Nickel Plated)"},
                    {"key": "IP Rating", "value": "IP68"}
                ],
                "colour_variants": [
                    {"colour_name": "Brass", "hex_code": "#d4a017", "images": [img3]},
                    {"colour_name": "Silver", "hex_code": "#94a3b8", "images": [img2]}
                ],
                "views_count": 112, "queries_count": 18,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "name": "MCB Circuit Breaker 32A",
                "slug": "mcb-circuit-breaker-32a",
                "description": "Miniature circuit breaker with C-curve tripping characteristic. 10kA breaking capacity. DIN rail mountable. Suitable for commercial and industrial applications.",
                "category_id": cat_map["Electrical Components"]["id"],
                "subcategory_id": cat_map["Electrical Components"]["subcategories"][0]["id"],
                "is_featured": True, "availability": "in_stock",
                "specifications": [
                    {"key": "Current Rating", "value": "32A"},
                    {"key": "Poles", "value": "3 Pole"},
                    {"key": "Breaking Capacity", "value": "10 kA"},
                    {"key": "Curve Type", "value": "C-Curve"},
                    {"key": "Mounting", "value": "DIN Rail"}
                ],
                "colour_variants": [
                    {"colour_name": "White", "hex_code": "#f8fafc", "images": [img2]},
                    {"colour_name": "Gray", "hex_code": "#6b7280", "images": [img1]}
                ],
                "views_count": 189, "queries_count": 31,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "name": "AC Contactor LC1-D25",
                "slug": "ac-contactor-lc1-d25",
                "description": "3-pole AC contactor rated 25A with 1NO+1NC auxiliary contacts. Coil voltage 220V AC. Compact design for motor control and lighting applications.",
                "category_id": cat_map["Electrical Components"]["id"],
                "subcategory_id": cat_map["Electrical Components"]["subcategories"][1]["id"],
                "is_featured": False, "availability": "on_order",
                "specifications": [
                    {"key": "Current Rating", "value": "25A"},
                    {"key": "Coil Voltage", "value": "220V AC"},
                    {"key": "Poles", "value": "3P + 1NO + 1NC"},
                    {"key": "Mounting", "value": "DIN Rail"}
                ],
                "colour_variants": [
                    {"colour_name": "Black", "hex_code": "#1a1a2e", "images": [img1]},
                    {"colour_name": "Green", "hex_code": "#16a34a", "images": [img3]}
                ],
                "views_count": 76, "queries_count": 12,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()), "name": "Insulated Safety Gloves Class 2",
                "slug": "insulated-safety-gloves-class-2",
                "description": "Electrical insulated safety gloves rated for voltages up to 17,000V. Natural rubber construction with rolled cuff. Tested per IEC 60903 standards.",
                "category_id": cat_map["Safety Equipment"]["id"],
                "subcategory_id": cat_map["Safety Equipment"]["subcategories"][0]["id"],
                "is_featured": False, "availability": "contact",
                "specifications": [
                    {"key": "Class", "value": "Class 2"},
                    {"key": "Max Voltage", "value": "17,000V"},
                    {"key": "Material", "value": "Natural Rubber"},
                    {"key": "Standard", "value": "IEC 60903"},
                    {"key": "Length", "value": "360 mm"}
                ],
                "colour_variants": [
                    {"colour_name": "Yellow", "hex_code": "#eab308", "images": [img3]},
                    {"colour_name": "Orange", "hex_code": "#f97316", "images": [img1]}
                ],
                "views_count": 45, "queries_count": 6,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.products.insert_many(products)
        logger.info(f"Seeded {len(products)} products")

    # Seed testimonials
    if await db.testimonials.count_documents({}) == 0:
        testimonials = [
            {
                "id": str(uuid.uuid4()),
                "customer_name": "Rajesh Patil",
                "company": "Patil Electrical Works",
                "quote": "Excellent quality products and prompt delivery. We have been working with Shraddha Enterprises for over 5 years and they never disappoint.",
                "rating": 5,
                "photo": "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?w=100",
                "is_visible": True
            },
            {
                "id": str(uuid.uuid4()),
                "customer_name": "Sunil Kumar",
                "company": "Kumar Industries Pvt Ltd",
                "quote": "Best prices for crimping tools in Pune. Their technical support team is very knowledgeable and always ready to help with product selection.",
                "rating": 5,
                "photo": "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?w=100",
                "is_visible": True
            },
            {
                "id": str(uuid.uuid4()),
                "customer_name": "Priya Deshmukh",
                "company": "Deshmukh Engineering Solutions",
                "quote": "Wide range of cable accessories and safety equipment. Their bulk pricing is very competitive. Highly recommend for industrial supplies.",
                "rating": 4,
                "photo": "https://images.unsplash.com/photo-1769636929388-99eff95d3bf1?w=100",
                "is_visible": True
            }
        ]
        await db.testimonials.insert_many(testimonials)
        logger.info("Testimonials seeded")

    # Create indexes
    await db.admins.create_index("email", unique=True)
    await db.products.create_index("category_id")
    await db.products.create_index("name")
    await db.queries.create_index("created_at")

    # Write test credentials
    # Write test credentials
    try:
        os.makedirs("/app/memory", exist_ok=True)
        with open("/app/memory/test_credentials.md", "w") as f:
            f.write("# Test Credentials\n\n")
            f.write(f"- Email: {ADMIN_EMAIL}\n")
            f.write(f"- Password: {ADMIN_PASSWORD}\n")
    except Exception:
        pass
# ── FEEDBACK ──────────────────────────────────────────────────

class FeedbackModel(BaseModel):
    name: str
    location: Optional[str] = ""
    product: Optional[str] = ""
    comment: Optional[str] = ""
    tags: Optional[list] = []
    rating: Optional[int] = 0
    date: Optional[str] = ""
    is_approved: Optional[bool] = False

@api_router.post("/feedback")
async def submit_feedback(feedback: FeedbackModel):
    doc = feedback.dict()
    doc["id"] = str(uuid.uuid4())
    doc["is_approved"] = True  # auto approved — shows immediately
    doc["date"] = datetime.now(timezone.utc).strftime("%d %b %Y")
    await db.feedback.insert_one(doc)
    return {"message": "Feedback submitted successfully"}

@api_router.get("/feedback")
async def get_feedback():
    items = await db.feedback.find(
        {"is_approved": True}, {"_id": 0}
    ).sort("date", -1).to_list(100)
    return items

@api_router.get("/feedback/stats")
async def get_feedback_stats():
    items = await db.feedback.find(
        {"is_approved": True}, {"_id": 0}
    ).to_list(1000)

    original_ratings = [5,4,4,4,5,4,5,4,5,4,5,5,5,5,3,3,3,2,2]
    original_total = len(original_ratings)
    original_sum = sum(original_ratings)

    backend_ratings = [f.get("rating", 0) for f in items if f.get("rating", 0) > 0]
    backend_total = len(backend_ratings)
    backend_sum = sum(backend_ratings)

    total = original_total + backend_total
    total_sum = original_sum + backend_sum
    avg = round(total_sum / total, 1) if total > 0 else 0

    all_ratings = original_ratings + backend_ratings
    dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in all_ratings:
        if 1 <= r <= 5:
            dist[r] += 1

    return {
        "avg": avg,
        "total": total,
        "dist": dist,
        "satisfaction": round((avg / 5) * 100),
        "response": round((avg / 5) * 100 - 1),
        "delivery": round((avg / 5) * 100 - 1),
    }

@api_router.get("/admin/feedback")
async def get_all_feedback(admin=Depends(get_current_admin)):
    items = await db.feedback.find({}, {"_id": 0}).sort("date", -1).to_list(200)
    return items

@api_router.patch("/admin/feedback/{feedback_id}/approve")
async def approve_feedback(feedback_id: str, admin=Depends(get_current_admin)):
    result = await db.feedback.update_one(
        {"id": feedback_id},
        {"$set": {"is_approved": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return {"message": "Feedback approved"}

@api_router.delete("/admin/feedback/{feedback_id}")
async def delete_feedback(feedback_id: str, admin=Depends(get_current_admin)):
    await db.feedback.delete_one({"id": feedback_id})
    return {"message": "Feedback deleted"}

@app.on_event("startup")
async def startup():
    await seed_data()
    logger.info("Server started successfully")

@app.on_event("shutdown")
async def shutdown():
    client.close()

# Include router
app.include_router(api_router)

# Mount uploads directory
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
