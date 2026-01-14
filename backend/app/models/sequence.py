from datetime import datetime
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

class Sequence(Document):
    """
    Tracks auto-incrementing numbers for documents per company and entity type.
    Example: company_id='...', entity='quotation' -> current_value=5 (next is 6)
    """
    company_id: PydanticObjectId
    entity: str = Field(..., description="Entity type: quotation, sales_order, invoice, etc.")
    prefix: str = Field(..., description="Prefix for the number (e.g., 'QT-')")
    current_value: int = Field(default=0)
    padding: int = Field(default=4, description="Zero padding length (e.g., 4 -> 0001)")

    class Settings:
        name = "sequences"
        indexes = [
            [("company_id", 1), ("entity", 1)]  # Unique index will be handled by logic or Beanie unique=True
        ]

async def get_next_sequence_number(company_id: PydanticObjectId, entity: str, prefix: str) -> str:
    """
    Increments and returns the next formatted sequence number.
    Returns something like "QT-0001"
    """
    sequence = await Sequence.find_one(
        Sequence.company_id == company_id,
        Sequence.entity == entity
    )

    if not sequence:
        sequence = Sequence(
            company_id=company_id,
            entity=entity,
            prefix=prefix,
            current_value=1
        )
        await sequence.insert()
    else:
        sequence.current_value += 1
        await sequence.save()

    formatted_num = str(sequence.current_value).zfill(sequence.padding)
    return f"{sequence.prefix}{formatted_num}"
