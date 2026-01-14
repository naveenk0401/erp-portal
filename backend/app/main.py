from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .core.config import settings
from .models.user import User
from .models.company import Company
from .models.file import FileMetadata
from .api.auth import router as auth_router
from .api.companies import router as companies_router
from .api.storage import router as storage_router
from .api.permissions import router as permissions_router
from .api.roles import router as roles_router
from .api.customers import router as customers_router
from .api.vendors import router as vendors_router
from .api.items import router as items_router
from .api.categories import router as categories_router
from .api.taxes import router as taxes_router
from .api.price_lists import router as price_lists_router
from .api.dashboard import router as dashboard_router
from .api.quotations import router as quotations_router
from .api.sales_orders import router as sales_orders_router
from .api.invoices import router as invoices_router
from .models.permission import Permission
from .models.role import Role
from .models.customer import Customer
from .models.vendor import Vendor
from .models.item import Item
from .models.category import ItemCategory
from .models.tax import Tax
from .models.price_list import PriceList
from .models.sequence import Sequence
from .models.sales import Quotation, SalesOrder, Invoice, CreditNote
from .core.middleware import AuthMiddleware

app = FastAPI(title=settings.PROJECT_NAME)
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")] if settings.ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

@app.on_event("startup")
async def startup_event():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User, Company, FileMetadata, Permission, Role,
            Customer, Vendor, Item, ItemCategory, Tax, PriceList,
            Sequence, Quotation, SalesOrder, Invoice, CreditNote
        ]
    )

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(companies_router, prefix="/companies", tags=["companies"])
api_router.include_router(storage_router, prefix="/storage", tags=["storage"])
api_router.include_router(permissions_router, prefix="/permissions", tags=["permissions"])
api_router.include_router(roles_router, prefix="/roles", tags=["roles"])
api_router.include_router(customers_router, prefix="/customers", tags=["customers"])
api_router.include_router(vendors_router, prefix="/vendors", tags=["vendors"])
api_router.include_router(items_router, prefix="/items", tags=["items"])
api_router.include_router(categories_router, prefix="/categories", tags=["categories"])
api_router.include_router(taxes_router, prefix="/taxes", tags=["taxes"])
api_router.include_router(price_lists_router, prefix="/price-lists", tags=["price-lists"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(quotations_router, prefix="/quotations", tags=["sales-quotations"])
api_router.include_router(sales_orders_router, prefix="/sales-orders", tags=["sales-orders"])
api_router.include_router(invoices_router, prefix="/invoices", tags=["sales-invoices"])

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the ERP Portal API"}
