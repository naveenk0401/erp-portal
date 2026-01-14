from fastapi import HTTPException, status
from beanie import PydanticObjectId
from ..repositories.master_repos import (
    customer_repo, vendor_repo, item_repo, 
    category_repo, tax_repo, price_list_repo
)
from ..schemas.customer import CustomerCreate, CustomerUpdate
from ..schemas.vendor import VendorCreate, VendorUpdate
from ..schemas.item import ItemCreate, ItemUpdate
from ..schemas.category import ItemCategoryCreate, ItemCategoryUpdate
from ..schemas.tax import TaxCreate, TaxUpdate
from ..schemas.price_list import PriceListCreate, PriceListUpdate
from ..models.item import Item

class MasterService:
    async def create_customer(self, data: CustomerCreate):
        # Check for duplicate name in same company
        existing = await customer_repo.model.find_one(
            customer_repo.model.name == data.name,
            customer_repo.model.company_id == customer_repo._get_tenant_id()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Customer with this name already exists")
        return await customer_repo.create(data)

    async def create_vendor(self, data: VendorCreate):
        existing = await vendor_repo.model.find_one(
            vendor_repo.model.name == data.name,
            vendor_repo.model.company_id == vendor_repo._get_tenant_id()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Vendor with this name already exists")
        return await vendor_repo.create(data)

    async def create_category(self, data: ItemCategoryCreate):
        existing = await category_repo.model.find_one(
            category_repo.model.name == data.name,
            category_repo.model.company_id == category_repo._get_tenant_id()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
        return await category_repo.create(data)

    async def delete_category(self, id: PydanticObjectId):
        # BLOCK deletion if items exist
        items_count = await Item.find(Item.category_id == id).count()
        if items_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Cannot delete category as it contains items"
            )
        return await category_repo.deactivate(id)

    async def create_item(self, data: ItemCreate):
        # Rule: SERVICE cannot track inventory
        if data.item_type == "SERVICE" and data.track_inventory:
            data.track_inventory = False
        
        # Check duplicate name/SKU
        existing = await item_repo.model.find_one(
            item_repo.model.name == data.name,
            item_repo.model.company_id == item_repo._get_tenant_id()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Item with this name already exists")
            
        return await item_repo.create(data)

    async def update_item(self, id: PydanticObjectId, data: ItemUpdate):
        # Rule: SERVICE cannot track inventory
        if data.item_type == "SERVICE" and data.track_inventory:
            data.track_inventory = False
        return await item_repo.update(id, data)

master_service = MasterService()
