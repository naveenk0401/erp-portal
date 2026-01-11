from datetime import datetime
from beanie import Document, Link
from pydantic import Field
from app.models.user import User

class Salary(Document):
    user: Link[User]
    amount: float
    bonus: float = 0.0
    deductions: float = 0.0
    payment_date: datetime = Field(default_factory=datetime.utcnow)
    month: int
    year: int
    status: str = "paid" # paid, pending

    class Settings:
        name = "salaries"
