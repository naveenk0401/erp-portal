from .base import BaseRepository
from ..models.sales import Quotation, SalesOrder, Invoice, CreditNote
from ..models.sequence import Sequence

class QuotationRepository(BaseRepository[Quotation]):
    def __init__(self):
        super().__init__(Quotation)

class SalesOrderRepository(BaseRepository[SalesOrder]):
    def __init__(self):
        super().__init__(SalesOrder)

class InvoiceRepository(BaseRepository[Invoice]):
    def __init__(self):
        super().__init__(Invoice)

class CreditNoteRepository(BaseRepository[CreditNote]):
    def __init__(self):
        super().__init__(CreditNote)

class SequenceRepository(BaseRepository[Sequence]):
    def __init__(self):
        super().__init__(Sequence)

quotation_repo = QuotationRepository()
sales_order_repo = SalesOrderRepository()
invoice_repo = InvoiceRepository()
credit_note_repo = CreditNoteRepository()
sequence_repo = SequenceRepository()
