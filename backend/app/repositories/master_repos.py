from .base import BaseRepository
from ..models.customer import Customer
from ..models.vendor import Vendor
from ..models.item import Item
from ..models.category import ItemCategory
from ..models.tax import Tax
from ..models.price_list import PriceList

class CustomerRepository(BaseRepository[Customer]):
    def __init__(self):
        super().__init__(Customer)

class VendorRepository(BaseRepository[Vendor]):
    def __init__(self):
        super().__init__(Vendor)

class ItemRepository(BaseRepository[Item]):
    def __init__(self):
        super().__init__(Item)

class CategoryRepository(BaseRepository[ItemCategory]):
    def __init__(self):
        super().__init__(ItemCategory)

class TaxRepository(BaseRepository[Tax]):
    def __init__(self):
        super().__init__(Tax)

class PriceListRepository(BaseRepository[PriceList]):
    def __init__(self):
        super().__init__(PriceList)

# Singletons for easier access
customer_repo = CustomerRepository()
vendor_repo = VendorRepository()
item_repo = ItemRepository()
category_repo = CategoryRepository()
tax_repo = TaxRepository()
price_list_repo = PriceListRepository()
