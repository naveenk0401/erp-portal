import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, PydanticObjectId
from app.core.config import settings
from app.models.user import User
from app.models.company import Company
from app.models.customer import Customer
from app.models.item import Item
from app.models.tax import Tax
from app.models.sequence import Sequence
from app.models.sales import Quotation, SalesOrder, Invoice, CreditNote
from app.services.sales_service import sales_service
from app.schemas.sales import QuotationCreate, SalesItemBase

async def test_sales_flow():
    print("🚀 Starting Sales Flow Test...")
    
    # 1. Init DB
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User, Company, Customer, Item, Tax, 
            Sequence, Quotation, SalesOrder, Invoice, CreditNote
        ]
    )

    # 2. Get Context
    user = await User.find_one(User.email == "Naveen@gmail.com")
    if not user or not user.active_company_id:
        print("❌ Test User not found or no active company")
        return
    
    cid = user.active_company_id
    print(f"✅ Context: User={user.email}, Company={cid}")

    # 3. Ensure Master Data
    customer = await Customer.find_one(Customer.company_id == cid)
    if not customer:
        customer = Customer(company_id=cid, name="Test Sales Customer", email="test@sales.com")
        await customer.insert()
        print("➕ Created Test Customer")

    item = await Item.find_one(Item.company_id == cid)
    if not item:
        item = Item(company_id=cid, name="Test Gadget", item_type="PRODUCT", unit="PCS", sale_price=1000)
        await item.insert()
        print("➕ Created Test Item")

    tax = await Tax.find_one(Tax.company_id == cid)
    if not tax:
        tax = Tax(company_id=cid, name="GST 18%", rate=18, tax_type="GST")
        await tax.insert()
        print("➕ Created Test Tax")

    # 4. Create Quotation
    print("\n📝 Creating Quotation...")
    q_in = QuotationCreate(
        customer_id=customer.id,
        items=[
            SalesItemBase(
                item_id=item.id,
                qty=2,
                price=item.sale_price,
                tax_ids=[tax.id]
            )
        ],
        notes="Test Quote via Script"
    )
    
    quote = await sales_service.create_quotation(q_in, cid)
    print(f"✅ Quotation Created: {quote.quote_number}")
    print(f"📊 Subtotal: {quote.subtotal}, Tax: {quote.tax_total}, Total: {quote.grand_total}")
    
    # Validation
    expected_subtotal = 2 * 1000
    expected_tax = expected_subtotal * 0.18
    if quote.subtotal != expected_subtotal or quote.tax_total != expected_tax:
        print(f"❌ Calculation mismatch! sub={quote.subtotal} (exp {expected_subtotal}), tax={quote.tax_total} (exp {expected_tax})")
    else:
        print("🎯 Calculations are PERFECT.")

    print("\n🏁 Sales Flow Test Complete!")

if __name__ == "__main__":
    asyncio.run(test_sales_flow())
