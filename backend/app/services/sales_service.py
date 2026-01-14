from typing import List, Optional
from beanie import PydanticObjectId
from ..models.sales import (
    Quotation, SalesOrder, Invoice, SalesItem, 
    QuotationStatus, SalesOrderStatus, InvoiceStatus
)
from ..models.sequence import get_next_sequence_number
from ..models.item import Item
from ..models.tax import Tax
from ..models.customer import Customer
from ..repositories.sales_repos import quotation_repo, sales_order_repo, invoice_repo
from ..schemas.sales import QuotationCreate, SalesOrderCreate, InvoiceCreate, SalesItemBase

class SalesService:
    async def _calculate_totals(self, items_in: List[SalesItemBase], company_id: PydanticObjectId):
        """
        Calculates line totals and tax totals for a list of items.
        """
        processed_items = []
        subtotal = 0.0
        tax_total = 0.0

        for item_data in items_in:
            # Fetch item master for name and unit
            item_master = await Item.get(item_data.item_id)
            if not item_master:
                continue
            
            # Subtotal for this line
            line_subtotal = item_data.qty * item_data.price
            
            # Calculate taxes
            line_tax_amount = 0.0
            for tax_id in item_data.tax_ids:
                tax_master = await Tax.get(tax_id)
                if tax_master:
                    line_tax_amount += (line_subtotal * (tax_master.rate / 100))
            
            line_total = line_subtotal + line_tax_amount
            
            processed_items.append(SalesItem(
                item_id=item_data.item_id,
                name=item_master.name,
                qty=item_data.qty,
                price=item_data.price,
                unit=item_master.unit,
                tax_ids=item_data.tax_ids,
                tax_amount=line_tax_amount,
                line_total=line_total
            ))
            
            subtotal += line_subtotal
            tax_total += line_tax_amount

        return processed_items, subtotal, tax_total, (subtotal + tax_total)

    async def create_quotation(self, q_in: QuotationCreate, company_id: PydanticObjectId) -> Quotation:
        customer = await Customer.get(q_in.customer_id)
        if not customer:
            raise Exception("Customer not found")

        items, subtotal, tax_total, grand_total = await self._calculate_totals(q_in.items, company_id)
        
        quote_number = await get_next_sequence_number(company_id, "quotation", "QT-")
        
        quotation = Quotation(
            company_id=company_id,
            quote_number=quote_number,
            customer_id=q_in.customer_id,
            customer_name=customer.name,
            items=items,
            subtotal=subtotal,
            tax_total=tax_total,
            grand_total=grand_total,
            valid_until=q_in.valid_until,
            notes=q_in.notes
        )
        await quotation.insert()
        return quotation

    async def create_sales_order(self, so_in: SalesOrderCreate, company_id: PydanticObjectId) -> SalesOrder:
        customer = await Customer.get(so_in.customer_id)
        if not customer:
            raise Exception("Customer not found")

        items, subtotal, tax_total, grand_total = await self._calculate_totals(so_in.items, company_id)
        
        order_number = await get_next_sequence_number(company_id, "sales_order", "SO-")
        
        sales_order = SalesOrder(
            company_id=company_id,
            order_number=order_number,
            customer_id=so_in.customer_id,
            customer_name=customer.name,
            items=items,
            subtotal=subtotal,
            tax_total=tax_total,
            grand_total=grand_total,
            quotation_id=so_in.quotation_id,
            notes=so_in.notes
        )
        await sales_order.insert()
        return sales_order

    async def create_invoice(self, inv_in: InvoiceCreate, company_id: PydanticObjectId) -> Invoice:
        customer = await Customer.get(inv_in.customer_id)
        if not customer:
            raise Exception("Customer not found")

        items, subtotal, tax_total, grand_total = await self._calculate_totals(inv_in.items, company_id)
        
        invoice_number = await get_next_sequence_number(company_id, "invoice", "INV-")
        
        invoice = Invoice(
            company_id=company_id,
            invoice_number=invoice_number,
            customer_id=inv_in.customer_id,
            customer_name=customer.name,
            items=items,
            subtotal=subtotal,
            tax_total=tax_total,
            grand_total=grand_total,
            sales_order_id=inv_in.sales_order_id,
            due_date=inv_in.due_date,
            notes=inv_in.notes
        )
        await invoice.insert()
        return invoice

sales_service = SalesService()
